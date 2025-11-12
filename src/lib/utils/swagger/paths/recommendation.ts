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
                          averageRating: 4.3,
                          totalReviews: 150,
                          optionTypes: [
                            {
                              id: "507f1f77bcf86cd799439012",
                              name: "Color",
                              values: [
                                {
                                  id: "507f1f77bcf86cd799439013",
                                  value: "Black",
                                  img: "https://example.com/black.jpg",
                                  price: 0,
                                  stock: 100,
                                },
                              ],
                            },
                          ],
                        },
                        {
                          id: "507f1f77bcf86cd799439012",
                          name: "Laptop",
                          price: 999.99,
                          img: "https://example.com/laptop.jpg",
                          category: "Electronics",
                          stock: 50,
                          reason: "Based on your recent purchases",
                          score: 9.5,
                          averageRating: 4.7,
                          totalReviews: 300,
                          optionTypes: [
                            {
                              id: "507f1f77bcf86cd799439014",
                              name: "Storage",
                              values: [
                                {
                                  id: "507f1f77bcf86cd799439015",
                                  value: "512GB",
                                  img: "https://example.com/512gb.jpg",
                                  price: 0,
                                  stock: 30,
                                },
                              ],
                            },
                          ],
                        },
                        {
                          id: "507f1f77bcf86cd799439013",
                          name: "Smartphone",
                          price: 699.99,
                          img: "https://example.com/phone.jpg",
                          category: "Electronics",
                          stock: 40,
                          reason: "Based on your recent purchases",
                          score: 9.2,
                          averageRating: 4.6,
                          totalReviews: 200,
                          optionTypes: [
                            {
                              id: "507f1f77bcf86cd799439016",
                              name: "Storage",
                              values: [
                                {
                                  id: "507f1f77bcf86cd799439017",
                                  value: "128GB",
                                  img: "https://example.com/128gb.jpg",
                                  price: 0,
                                  stock: 50,
                                },
                              ],
                            },
                          ],
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
};
