// lib/utils/order.ts
import { OrderStatus, PaymentStatus } from "../models/enums";
import { isValidObjectId } from "mongoose";

export interface OrderProductResponse {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  img: string;
  selectedOptions?: Array<{
    optionValueId: string;
    optionTypeName: string;
    value: string;
    price: number;
  }>;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  customerId: string;
  datetime: Date;
  status: OrderStatus;
  totalAmount: number;
  products: OrderProductResponse[];
  address: string;
  payment: {
    id: string;
    method: string;
    status: PaymentStatus;
    amount: number;
  };
  canCancel: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  addressId: string;
  paymentMethod: "cash" | "stripe";
}

// Build order response
export const buildOrderResponse = (order: any, payment: any): OrderResponse => {
  const products: OrderProductResponse[] = order.products.map((item: any) => {
    const baseSubtotal = item.price * item.quantity;

    const selectedOptions = item.selectedOptions?.map((opt: any) => ({
      optionValueId: opt.optionValueId.toString(),
      optionTypeName: opt.optionTypeName,
      value: opt.value,
      price: opt.price,
    }));

    return {
      productId: item.productId.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      img: item.img,
      selectedOptions:
        selectedOptions?.length > 0 ? selectedOptions : undefined,
      subtotal: Math.round(baseSubtotal * 100) / 100,
    };
  });

  // Order can be cancelled if it's PENDING or PROCESSING
  const canCancel =
    order.status === OrderStatus.PENDING ||
    order.status === OrderStatus.PROCESSING;

  return {
    id: order._id.toString(),
    customerId: order.customerId.toString(),
    datetime: order.datetime,
    status: order.status,
    totalAmount: order.totalAmount,
    products,
    address: order.address,
    payment: {
      id: payment._id.toString(),
      method: payment.method,
      status: payment.status,
      amount: payment.amount,
    },
    canCancel,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};

// Validate create order request
export const validateCreateOrder = (data: CreateOrderRequest): string[] => {
  const errors: string[] = [];

  if (!data.addressId) {
    errors.push("Address ID is required");
  } else if (!isValidObjectId(data.addressId)) {
    errors.push("Invalid address ID");
  }

  if (!data.paymentMethod) {
    errors.push("Payment method is required");
  } else if (!["cash", "stripe"].includes(data.paymentMethod)) {
    errors.push("Payment method must be either 'cash' or 'stripe'");
  }

  return errors;
};

// Order messages
export const ORDER_MESSAGES = {
  CREATED: "Order created successfully",
  RETRIEVED: "Order retrieved successfully",
  LIST_RETRIEVED: "Orders retrieved successfully",
  CANCELLED: "Order cancelled successfully",
  CANNOT_CANCEL: "Order cannot be cancelled in current status",
  EMPTY_CART: "Cart is empty",
  INSUFFICIENT_STOCK: "Insufficient stock for one or more products",
  ORDER_NOT_FOUND: "Order not found",
  ADDRESS_NOT_FOUND: "Address not found",
  PAYMENT_FAILED: "Payment processing failed",
};
