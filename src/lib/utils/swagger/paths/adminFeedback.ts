// lib/utils/swagger/paths/adminFeedback.ts
export const adminFeedbackPaths = {
  "/api/admin/feedback": {
    get: {
      summary: "Get all feedbacks (Admin)",
      description:
        "Retrieve all feedbacks with advanced filtering options. Includes statistics and supports filtering by product, customer, rating, date range, and search. Admin only.",
      tags: ["Admin - Feedback Management"],
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
            enum: ["createdAt", "rating", "updatedAt"],
            default: "createdAt",
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
          name: "productId",
          in: "query",
          description: "Filter by product ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
        {
          name: "customerId",
          in: "query",
          description: "Filter by customer ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439012",
          },
        },
        {
          name: "rating",
          in: "query",
          description: "Filter by exact rating (1-5)",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 5,
          },
        },
        {
          name: "minRating",
          in: "query",
          description: "Filter by minimum rating (1-5)",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 5,
          },
        },
        {
          name: "maxRating",
          in: "query",
          description: "Filter by maximum rating (1-5)",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 5,
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
          name: "search",
          in: "query",
          description: "Search in feedback comments",
          schema: {
            type: "string",
            example: "excellent",
          },
        },
      ],
      responses: {
        "200": {
          description: "Feedbacks retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AdminGetFeedbacksResponse",
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

  "/api/admin/feedback/{id}": {
    get: {
      summary: "Get single feedback (Admin)",
      description:
        "Retrieve detailed information about a specific feedback including customer, product, and order details. Admin only.",
      tags: ["Admin - Feedback Management"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Feedback ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
      ],
      responses: {
        "200": {
          description: "Feedback retrieved successfully",
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
                    example: "Feedbacks retrieved successfully",
                  },
                  data: {
                    $ref: "#/components/schemas/FeedbackResponse",
                  },
                },
              },
            },
          },
        },
        "400": {
          description: "Bad request - Invalid feedback ID",
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description: "Forbidden - Admin role required",
        },
        "404": {
          description: "Feedback not found",
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },

    delete: {
      summary: "Delete feedback (Admin)",
      description:
        "Permanently delete a feedback. This action cannot be undone. Admin only.",
      tags: ["Admin - Feedback Management"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Feedback ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
      ],
      responses: {
        "200": {
          description: "Feedback deleted successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/DeleteFeedbackResponse",
              },
            },
          },
        },
        "400": {
          description: "Bad request - Invalid feedback ID",
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description: "Forbidden - Admin role required",
        },
        "404": {
          description: "Feedback not found",
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
