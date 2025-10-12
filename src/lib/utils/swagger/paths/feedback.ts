// lib/utils/swagger/paths/feedback.ts
export const feedbackPaths = {
  "/api/public/products/{id}/feedbacks": {
    get: {
      summary: "Get product feedbacks (Public)",
      description:
        "Retrieve all feedbacks/reviews for a specific product with rating statistics and breakdown. No authentication required.",
      tags: ["Public - Feedback"],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Product ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
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
            enum: ["createdAt", "rating"],
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
      ],
      responses: {
        "200": {
          description: "Feedbacks retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/GetProductFeedbacksResponse",
              },
            },
          },
        },
        "400": {
          description: "Bad request - Invalid product ID or query parameters",
        },
        "429": {
          description: "Rate limit exceeded (100 requests per 15 minutes)",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },
  },

  "/api/customer/feedback": {
    get: {
      summary: "Get my feedbacks",
      description:
        "Retrieve all feedbacks/reviews created by the authenticated customer. Customer only.",
      tags: ["Customer - Feedback"],
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
            enum: ["createdAt", "rating"],
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
      ],
      responses: {
        "200": {
          description: "Feedbacks retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GetMyFeedbacksResponse" },
            },
          },
        },
        "400": {
          description: "Bad request - Invalid query parameters",
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description: "Forbidden - Customer role required",
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },

    post: {
      summary: "Create feedback",
      description:
        "Create a new feedback/review for a purchased product. Can only review products from completed orders (status: COMPLETED). One review per product per customer. Customer only.",
      tags: ["Customer - Feedback"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateFeedbackRequest" },
            examples: {
              fiveStarReview: {
                summary: "5-star review",
                value: {
                  productId: "507f1f77bcf86cd799439011",
                  orderId: "507f1f77bcf86cd799439012",
                  rating: 5,
                  comment:
                    "Excellent product! Highly recommended. Very satisfied with the quality and fast delivery.",
                },
              },
              averageReview: {
                summary: "Average review",
                value: {
                  productId: "507f1f77bcf86cd799439011",
                  orderId: "507f1f77bcf86cd799439012",
                  rating: 3,
                  comment:
                    "Product is okay. It works as expected but nothing special. Delivery was on time.",
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Feedback created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateFeedbackResponse" },
            },
          },
        },
        "400": {
          description: "Bad request - Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/FeedbackErrorResponse" },
            },
          },
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description:
            "Forbidden - Order not found, status not COMPLETED, or product not in order's products array",
        },
        "409": {
          description: "Conflict - You have already reviewed this product",
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

  "/api/customer/feedback/{id}": {
    put: {
      summary: "Update my feedback",
      description:
        "Update an existing feedback/review created by the authenticated customer. Only the customer who created the feedback can update it. Customer only.",
      tags: ["Customer - Feedback"],
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
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateFeedbackRequest" },
            examples: {
              updateRating: {
                summary: "Update rating only",
                value: {
                  rating: 4,
                },
              },
              updateComment: {
                summary: "Update comment only",
                value: {
                  comment:
                    "Updated review: Good product but shipping was slow. Overall satisfied.",
                },
              },
              updateBoth: {
                summary: "Update rating and comment",
                value: {
                  rating: 4,
                  comment:
                    "Updated review: Good product but shipping was slow. Overall satisfied.",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Feedback updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateFeedbackResponse" },
            },
          },
        },
        "400": {
          description: "Bad request - Validation error or invalid feedback ID",
        },
        "401": {
          description: "Unauthorized",
        },
        "403": {
          description: "Forbidden - Customer role required",
        },
        "404": {
          description:
            "Not found - Feedback not found or doesn't belong to customer",
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
      summary: "Delete my feedback",
      description:
        "Delete a feedback/review created by the authenticated customer. Only the customer who created the feedback can delete it. Customer only.",
      tags: ["Customer - Feedback"],
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
              schema: { $ref: "#/components/schemas/DeleteFeedbackResponse" },
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
          description: "Forbidden - Customer role required",
        },
        "404": {
          description:
            "Not found - Feedback not found or doesn't belong to customer",
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
