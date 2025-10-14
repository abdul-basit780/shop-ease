// lib/utils/swagger/schemas/adminOrder.ts
export const adminOrderSchemas = {
  // Admin List Orders Response
  AdminListOrdersResponse: {
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
            items: {
              $ref: "#/components/schemas/OrderResponse",
            },
          },
          stats: {
            $ref: "#/components/schemas/OrderStats",
          },
          pagination: {
            $ref: "#/components/schemas/OrderPagination",
          },
        },
      },
    },
  },

  // Order Statistics
  OrderStats: {
    type: "object",
    properties: {
      totalRevenue: {
        type: "number",
        example: 125000.5,
        description: "Total revenue from filtered orders",
      },
      avgOrderValue: {
        type: "number",
        example: 89.5,
        description: "Average order value",
      },
      totalOrders: {
        type: "integer",
        example: 1398,
        description: "Total number of orders",
      },
      statusBreakdown: {
        type: "object",
        properties: {
          pending: {
            type: "integer",
            example: 45,
          },
          processing: {
            type: "integer",
            example: 120,
          },
          shipped: {
            type: "integer",
            example: 850,
          },
          completed: {
            type: "integer",
            example: 350,
          },
          cancelled: {
            type: "integer",
            example: 33,
          },
        },
        description: "Count of orders by status",
      },
    },
  },

  // Order Pagination
  OrderPagination: {
    type: "object",
    properties: {
      page: {
        type: "integer",
        example: 1,
      },
      limit: {
        type: "integer",
        example: 10,
      },
      total: {
        type: "integer",
        example: 150,
      },
      totalPages: {
        type: "integer",
        example: 15,
      },
      hasNext: {
        type: "boolean",
        example: true,
      },
      hasPrev: {
        type: "boolean",
        example: false,
      },
    },
  },

  // Update Order Status Request
  UpdateOrderStatusRequest: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["pending", "processing", "shipped", "completed", "cancelled"],
        example: "processing",
        description: "New order status",
      },
    },
  },

  // Cancel Order Response
  AdminCancelOrderResponse: {
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
                example: "re_1234567890",
                description: "Refund ID from payment provider",
              },
              amount: {
                type: "number",
                example: 99.99,
                description: "Refunded amount",
              },
              status: {
                type: "string",
                example: "succeeded",
                description: "Refund status",
              },
            },
          },
        },
      },
    },
  },
};
