// lib/utils/swagger/schemas/publicProduct.ts
export const publicProductSchemas = {
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
        example: "T-Shirt",
        description: "Product name",
      },
      price: {
        type: "number",
        format: "float",
        example: 29.99,
        description: "Product base price",
      },
      stock: {
        type: "integer",
        example: 100,
        description: "Base product stock",
      },
      img: {
        type: "string",
        example: "/uploads/products/product_1704067200_abc123.jpg",
        description: "Product image URL",
      },
      description: {
        type: "string",
        example: "Comfortable cotton t-shirt",
        description: "Product description",
      },
      categoryId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Category ID",
      },
      categoryName: {
        type: "string",
        example: "Clothing",
        description: "Category name (populated from category)",
      },
      optionTypes: {
        type: "array",
        description: "Available option types for this product",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "507f1f77bcf86cd799439012",
              description: "Option type ID",
            },
            name: {
              type: "string",
              example: "size",
              description: "Option type name",
            },
            values: {
              type: "array",
              description: "Available values for this option type",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    example: "507f1f77bcf86cd799439013",
                    description: "Option value ID",
                  },
                  value: {
                    type: "string",
                    example: "m",
                    description: "Option value",
                  },
                  price: {
                    type: "number",
                    format: "float",
                    example: 0,
                    description: "Additional price for this option",
                  },
                  stock: {
                    type: "integer",
                    example: 50,
                    description: "Stock for this option",
                  },
                },
              },
            },
          },
        },
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
            description: "Array of product objects with option types",
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
        example: "shirt",
        description: "Search term to filter products by name or description",
      },
      categoryId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Filter by category ID",
      },
      minPrice: {
        type: "string",
        example: "10",
        description: "Minimum price filter",
      },
      maxPrice: {
        type: "string",
        example: "100",
        description: "Maximum price filter",
      },
      inStock: {
        type: "string",
        enum: ["true", "false"],
        example: "true",
        description: "Filter by stock availability",
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
