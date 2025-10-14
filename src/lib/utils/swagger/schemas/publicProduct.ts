// lib/utils/swagger/schemas/publicProduct.ts
export const publicProductSchemas = {
  // Public Product Response Schema (without deletedAt)
  PublicProductResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Product unique identifier",
      },
      name: {
        type: "string",
        example: "Gaming Laptop",
        description: "Product name",
      },
      price: {
        type: "number",
        format: "float",
        example: 1299.99,
        description: "Product price",
      },
      stock: {
        type: "integer",
        example: 15,
        description: "Available stock quantity",
      },
      img: {
        type: "string",
        example: "/uploads/products/product_1704067200_abc123.jpg",
        description: "Product image URL",
      },
      description: {
        type: "string",
        example: "High-performance gaming laptop with RTX 4060",
        description: "Product description",
      },
      categoryId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Category ID",
      },
      categoryName: {
        type: "string",
        example: "Electronics",
        description: "Category name (populated from category)",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Last update timestamp",
      },
    },
  },

  // Public Products List Response
  PublicProductsListResponse: {
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
            items: { $ref: "#/components/schemas/PublicProductResponse" },
            description: "Array of product objects",
          },
          pagination: {
            $ref: "#/components/schemas/PaginationInfo",
            description: "Pagination information",
          },
        },
      },
    },
  },

  // Single Public Product Response
  SinglePublicProductResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Product retrieved successfully",
      },
      data: {
        $ref: "#/components/schemas/PublicProductResponse",
      },
    },
  },

  // Public Product Query Parameters
  PublicProductQueryParams: {
    type: "object",
    properties: {
      page: {
        type: "string",
        default: "1",
        example: "1",
        description: "Page number for pagination",
      },
      limit: {
        type: "string",
        default: "10",
        example: "10",
        description: "Number of items per page",
      },
      search: {
        type: "string",
        example: "laptop",
        description: "Search term to filter products by name or description",
      },
      categoryId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Filter by category ID",
      },
      minPrice: {
        type: "string",
        example: "100",
        description: "Minimum price filter",
      },
      maxPrice: {
        type: "string",
        example: "1000",
        description: "Maximum price filter",
      },
      inStock: {
        type: "string",
        enum: ["true", "false"],
        example: "true",
        description:
          "Filter by stock availability (true = in stock, false = out of stock)",
      },
      sortBy: {
        type: "string",
        default: "name",
        enum: ["name", "price", "stock", "createdAt", "updatedAt"],
        example: "price",
        description: "Field to sort by",
      },
      sortOrder: {
        type: "string",
        default: "asc",
        enum: ["asc", "desc"],
        example: "asc",
        description: "Sort order (ascending or descending)",
      },
    },
  },

  // Public Product Error Response
  PublicProductErrorResponse: {
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
            example: "PRODUCT_NOT_FOUND",
            description: "Error code for programmatic handling",
          },
          details: {
            type: "array",
            items: { type: "string" },
            example: ["Product not found", "Invalid product ID"],
            description: "Detailed error messages",
          },
          statusCode: {
            type: "number",
            example: 404,
            description: "HTTP status code",
          },
        },
      },
    },
  },
};
