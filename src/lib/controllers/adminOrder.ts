// lib/controllers/adminOrder.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { Product } from "../models/Product";
import { User } from "../models/User";
import connectToDatabase from "../db/mongodb";
import mongoose from "mongoose";
import {
  buildOrderResponse,
  ORDER_MESSAGES,
  OrderResponse,
} from "../utils/order";
import { OrderStatus, PaymentStatus } from "../models/enums";
import { buildPaginationParams, calculatePagination } from "../utils/common";
import { PaymentService } from "../services/payment/PaymentService";
import { emailService } from "../services/EmailService";

interface AdminOrderResponse {
  success: boolean;
  message: string;
  order?: OrderResponse;
  orders?: OrderResponse[];
  stats?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  refundInfo?: {
    refundId?: string;
    amount: number;
    status: string;
  };
  statusCode: number;
}

// Build admin-specific filter
const buildAdminOrderFilter = (query: any) => {
  const filter: any = {};

  // Filter by customer
  if (query.customerId && mongoose.Types.ObjectId.isValid(query.customerId)) {
    filter.customerId = query.customerId;
  }

  // Filter by status
  if (query.status && Object.values(OrderStatus).includes(query.status)) {
    filter.status = query.status;
  }

  // Filter by date range
  if (query.startDate || query.endDate) {
    filter.datetime = {};
    if (query.startDate) {
      filter.datetime.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      filter.datetime.$lte = new Date(query.endDate);
    }
  }

  // Filter by amount range
  if (query.minAmount) {
    filter.totalAmount = {
      ...filter.totalAmount,
      $gte: parseFloat(query.minAmount),
    };
  }
  if (query.maxAmount) {
    filter.totalAmount = {
      ...filter.totalAmount,
      $lte: parseFloat(query.maxAmount),
    };
  }

  // Search in address
  if (query.search) {
    filter.address = { $regex: query.search, $options: "i" };
  }

  return filter;
};

// Build sort object
const buildAdminOrderSort = (query: any): Record<string, 1 | -1> => {
  const sortBy = query.sortBy || "datetime";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  const validSortFields = ["datetime", "totalAmount", "status", "createdAt"];
  if (!validSortFields.includes(sortBy)) {
    return { datetime: -1 as const };
  }

  return { [sortBy]: sortOrder };
};

// List all orders (Admin)
export const adminListOrders = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<AdminOrderResponse> => {
  await connectToDatabase();

  const orderResponse: AdminOrderResponse = {
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
    const params = buildPaginationParams(req.query);
    const { pageNum, limitNum, skip } = calculatePagination(
      params.page,
      params.limit,
      0
    );

    const filter = buildAdminOrderFilter(req.query);
    const sort = buildAdminOrderSort(req.query);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate("customerId", "name email")
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

    // Calculate statistics
    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
          totalOrders: { $sum: 1 },
          statusCounts: { $push: "$status" },
        },
      },
    ]);

    const statusBreakdown: Record<string, number> = {};
    Object.values(OrderStatus).forEach((status) => {
      statusBreakdown[status] = 0;
    });

    if (stats[0]?.statusCounts) {
      stats[0].statusCounts.forEach((status: string) => {
        statusBreakdown[status]++;
      });
    }

    orderResponse.orders = responseOrders;
    orderResponse.pagination = finalPagination.pagination;
    orderResponse.stats = {
      totalRevenue: stats[0]?.totalRevenue
        ? Math.round(stats[0].totalRevenue * 100) / 100
        : 0,
      avgOrderValue: stats[0]?.avgOrderValue
        ? Math.round(stats[0].avgOrderValue * 100) / 100
        : 0,
      totalOrders: stats[0]?.totalOrders || 0,
      statusBreakdown,
    };
    orderResponse.success = true;
    orderResponse.message = ORDER_MESSAGES.LIST_RETRIEVED;
    orderResponse.statusCode = 200;

    return orderResponse;
  } catch (err) {
    console.error("Admin list orders error:", err);
    orderResponse.message = "Internal server error";
    orderResponse.statusCode = 500;
    return orderResponse;
  }
};

// Get single order (Admin)
export const adminGetOrder = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<AdminOrderResponse> => {
  await connectToDatabase();

  const orderResponse: AdminOrderResponse = {
    success: false,
    message: "",
    order: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  try {
    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      orderResponse.message = "Invalid order ID";
      orderResponse.statusCode = 400;
      return orderResponse;
    }

    const order = await Order.findById(id)
      .populate("customerId", "name email phone")
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
    console.error("Admin get order error:", err);
    orderResponse.message = "Internal server error";
    orderResponse.statusCode = 500;
    return orderResponse;
  }
};

// Update order status (Admin)
export const adminUpdateOrderStatus = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<AdminOrderResponse> => {
  await connectToDatabase();

  const orderResponse: AdminOrderResponse = {
    success: false,
    message: "",
    order: undefined,
    statusCode: 500,
  };

  const { id } = req.query;
  const { status } = req.body;

  try {
    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      orderResponse.message = "Invalid order ID";
      orderResponse.statusCode = 400;
      return orderResponse;
    }

    // Validate status
    if (!status || !Object.values(OrderStatus).includes(status)) {
      orderResponse.message = `Invalid status. Valid statuses: ${Object.values(
        OrderStatus
      ).join(", ")}`;
      orderResponse.statusCode = 400;
      return orderResponse;
    }

    const order = await Order.findById(id).populate("customerId", "name email");

    if (!order) {
      orderResponse.message = ORDER_MESSAGES.ORDER_NOT_FOUND;
      orderResponse.statusCode = 404;
      return orderResponse;
    }

    // Check if status transition is valid
    if (order.status === OrderStatus.CANCELLED) {
      orderResponse.message = "Cannot update status of cancelled order";
      orderResponse.statusCode = 400;
      return orderResponse;
    }

    if (
      order.status === OrderStatus.COMPLETED &&
      status !== OrderStatus.CANCELLED
    ) {
      orderResponse.message = "Cannot update status of completed order";
      orderResponse.statusCode = 400;
      return orderResponse;
    }

    // Update payment status if order is completed
    if (status === OrderStatus.COMPLETED) {
      await Payment.findOneAndUpdate(
        { orderId: order._id },
        { status: PaymentStatus.COMPLETED }
      );
    }

    // Update order status
    order.status = status;
    await order.save();

    const payment = await Payment.findOne({ orderId: order._id });

    orderResponse.order = buildOrderResponse(order, payment!);
    orderResponse.success = true;
    orderResponse.message = "Order status updated successfully";
    orderResponse.statusCode = 200;

    // Send status update email to customer
    const customer = order.customerId as any;
    if (customer && customer.email) {
      emailService
        .sendOrderStatusUpdate(customer.email, {
          customerName: customer.name,
          orderId: order._id.toString(),
          status: order.status,
        })
        .catch((err) =>
          console.error("Failed to send status update email:", err)
        );
    }

    return orderResponse;
  } catch (err) {
    console.error("Admin update order status error:", err);
    orderResponse.message = "Internal server error";
    orderResponse.statusCode = 500;
    return orderResponse;
  }
};

// Cancel order (Admin)
export const adminCancelOrder = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<AdminOrderResponse> => {
  await connectToDatabase();

  const orderResponse: AdminOrderResponse = {
    success: false,
    message: "",
    order: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      await session.abortTransaction();
      orderResponse.message = "Invalid order ID";
      orderResponse.statusCode = 400;
      return orderResponse;
    }

    const order = await Order.findById(id)
      .populate("customerId", "name email")
      .session(session);

    if (!order) {
      await session.abortTransaction();
      orderResponse.message = ORDER_MESSAGES.ORDER_NOT_FOUND;
      orderResponse.statusCode = 404;
      return orderResponse;
    }

    // Check if order can be cancelled
    if (order.status === OrderStatus.CANCELLED) {
      await session.abortTransaction();
      orderResponse.message = "Order is already cancelled";
      orderResponse.statusCode = 400;
      return orderResponse;
    }

    if (order.status === OrderStatus.COMPLETED) {
      await session.abortTransaction();
      orderResponse.message = "Cannot cancel completed order";
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

    // Process refund if payment was completed
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
      await Payment.findByIdAndUpdate(
        payment._id,
        { status: PaymentStatus.CANCELLED },
        { session }
      );
    }

    // Restore product stock
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } },
        { session }
      );
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

    // Send cancellation email to customer
    const customer = order.customerId as any;
    if (customer && customer.email) {
      emailService
        .sendOrderCancellation(customer.email, {
          customerName: customer.name,
          orderId: order._id.toString(),
          status: OrderStatus.CANCELLED,
        })
        .catch((err) =>
          console.error("Failed to send cancellation email:", err)
        );
    }

    return orderResponse;
  } catch (err) {
    await session.abortTransaction();
    console.error("Admin cancel order error:", err);
    orderResponse.message = "Internal server error";
    orderResponse.statusCode = 500;
    return orderResponse;
  } finally {
    session.endSession();
  }
};
