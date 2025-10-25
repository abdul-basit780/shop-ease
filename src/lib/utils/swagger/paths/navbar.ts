// lib/utils/swagger/paths/navbar.ts
export const navbarPaths = {
  "/api/public/navbar/categories": {
    get: {
      summary: "Get categories for navbar",
      description:
        "Get all categories in a nested tree structure for navigation. Returns only id and name. No authentication required.",
      tags: ["Public - Navbar"],
      responses: {
        "200": {
          description: "Categories retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NavbarCategoriesResponse",
              },
              examples: {
                simple: {
                  summary: "Simple categories (no subcategories)",
                  value: {
                    success: true,
                    message: "Categories retrieved successfully",
                    data: {
                      categories: [
                        {
                          id: "507f1f77bcf86cd799439011",
                          name: "electronics",
                        },
                        {
                          id: "507f1f77bcf86cd799439012",
                          name: "clothing",
                        },
                      ],
                    },
                  },
                },
                nested: {
                  summary: "Categories with subcategories",
                  value: {
                    success: true,
                    message: "Categories retrieved successfully",
                    data: {
                      categories: [
                        {
                          id: "507f1f77bcf86cd799439011",
                          name: "electronics",
                          children: [
                            {
                              id: "507f1f77bcf86cd799439013",
                              name: "smartphones",
                            },
                            {
                              id: "507f1f77bcf86cd799439014",
                              name: "laptops",
                            },
                          ],
                        },
                        {
                          id: "507f1f77bcf86cd799439012",
                          name: "clothing",
                          children: [
                            {
                              id: "507f1f77bcf86cd799439015",
                              name: "mens",
                              children: [
                                {
                                  id: "507f1f77bcf86cd799439016",
                                  name: "shirts",
                                },
                                {
                                  id: "507f1f77bcf86cd799439017",
                                  name: "pants",
                                },
                              ],
                            },
                            {
                              id: "507f1f77bcf86cd799439018",
                              name: "womens",
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
        },
        "429": {
          description: "Rate limit exceeded (1000 requests per 15 minutes)",
        },
        "500": {
          description: "Internal server error",
        },
      },
    },
  },
};
