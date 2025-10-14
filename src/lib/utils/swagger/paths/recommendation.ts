// lib/utils/swagger/paths/recommendation.ts

export const recommendationPaths = {
  "/api/customer/recommendations": {
    get: {
      summary: "Get personalized recommendations",
      description:
        "Returns personalized product recommendations based on user's feedback and wishlist using collaborative and content-based filtering algorithms. New users without data receive popular products. Customer only.",
      tags: ["Customer - Recommendations"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
            minimum: 1,
            maximum: 50,
          },
          description: "Number of recommendations to return (1-50)",
        },
      ],
      responses: {
        "200": {
          description: "Recommendations retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/GetRecommendationsResponse",
              },
              examples: {
                personalized: {
                  summary: "Personalized recommendations",
                  value: {
                    success: true,
                    message: "Recommendations retrieved successfully",
                    data: {
                      recommendations: [
                        {
                          id: "507f1f77bcf86cd799439011",
                          name: "Wireless Mouse",
                          price: 29.99,
                          img: "https://example.com/mouse.jpg",
                          category: "Electronics",
                          stock: 100,
                          reason: "Based on your wishlist",
                          score: 8.5,
                        },
                      ],
                      type: "personalized",
                      count: 10,
                    },
                  },
                },
                popular: {
                  summary: "Popular products (new user)",
                  value: {
                    success: true,
                    message: "Recommendations retrieved successfully",
                    data: {
                      recommendations: [
                        {
                          id: "507f1f77bcf86cd799439011",
                          name: "Best Seller Product",
                          price: 49.99,
                          img: "https://example.com/product.jpg",
                          category: "Electronics",
                          stock: 50,
                          reason: "Popular choice",
                          score: 9.2,
                        },
                      ],
                      type: "popular",
                      count: 10,
                    },
                  },
                },
              },
            },
          },
        },
        "400": {
          description: "Invalid limit parameter",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RecommendationErrorResponse",
              },
            },
          },
        },
        "401": { description: "Unauthorized - Authentication required" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },

  "/api/customer/recommendations/popular": {
    get: {
      summary: "Get popular products",
      description:
        "Returns the most popular products based on ratings and review count. Public endpoint - no authentication required.",
      tags: ["Customer - Recommendations"],
      parameters: [
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
            minimum: 1,
            maximum: 50,
          },
          description: "Number of products to return (1-50)",
        },
      ],
      responses: {
        "200": {
          description: "Popular products retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GetProductsResponse" },
            },
          },
        },
        "400": {
          description: "Invalid limit parameter",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RecommendationErrorResponse",
              },
            },
          },
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },

  "/api/customer/recommendations/trending": {
    get: {
      summary: "Get trending products",
      description:
        "Returns trending products based on recent positive reviews (last 30 days). Public endpoint - no authentication required.",
      tags: ["Customer - Recommendations"],
      parameters: [
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
            minimum: 1,
            maximum: 50,
          },
          description: "Number of products to return (1-50)",
        },
      ],
      responses: {
        "200": {
          description: "Trending products retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GetProductsResponse" },
            },
          },
        },
        "400": {
          description: "Invalid limit parameter",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RecommendationErrorResponse",
              },
            },
          },
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },

  "/api/customer/recommendations/similar/{id}": {
    get: {
      summary: "Get similar products",
      description:
        "Returns products similar to the specified product based on category and price range (±30%). Public endpoint - no authentication required.",
      tags: ["Customer - Recommendations"],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: {
            type: "string",
          },
          description: "Product ID to find similar products for",
        },
        {
          in: "query",
          name: "limit",
          schema: {
            type: "integer",
            default: 10,
            minimum: 1,
            maximum: 50,
          },
          description: "Number of similar products to return (1-50)",
        },
      ],
      responses: {
        "200": {
          description: "Similar products retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GetProductsResponse" },
            },
          },
        },
        "400": {
          description: "Invalid product ID or limit parameter",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RecommendationErrorResponse",
              },
            },
          },
        },
        "404": {
          description: "Product not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RecommendationErrorResponse",
              },
            },
          },
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
