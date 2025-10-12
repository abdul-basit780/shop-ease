// lib/utils/swagger/paths/order.ts
export const orderPaths = {
  "/api/customer/order": {
    get: {
      summary: "List customer orders",
      description:
        "Get all orders for the authenticated customer with pagination and filtering. Customer only.",
      tags: ["Customer - Orders"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Page number",
          schema: {
            type: "string",
            default: "1",
            example: "1",
          },
        },
        {
          name: "limit",
          in: "query",
          description: "Items per page",
          schema: {
            type: "string",
            default: "10",
            example: "10",
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
              "delivered",
              "cancelled",
            ],
            example: "pending",
          },
        },
      ],
      responses: {
        "200": {
          description: "Orders retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ListOrdersResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Create order from cart",
      description:
        "Create a new order from the customer's cart. For Stripe payments, returns a client secret for payment confirmation. Customer only.",
      tags: ["Customer - Orders"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateOrderRequest" },
            examples: {
              cashPayment: {
                summary: "Cash on delivery",
                value: {
                  addressId: "507f1f77bcf86cd799439014",
                  paymentMethod: "cash",
                },
              },
              stripePayment: {
                summary: "Stripe payment",
                value: {
                  addressId: "507f1f77bcf86cd799439014",
                  paymentMethod: "stripe",
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Order created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOrderResponse" },
            },
          },
        },
        "400": {
          description: "Bad request (empty cart, insufficient stock, etc.)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Address not found" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/customer/order/{id}": {
    get: {
      summary: "Get order details",
      description:
        "Get detailed information about a specific order. Customer only.",
      tags: ["Customer - Orders"],
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
              schema: { $ref: "#/components/schemas/GetOrderResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Order not found" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
    patch: {
      summary: "Cancel order",
      description:
        "Cancel a pending or processing order. If payment was completed via Stripe, a refund will be processed. Product stock will be restored. Customer only.",
      tags: ["Customer - Orders"],
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
              schema: { $ref: "#/components/schemas/CancelOrderResponse" },
            },
          },
        },
        "400": {
          description: "Order cannot be cancelled (already shipped/delivered)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Order not found" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
  },
};
