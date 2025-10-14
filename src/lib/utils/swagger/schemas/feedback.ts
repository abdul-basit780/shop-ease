// lib/utils/swagger/schemas/feedback.ts
export const feedbackSchemas = {
  // Feedback Response Schema
  FeedbackResponse: {
    type: "object",
    properties: {
      _id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Feedback unique identifier",
      },
      productId: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
        description: "Product ID",
      },
      productName: {
        type: "string",
        example: "Wireless Headphones",
        description: "Product name",
      },
      customerId: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "507f1f77bcf86cd799439013",
          },
          name: {
            type: "string",
            example: "John Doe",
          },
          email: {
            type: "string",
            example: "john@example.com",
          },
        },
        description: "Customer information",
      },
      orderId: {
        type: "string",
        example: "507f1f77bcf86cd799439014",
        description: "Order ID",
      },
      rating: {
        type: "number",
        minimum: 1,
        maximum: 5,
        example: 5,
        description: "Rating from 1 to 5",
      },
      comment: {
        type: "string",
        example: "Excellent product! Highly recommended.",
        description: "Review comment",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2025-10-11T10:00:00.000Z",
        description: "Creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2025-10-11T10:00:00.000Z",
        description: "Last update timestamp",
      },
    },
  },

  // Create Feedback Request Schema
  CreateFeedbackRequest: {
    type: "object",
    required: ["productId", "orderId", "rating", "comment"],
    properties: {
      productId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Product ID to review",
      },
      orderId: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
        description: "Order ID containing the product",
      },
      rating: {
        type: "number",
        minimum: 1,
        maximum: 5,
        example: 5,
        description: "Rating from 1 to 5",
      },
      comment: {
        type: "string",
        minLength: 10,
        maxLength: 1000,
        example:
          "Excellent product! Highly recommended. Very satisfied with the quality and fast delivery.",
        description: "Review comment (10-1000 characters)",
      },
    },
  },

  // Update Feedback Request Schema
  UpdateFeedbackRequest: {
    type: "object",
    properties: {
      rating: {
        type: "number",
        minimum: 1,
        maximum: 5,
        example: 4,
        description: "Updated rating (optional)",
      },
      comment: {
        type: "string",
        minLength: 10,
        maxLength: 1000,
        example: "Updated review: Good product but shipping was slow.",
        description: "Updated review comment (optional)",
      },
    },
  },

  // Rating Statistics Schema
  RatingStats: {
    type: "object",
    properties: {
      averageRating: {
        type: "number",
        example: 4.5,
        description: "Average rating (rounded to 1 decimal)",
      },
      totalReviews: {
        type: "integer",
        example: 125,
        description: "Total number of reviews",
      },
      ratingBreakdown: {
        type: "object",
        properties: {
          "5": {
            type: "integer",
            example: 80,
            description: "Number of 5-star ratings",
          },
          "4": {
            type: "integer",
            example: 30,
            description: "Number of 4-star ratings",
          },
          "3": {
            type: "integer",
            example: 10,
            description: "Number of 3-star ratings",
          },
          "2": {
            type: "integer",
            example: 3,
            description: "Number of 2-star ratings",
          },
          "1": {
            type: "integer",
            example: 2,
            description: "Number of 1-star ratings",
          },
        },
        description: "Distribution of ratings",
      },
    },
  },

  // Pagination Schema
  FeedbackPagination: {
    type: "object",
    properties: {
      page: {
        type: "integer",
        example: 1,
        description: "Current page number",
      },
      limit: {
        type: "integer",
        example: 10,
        description: "Items per page",
      },
      total: {
        type: "integer",
        example: 50,
        description: "Total number of items",
      },
      totalPages: {
        type: "integer",
        example: 5,
        description: "Total number of pages",
      },
      hasNext: {
        type: "boolean",
        example: true,
        description: "Whether there is a next page",
      },
      hasPrev: {
        type: "boolean",
        example: false,
        description: "Whether there is a previous page",
      },
    },
  },

  // Get Product Feedbacks Response
  GetProductFeedbacksResponse: {
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
        type: "object",
        properties: {
          feedbacks: {
            type: "array",
            items: {
              $ref: "#/components/schemas/FeedbackResponse",
            },
          },
          stats: {
            $ref: "#/components/schemas/RatingStats",
          },
          pagination: {
            $ref: "#/components/schemas/FeedbackPagination",
          },
        },
      },
    },
  },

  // Get My Feedbacks Response
  GetMyFeedbacksResponse: {
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
        type: "object",
        properties: {
          feedbacks: {
            type: "array",
            items: {
              $ref: "#/components/schemas/FeedbackResponse",
            },
          },
          pagination: {
            $ref: "#/components/schemas/FeedbackPagination",
          },
        },
      },
    },
  },

  // Create Feedback Response
  CreateFeedbackResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Feedback created successfully",
      },
      data: {
        $ref: "#/components/schemas/FeedbackResponse",
      },
    },
  },

  // Update Feedback Response
  UpdateFeedbackResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Feedback updated successfully",
      },
      data: {
        $ref: "#/components/schemas/FeedbackResponse",
      },
    },
  },

  // Delete Feedback Response
  DeleteFeedbackResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Feedback deleted successfully",
      },
    },
  },

  // Feedback Error Response
  FeedbackErrorResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      message: {
        type: "string",
        example: "Error message describing what went wrong",
      },
      error: {
        type: "object",
        properties: {
          code: {
            type: "string",
            example: "ALREADY_REVIEWED",
            description: "Error code for programmatic handling",
          },
          details: {
            type: "array",
            items: { type: "string" },
            example: [
              "Comment must be at least 10 characters long",
              "Rating must be between 1 and 5",
            ],
            description: "Detailed error messages or validation errors",
          },
          statusCode: {
            type: "number",
            example: 400,
            description: "HTTP status code",
          },
        },
      },
    },
  },
};
