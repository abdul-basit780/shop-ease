// lib/utils/swagger/schemas/recommendation.ts

export const recommendationSchemas = {
  // Product Item Schema
  ProductItem: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Product ID",
      },
      name: {
        type: "string",
        example: "Wireless Headphones",
        description: "Product name",
      },
      price: {
        type: "number",
        example: 79.99,
        description: "Product price",
      },
      img: {
        type: "string",
        example: "https://example.com/product.jpg",
        description: "Product image URL",
      },
      category: {
        type: "string",
        example: "Electronics",
        description: "Product category name",
      },
      stock: {
        type: "integer",
        example: 50,
        description: "Available stock quantity",
      },
    },
  },

  // Recommendation Item Schema
  RecommendationItem: {
    allOf: [
      { $ref: "#/components/schemas/ProductItem" },
      {
        type: "object",
        properties: {
          reason: {
            type: "string",
            example: "Users with similar taste liked this",
            description: "Why this product is recommended",
          },
          score: {
            type: "number",
            example: 8.5,
            description: "Recommendation score (higher is better)",
          },
        },
      },
    ],
  },

  // Get Recommendations Response
  GetRecommendationsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Recommendations retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              $ref: "#/components/schemas/RecommendationItem",
            },
          },
          type: {
            type: "string",
            enum: ["personalized", "popular"],
            example: "personalized",
            description:
              "Type of recommendations (personalized for users with data, popular for new users)",
          },
          count: {
            type: "integer",
            example: 10,
            description: "Number of recommendations returned",
          },
        },
      },
    },
  },

  // Get Products Response (Popular, Trending, Similar)
  GetProductsResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Products retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          products: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ProductItem",
            },
          },
          count: {
            type: "integer",
            example: 10,
            description: "Number of products returned",
          },
        },
      },
    },
  },

  // Recommendation Error Response
  RecommendationErrorResponse: {
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
            example: "INVALID_LIMIT",
            description: "Error code for programmatic handling",
          },
          details: {
            type: "array",
            items: { type: "string" },
            example: ["Limit must be between 1 and 50"],
            description: "Detailed error messages",
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
