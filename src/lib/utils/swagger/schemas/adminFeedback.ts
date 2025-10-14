// lib/utils/swagger/schemas/adminFeedback.ts
export const adminFeedbackSchemas = {
  // Admin Get Feedbacks Response
  AdminGetFeedbacksResponse: {
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
};
