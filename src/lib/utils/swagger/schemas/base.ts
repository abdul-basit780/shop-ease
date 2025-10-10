// lib/utils/swagger/schemas/base.ts
import {
  DayOfWeek,
  PaymentMethod,
  PaymentStatus,
} from "../../../models/enums";

export const baseSchemas = {
  // Base Components
  ApiResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", description: "Request success status" },
      message: { type: "string", description: "Response message" },
      data: { type: "object", description: "Response data" },
      timestamp: {
        type: "string",
        format: "date-time",
        description: "Response timestamp",
      },
    },
  },

  Pagination: {
    type: "object",
    properties: {
      page: { type: "integer", description: "Current page number" },
      limit: { type: "integer", description: "Items per page" },
      total: { type: "integer", description: "Total number of items" },
      totalPages: { type: "integer", description: "Total number of pages" },
      hasNext: {
        type: "boolean",
        description: "Whether there are more pages",
      },
      hasPrev: {
        type: "boolean",
        description: "Whether there are previous pages",
      },
    },
  },

  Address: {
    type: "object",
    required: ["street", "city", "state", "zipCode"],
    properties: {
      street: { type: "string", example: "123 Main St" },
      city: { type: "string", example: "New York" },
      state: { type: "string", example: "NY" },
      zipCode: {
        type: "string",
        pattern: "^\\d{5}(?:-\\d{4})?$",
        example: "10001",
      },
    },
  },

  PaymentInfo: {
    type: "object",
    properties: {
      id: { type: "string", description: "Payment ID" },
      method: { type: "string", enum: Object.values(PaymentMethod) },
      status: { type: "string", enum: Object.values(PaymentStatus) },
      amount: { type: "number", minimum: 0, description: "Payment amount" },
      stripePaymentIntentId: {
        type: "string",
        description: "Stripe payment ID (if applicable)",
      },
      date: {
        type: "string",
        format: "date-time",
        description: "Payment date",
      },
    },
  },

  HealthResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "API is healthy" },
      data: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["healthy", "unhealthy"] },
          timestamp: { type: "string", format: "date-time" },
          uptime: {
            type: "number",
            description: "Server uptime in seconds",
          },
          version: { type: "string" },
          environment: { type: "string" },
          database: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["connected", "disconnected"],
              },
              latency: {
                type: "number",
                description: "Database response time in milliseconds",
              },
            },
          },
        },
      },
    },
  },
};
