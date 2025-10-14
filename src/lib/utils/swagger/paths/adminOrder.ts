// lib/utils/swagger/paths/adminOrder.ts
export const adminOrderPaths = {
  "/api/admin/orders": {
    get: {
      summary: "Get all orders (Admin)",
      description:
        "Retrieve all orders with advanced filtering options. Includes statistics and supports filtering by customer, status, date range, amount range, and search in address. Admin only.",
      tags: ["Admin - Order Management"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Page number",
          schema: {
            type: "integer",
            default: 1,
            minimum: 1,
          },
        },
        {
          name: "limit",
          in: "query",
          description: "Items per page",
          schema: {
            type: "integer",
            default: 10,
            minimum: 1,
            maximum: 100,
          },
        },
        {
          name: "sortBy",
          in: "query",
          description: "Sort field",
          schema: {
            type: "string",
            enum: ["datetime", "totalAmount", "status", "createdAt"],
            default: "datetime",
          },
        },
        {
          name: "sortOrder",
          in: "query",
          description: "Sort order",
          schema: {
            type: "string",
            enum: ["asc", "desc"],
            default: "desc",
          },
        },
        {
          name: "customerId",
          in: "query",
          description: "Filter by customer ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
        {
          name: "status",
          in: "query",
          description: "Filter by order status",
          schema: {
            type: "string",
            enum: [
              "pending",
              "processing",
              "shipped",
              "completed",
              "cancelled",
            ],
          },
        },
        {
          name: "startDate",
          in: "query",
          description: "Filter by start date (ISO format)",
          schema: {
            type: "string",
            format: "date-time",
            example: "2025-01-01T00:00:00.000Z",
          },
        },
        {
          name: "endDate",
          in: "query",
          description: "Filter by end date (ISO format)",
          schema: {
            type: "string",
            format: "date-time",
            example: "2025-12-31T23:59:59.999Z",
          },
        },
        {
          name: "minAmount",
          in: "query",
          description: "Filter by minimum order amount",
          schema: {
            type: "number",
            example: 50.0,
          },
        },
        {
          name: "maxAmount",
          in: "query",
          description: "Filter by maximum order amount",
          schema: {
            type: "number",
            example: 500.0,
          },
        },
        {
          name: "search",
          in: "query",
          description: "Search in order address",
          schema: {
            type: "string",
            example: "New York",
          },
        },
      ],
      responses: {
        "200": {
          description: "Orders retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AdminListOrdersResponse",
              },
            },
          },
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description: "Forbidden - Admin role required",
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },
  },

  "/api/admin/orders/{id}": {
    get: {
      summary: "Get single order (Admin)",
      description:
        "Retrieve detailed information about a specific order including customer details, products, payment info, and delivery address. Admin only.",
      tags: ["Admin - Order Management"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Order ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
      ],
      responses: {
        "200": {
          description: "Order retrieved successfully",
          content: {
            "application/json": {
              schema: {
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
            },
          },
        },
        "400": {
          description: "Bad request - Invalid order ID",
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description: "Forbidden - Admin role required",
        },
        "404": {
          description: "Order not found",
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },

    put: {
      summary: "Update order status (Admin)",
      description:
        "Update the status of an order. Valid transitions: pending → processing → shipped → completed. Cannot update cancelled or completed orders (except to cancel). Payment status is automatically updated when order is marked as completed. Admin only.",
      tags: ["Admin - Order Management"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Order ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateOrderStatusRequest",
            },
            examples: {
              markProcessing: {
                summary: "Mark as processing",
                value: {
                  status: "processing",
                },
              },
              markShipped: {
                summary: "Mark as shipped",
                value: {
                  status: "shipped",
                },
              },
              markCompleted: {
                summary: "Mark as completed",
                value: {
                  status: "completed",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Order status updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  message: {
                    type: "string",
                    example: "Order status updated successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/OrderResponse",
                  },
                },
              },
            },
          },
        },
        "400": {
          description:
            "Bad request - Invalid order ID, invalid status, or invalid status transition",
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description: "Forbidden - Admin role required",
        },
        "404": {
          description: "Order not found",
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },
  },

  "/api/admin/orders/{id}/cancel": {
    post: {
      summary: "Cancel order (Admin)",
      description:
        "Cancel an order and process refund if payment was completed. Restores product stock and updates payment status. Cannot cancel already completed or cancelled orders. Admin only.",
      tags: ["Admin - Order Management"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Order ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
      ],
      responses: {
        "200": {
          description: "Order cancelled successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AdminCancelOrderResponse",
              },
            },
          },
        },
        "400": {
          description:
            "Bad request - Invalid order ID, order already cancelled, or refund failed",
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description: "Forbidden - Admin role required",
        },
        "404": {
          description: "Order or payment not found",
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },
  },
};
