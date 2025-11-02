// lib/utils/swagger/schemas/order.ts
export const orderSchemas = {
  // Order Product Response Schema
  OrderProductResponse: {
    type: "object",
    properties: {
      productId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Product ID",
      },
      name: {
        type: "string",
        example: "Gaming Laptop",
        description: "Product name (snapshot at order time)",
      },
      price: {
        type: "number",
        format: "float",
        example: 1299.99,
        description: "Product price (snapshot at order time)",
      },
      quantity: {
        type: "integer",
        example: 2,
        description: "Quantity ordered",
      },
      img: {
        type: "string",
        example: "/uploads/products/laptop.jpg",
        description: "Product image",
      },
      subtotal: {
        type: "number",
        format: "float",
        example: 2599.98,
        description: "Subtotal (price × quantity)",
      },
      selectedOptions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            optionValueId: {
              type: "string",
              example: "507f1f77bcf86cd799439015",
              description: "Option value ID",
            },
            optionTypeName: {
              type: "string",
              example: "Size",
              description: "Name of the option type",
            },
            value: {
              type: "string",
              example: "Large",
              description: "Selected option value",
            },
            price: {
              type: "number",
              format: "float",
              example: 0,
              description: "Additional price for this option",
            },
          },
        },
        description: "Selected product options (if any)",
      },
    },
  },

  // Order Payment Response Schema
  OrderPaymentResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439013",
        description: "Payment ID",
      },
      method: {
        type: "string",
        enum: ["cash", "stripe"],
        example: "stripe",
        description: "Payment method",
      },
      status: {
        type: "string",
        enum: ["pending", "completed", "refunded", "cancelled", "failed"],
        example: "completed",
        description: "Payment status",
      },
      amount: {
        type: "number",
        format: "float",
        example: 2989.97,
        description: "Payment amount (total amount including tax and shipping)",
      },
    },
  },

  // Order Response Schema
  OrderResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Order ID",
      },
      customerId: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
        description: "Customer ID",
      },
      datetime: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00.000Z",
        description: "Order date and time",
      },
      status: {
        type: "string",
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        example: "pending",
        description: "Order status",
      },
      subtotal: {
        type: "number",
        format: "float",
        example: 2599.98,
        description: "Subtotal (sum of all products before tax and shipping)",
      },
      tax: {
        type: "number",
        format: "float",
        example: 389.99,
        description: "Tax amount (15% of subtotal)",
      },
      shipping: {
        type: "number",
        format: "float",
        example: 0,
        description: "Shipping cost ($9.99 if subtotal <= $50, otherwise free)",
      },
      totalAmount: {
        type: "number",
        format: "float",
        example: 2989.97,
        description: "Total order amount (subtotal + tax + shipping)",
      },
      products: {
        type: "array",
        items: { $ref: "#/components/schemas/OrderProductResponse" },
        description: "Ordered products",
      },
      address: {
        type: "string",
        example: "123 Main St, New York, NY 10001",
        description: "Delivery address",
      },
      payment: {
        $ref: "#/components/schemas/OrderPaymentResponse",
        description: "Payment information",
      },
      canCancel: {
        type: "boolean",
        example: true,
        description: "Whether order can be cancelled",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00.000Z",
        description: "Order creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-15T10:30:00.000Z",
        description: "Last update timestamp",
      },
    },
  },

  // Create Order Request Schema
  CreateOrderRequest: {
    type: "object",
    required: ["addressId", "paymentMethod"],
    properties: {
      addressId: {
        type: "string",
        example: "507f1f77bcf86cd799439014",
        description: "Delivery address ID",
      },
      paymentMethod: {
        type: "string",
        enum: ["cash", "stripe"],
        example: "stripe",
        description: "Payment method (cash or stripe)",
      },
    },
  },

  // Create Order Response Schema
  CreateOrderResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Order created successfully",
      },
      data: {
        type: "object",
        properties: {
          order: {
            $ref: "#/components/schemas/OrderResponse",
          },
          clientSecret: {
            type: "string",
            example: "pi_xxx_secret_xxx",
            description:
              "Stripe payment intent client secret (only for stripe payments)",
          },
        },
      },
    },
  },

  // Get Order Response Schema
  GetOrderResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Order retrieved successfully",
      },
      data: {
        $ref: "#/components/schemas/OrderResponse",
      },
    },
  },

  // List Orders Response Schema
  ListOrdersResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Orders retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          orders: {
            type: "array",
            items: { $ref: "#/components/schemas/OrderResponse" },
          },
          pagination: {
            $ref: "#/components/schemas/PaginationInfo",
          },
        },
      },
    },
  },

  // Cancel Order Response Schema
  CancelOrderResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Order cancelled successfully",
      },
      data: {
        type: "object",
        properties: {
          order: {
            $ref: "#/components/schemas/OrderResponse",
          },
          refundInfo: {
            type: "object",
            properties: {
              refundId: {
                type: "string",
                example: "re_xxx",
                description: "Stripe refund ID",
              },
              amount: {
                type: "number",
                example: 2599.98,
                description: "Refund amount",
              },
              status: {
                type: "string",
                example: "processing",
                description: "Refund status",
              },
            },
            description:
              "Refund information (only for completed stripe payments)",
          },
        },
      },
    },
  },

  // Order Error Response Schema
  OrderErrorResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      message: {
        type: "string",
        example: "Error message",
      },
      error: {
        type: "object",
        properties: {
          code: {
            type: "string",
            example: "INSUFFICIENT_STOCK",
          },
          statusCode: {
            type: "number",
            example: 400,
          },
        },
      },
    },
  },
};
