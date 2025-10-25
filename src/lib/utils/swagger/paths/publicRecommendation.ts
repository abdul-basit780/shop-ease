// lib/utils/swagger/paths/publicRecommendation.ts

export const publicRecommendationPaths = {
  "/api/public/recommendations/popular": {
    get: {
      summary: "Get popular products",
      description:
        "Returns the most popular products based on ratings and review count. Public endpoint - no authentication required.",
      tags: ["Public - Recommendations"],
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

  "/api/public/recommendations/trending": {
    get: {
      summary: "Get trending products",
      description:
        "Returns trending products based on recent positive reviews (last 30 days). Public endpoint - no authentication required.",
      tags: ["Public - Recommendations"],
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

  "/api/public/recommendations/similar/{id}": {
    get: {
      summary: "Get similar products",
      description:
        "Returns products similar to the specified product based on category and price range (±30%). Public endpoint - no authentication required.",
      tags: ["Public - Recommendations"],
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
