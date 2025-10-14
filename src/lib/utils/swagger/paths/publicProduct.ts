// lib/utils/swagger/paths/publicProduct.ts
export const publicProductPaths = {
  "/api/public/products": {
    get: {
      summary: "List all products",
      description:
        "Get all active products with pagination, search, and filtering. No authentication required. Public endpoint.",
      tags: ["Public - Products"],
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
          description: "Search term to filter products by name or description",
          schema: {
            type: "string",
            example: "laptop",
          },
        },
        {
          name: "categoryId",
          in: "query",
          description: "Filter by category ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
        {
          name: "minPrice",
          in: "query",
          description: "Minimum price filter",
          schema: {
            type: "string",
            example: "100",
          },
        },
        {
          name: "maxPrice",
          in: "query",
          description: "Maximum price filter",
          schema: {
            type: "string",
            example: "1000",
          },
        },
        {
          name: "inStock",
          in: "query",
          description: "Filter by stock availability",
          schema: {
            type: "string",
            enum: ["true", "false"],
            example: "true",
          },
        },
        {
          name: "sortBy",
          in: "query",
          description: "Field to sort by",
          schema: {
            type: "string",
            default: "name",
            enum: ["name", "price", "stock", "createdAt", "updatedAt"],
            example: "price",
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
          description: "Products retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/PublicProductsListResponse",
              },
            },
          },
        },
        "400": { description: "Invalid request parameters" },
        "429": {
          description: "Rate limit exceeded (1000 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/public/products/{id}": {
    get: {
      summary: "Get product by ID",
      description:
        "Get a single product by ID with category details. No authentication required. Public endpoint.",
      tags: ["Public - Products"],
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
      ],
      responses: {
        "200": {
          description: "Product retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SinglePublicProductResponse",
              },
            },
          },
        },
        "400": { description: "Invalid product ID" },
        "404": { description: "Product not found" },
        "429": {
          description: "Rate limit exceeded (1000 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
