// lib/controllers/order.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { OptionValue } from "../models/OptionValue";
import { OptionType } from "../models/OptionType";
import { Address } from "../models/Address";
import { User } from "../models/User";
import connectToDatabase from "../db/mongodb";
import mongoose from "mongoose";
import {
  buildOrderResponse,
  validateCreateOrder,
  ORDER_MESSAGES,
  OrderResponse,
  CreateOrderRequest,
} from "../utils/order";
import { OrderStatus, PaymentStatus } from "../models/enums";
import { buildPaginationParams, calculatePagination } from "../utils/common";
import { PaymentService } from "../services/payment/PaymentService";
import { emailService } from "../services/EmailService";

interface Response {
  success: boolean;
  message: string;
  order?: OrderResponse;
  orders?: OrderResponse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  clientSecret?: string;
  refundInfo?: {
    refundId?: string;
    amount: number;
    status: string;
  };
  statusCode: number | undefined;
}

// Create order from cart
export const createOrder = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const orderResponse: Response = {
    success: false,
    message: "",
    order: undefined,
    statusCode: 500,
  };

  const { addressId, paymentMethod }: CreateOrderRequest = req.body;

  // Validate request
  const validationErrors = validateCreateOrder({ addressId, paymentMethod });
  if (validationErrors.length > 0) {
    orderResponse.message = validationErrors.join(", ");
    orderResponse.statusCode = 400;
    return orderResponse;
  }

  // Check if payment method is available
  if (!PaymentService.isAvailable(paymentMethod)) {
    orderResponse.message = `Payment method '${paymentMethod}' is not available. Available methods: ${PaymentService.getAvailableMethods().join(
      ", "
    )}`;
    orderResponse.statusCode = 400;
    return orderResponse;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Get customer info for email
    const customer = await User.findById(customerId)
      .select("name email")
      .lean();
    if (!customer) {
      await session.abortTransaction();
      orderResponse.message = "Customer not found";
      orderResponse.statusCode = 404;
      return orderResponse;
    }

    // Get customer's cart with populated products and selected options
    const cart = await Cart.findOne({ customerId })
      .populate("products.productId")
      .populate("products.selectedOptions")
      .session(session);

    if (!cart || cart.products.length === 0) {
      await session.abortTransaction();
      orderResponse.message = ORDER_MESSAGES.EMPTY_CART;
      orderResponse.statusCode = 400;
      return orderResponse;
    }

    // Get address
    const address = await Address.findOne({
      _id: addressId,
      customerId,
    }).session(session);

    if (!address) {
      await session.abortTransaction();
      orderResponse.message = ORDER_MESSAGES.ADDRESS_NOT_FOUND;
      orderResponse.statusCode = 404;
      return orderResponse;
    }

    // Verify stock and calculate total
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of cart.products) {
      const product = item.productId as any;

      if (!product || product.deletedAt) {
        await session.abortTransaction();
        orderResponse.message = `Product ${
          product?.name || "unknown"
        } is no longer available`;
        orderResponse.statusCode = 400;
        return orderResponse;
      }

      // Calculate effective price and stock based on selected options
      let effectivePrice = product.price;
      let effectiveStock = product.stock;
      const selectedOptionsData: Array<{
        optionValueId: mongoose.Types.ObjectId;
        optionTypeName: string;
        value: string;
        price: number;
      }> = [];

      if (item.selectedOptions && item.selectedOptions.length > 0) {
        for (const optionValueRef of item.selectedOptions) {
          const optionValue = optionValueRef as any; // Cast to any for populated document

          if (!optionValue || optionValue.deletedAt) {
            await session.abortTransaction();
            orderResponse.message = `Selected option for ${product.name} is no longer available`;
            orderResponse.statusCode = 400;
            return orderResponse;
          }

          effectivePrice += optionValue.price;
          effectiveStock = Math.min(effectiveStock, optionValue.stock);

          // Get option type name
          const optionType = await OptionType.findById(
            optionValue.optionTypeId
          ).session(session);

          selectedOptionsData.push({
            optionValueId: optionValue._id,
            optionTypeName: optionType?.name || "",
            value: optionValue.value,
            price: optionValue.price,
          });
        }
      }

      if (effectiveStock < item.quantity) {
        await session.abortTransaction();
        orderResponse.message = `${ORDER_MESSAGES.INSUFFICIENT_STOCK}. ${product.name} has only ${effectiveStock} in stock`;
        orderResponse.statusCode = 400;
        return orderResponse;
      }

      const subtotal = effectivePrice * item.quantity;
      totalAmount += subtotal;

      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: effectivePrice,
        name: product.name,
        img: product.img,
        selectedOptions:
          selectedOptionsData.length > 0 ? selectedOptionsData : undefined,
      });

      // Reduce product stock
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { stock: -item.quantity } },
        { session }
      );

      // Reduce option values stock if selected
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        for (const optionValueRef of item.selectedOptions) {
          const optionValue = optionValueRef as any;
          await OptionValue.findByIdAndUpdate(
            optionValue._id,
            { $inc: { stock: -item.quantity } },
            { session }
          );
        }
      }
    }

    totalAmount = Math.round(totalAmount * 100) / 100;

    // Create order
    const newOrder = await Order.create(
      [
        {
          customerId,
          datetime: new Date(),
          totalAmount,
          products: orderProducts,
          address: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`,
          status: OrderStatus.PENDING,
        },
      ],
      { session }
    );

    // Create payment using PaymentService (Strategy Pattern)
    const paymentResult = await PaymentService.createPayment(
      paymentMethod,
      totalAmount,
      {
        orderId: newOrder[0]._id,
        customerId: customerId,
      }
    );

    if (!paymentResult.success) {
      await session.abortTransaction();
      orderResponse.message =
        paymentResult.error || ORDER_MESSAGES.PAYMENT_FAILED;
      orderResponse.statusCode = 400;
      return orderResponse;
    }

    // Create payment record
    const newPayment = await Payment.create(
      [
        {
          orderId: newOrder[0]._id,
          method: paymentMethod,
          date: new Date(),
          status: paymentResult.status,
          amount: totalAmount,
          paymentId: paymentResult.paymentId || null,
        },
      ],
      { session }
    );

    // Clear cart
    await Cart.findOneAndUpdate(
      { customerId },
      { $set: { products: [], totalAmount: 0 } },
      { session }
    );

    await session.commitTransaction();

    orderResponse.order = buildOrderResponse(newOrder[0], newPayment[0]);
    orderResponse.success = true;
    orderResponse.message = ORDER_MESSAGES.CREATED;
    orderResponse.statusCode = 201;

    // Include client secret if payment method provides one (e.g., Stripe)
    if (paymentResult.clientSecret) {
      orderResponse.clientSecret = paymentResult.clientSecret;
    }

    // Send order confirmation email (don't await - send async)
    emailService
      .sendOrderConfirmation(customer.email, {
        customerName: customer.name,
        orderId: newOrder[0]._id.toString(),
        status: newOrder[0].status,
      })
      .catch((err) =>
        console.error("Failed to send order confirmation email:", err)
      );

    return orderResponse;
  } catch (err) {
    await session.abortTransaction();
    console.error("Create order error:", err);
    orderResponse.message = "Internal server error";
    orderResponse.statusCode = 500;
    return orderResponse;
  } finally {
    session.endSession();
  }
};

// List customer orders
export const listOrders = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const orderResponse: Response = {
    success: false,
    message: "",
    orders: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    statusCode: 500,
  };

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);
    const params = buildPaginationParams(req.query);
    const { pageNum, limitNum, skip } = calculatePagination(
      params.page,
      params.limit,
      0
    );

    const filter: any = { customerId };

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ datetime: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      Order.countDocuments(filter),
    ]);

    // Get payments for all orders
    const orderIds = orders.map((o) => o._id);
    const payments = await Payment.find({ orderId: { $in: orderIds } })
      .lean()
      .exec();

    const paymentMap = new Map();
    payments.forEach((p) => paymentMap.set(p.orderId.toString(), p));

    const responseOrders = orders.map((order) => {
      const payment = paymentMap.get(order._id.toString());
      return buildOrderResponse(order, payment);
    });

    const finalPagination = calculatePagination(
      params.page,
      params.limit,
      total
    );

    orderResponse.orders = responseOrders;
    orderResponse.pagination = finalPagination.pagination;
    orderResponse.success = true;
    orderResponse.message = ORDER_MESSAGES.LIST_RETRIEVED;
    orderResponse.statusCode = 200;

    return orderResponse;
  } catch (err) {
    console.error("List orders error:", err);
    orderResponse.message = "Internal server error";
    orderResponse.statusCode = 500;
    return orderResponse;
  }
};

// Get single order
export const getOrder = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const orderResponse: Response = {
    success: false,
    message: "",
    order: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    const order = await Order.findOne({
      _id: id,
      customerId,
    })
      .lean()
      .exec();

    if (!order) {
      orderResponse.message = ORDER_MESSAGES.ORDER_NOT_FOUND;
      orderResponse.statusCode = 404;
      return orderResponse;
    }

    const payment = await Payment.findOne({ orderId: order._id }).lean().exec();

    if (!payment) {
      orderResponse.message = "Payment information not found";
      orderResponse.statusCode = 404;
      return orderResponse;
    }

    orderResponse.order = buildOrderResponse(order, payment);
    orderResponse.success = true;
    orderResponse.message = ORDER_MESSAGES.RETRIEVED;
    orderResponse.statusCode = 200;

    return orderResponse;
  } catch (err) {
    console.error("Get order error:", err);
    orderResponse.message = "Internal server error";
    orderResponse.statusCode = 500;
    return orderResponse;
  }
};

// Cancel order
export const cancelOrder = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const orderResponse: Response = {
    success: false,
    message: "",
    order: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Get customer info for email
    const customer = await User.findById(customerId)
      .select("name email")
      .lean();
    if (!customer) {
      await session.abortTransaction();
      orderResponse.message = "Customer not found";
      orderResponse.statusCode = 404;
      return orderResponse;
    }

    const order = await Order.findOne({
      _id: id,
      customerId,
    }).session(session);

    if (!order) {
      await session.abortTransaction();
      orderResponse.message = ORDER_MESSAGES.ORDER_NOT_FOUND;
      orderResponse.statusCode = 404;
      return orderResponse;
    }

    // Check if order can be cancelled
    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PROCESSING
    ) {
      await session.abortTransaction();
      orderResponse.message = ORDER_MESSAGES.CANNOT_CANCEL;
      orderResponse.statusCode = 400;
      return orderResponse;
    }

    // Get payment information
    const payment = await Payment.findOne({ orderId: order._id }).session(
      session
    );

    if (!payment) {
      await session.abortTransaction();
      orderResponse.message = "Payment information not found";
      orderResponse.statusCode = 404;
      return orderResponse;
    }

    // Process refund if payment was completed using PaymentService
    let refundInfo = undefined;
    if (payment.status === PaymentStatus.COMPLETED && payment.paymentId) {
      const refundResult = await PaymentService.processRefund(
        payment.method,
        payment.paymentId,
        payment.amount,
        {
          orderId: order._id,
        }
      );

      if (!refundResult.success) {
        await session.abortTransaction();
        orderResponse.message = `Refund failed: ${refundResult.error}`;
        orderResponse.statusCode = 400;
        return orderResponse;
      }

      refundInfo = {
        refundId: refundResult.refundId,
        amount: refundResult.amount,
        status: refundResult.status,
      };

      await Payment.findByIdAndUpdate(
        payment._id,
        { status: PaymentStatus.REFUNDED },
        { session }
      );
    } else if (payment.status === PaymentStatus.PENDING) {
      // For pending payments (like cash), just mark as cancelled
      await Payment.findByIdAndUpdate(
        payment._id,
        { status: PaymentStatus.CANCELLED },
        { session }
      );
    }

    // Restore product stock AND option values stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { session }
      );

      // Restore option values stock if any were selected
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        for (const option of item.selectedOptions) {
          await OptionValue.findByIdAndUpdate(
            option.optionValueId,
            { $inc: { stock: item.quantity } },
            { session }
          );
        }
      }
    }

    // Update order status
    await Order.findByIdAndUpdate(
      order._id,
      { status: OrderStatus.CANCELLED },
      { session }
    );

    await session.commitTransaction();

    const updatedPayment = await Payment.findOne({ orderId: order._id });
    const updatedOrder = await Order.findById(order._id);

    orderResponse.order = buildOrderResponse(updatedOrder!, updatedPayment!);
    orderResponse.success = true;
    orderResponse.message = ORDER_MESSAGES.CANCELLED;
    orderResponse.statusCode = 200;

    if (refundInfo) {
      orderResponse.refundInfo = refundInfo;
    }

    // Send cancellation email (don't await - send async)
    emailService
      .sendOrderCancellation(customer.email, {
        customerName: customer.name,
        orderId: order._id.toString(),
        status: OrderStatus.CANCELLED,
      })
      .catch((err) => console.error("Failed to send cancellation email:", err));

    return orderResponse;
  } catch (err) {
    await session.abortTransaction();
    console.error("Cancel order error:", err);
    orderResponse.message = "Internal server error";
    orderResponse.statusCode = 500;
    return orderResponse;
  } finally {
    session.endSession();
  }
};
