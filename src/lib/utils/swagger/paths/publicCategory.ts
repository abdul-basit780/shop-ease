// lib/utils/swagger/paths/publicCategory.ts
export const publicCategoryPaths = {
  "/api/public/categories": {
    get: {
      summary: "List all categories",
      description:
        "Get all active categories with pagination and search. No authentication required. Public endpoint.",
      tags: ["Public - Categories"],
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Page number for pagination",
          schema: {
            type: "string",
            default: "1",
            example: "1",
          },
        },
        {
          name: "limit",
          in: "query",
          description: "Number of items per page",
          schema: {
            type: "string",
            default: "10",
            example: "10",
          },
        },
        {
          name: "search",
          in: "query",
          description:
            "Search term to filter categories by name or description",
          schema: {
            type: "string",
            example: "electronics",
          },
        },
        {
          name: "sortBy",
          in: "query",
          description: "Field to sort by",
          schema: {
            type: "string",
            default: "name",
            enum: ["name", "createdAt", "updatedAt"],
            example: "name",
          },
        },
        {
          name: "sortOrder",
          in: "query",
          description: "Sort order",
          schema: {
            type: "string",
            default: "asc",
            enum: ["asc", "desc"],
            example: "asc",
          },
        },
      ],
      responses: {
        "200": {
          description: "Categories retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PublicCategoriesListResponse",
              },
            },
          },
        },
        "429": {
          description: "Rate limit exceeded (1000 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/public/categories/{id}": {
    get: {
      summary: "Get category by ID",
      description:
        "Get a single category by ID. No authentication required. Public endpoint.",
      tags: ["Public - Categories"],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Category ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
      ],
      responses: {
        "200": {
          description: "Category retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SinglePublicCategoryResponse",
              },
            },
          },
        },
        "400": { description: "Invalid category ID" },
        "404": { description: "Category not found" },
        "429": {
          description: "Rate limit exceeded (1000 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
