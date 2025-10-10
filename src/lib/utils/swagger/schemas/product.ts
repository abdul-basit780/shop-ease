// lib/utils/swagger/schemas/product.ts
export const productSchemas = {
  // Product Response Schema
  ProductResponse: {
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
      deletedAt: {
        type: "string",
        format: "date-time",
        nullable: true,
        example: null,
        description: "Soft delete timestamp (null if not deleted)",
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

  // Product Create Request Schema (for documentation)
  ProductCreateRequest: {
    type: "object",
    required: ["name", "price", "stock", "description", "categoryId", "image"],
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 200,
        example: "Gaming Laptop",
        description: "Product name (must be unique within category)",
      },
      price: {
        type: "number",
        format: "float",
        minimum: 0,
        maximum: 999999.99,
        example: 1299.99,
        description: "Product price",
      },
      stock: {
        type: "integer",
        minimum: 0,
        maximum: 999999,
        example: 15,
        description: "Available stock quantity",
      },
      description: {
        type: "string",
        minLength: 10,
        maxLength: 2000,
        example: "High-performance gaming laptop with RTX 4060",
        description: "Product description",
      },
      categoryId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Category ID (must exist and not be deleted)",
      },
      image: {
        type: "string",
        format: "binary",
        description: "Product image file (JPEG, PNG, or WebP, max 5MB)",
      },
    },
  },

  // Product Update Request Schema
  ProductUpdateRequest: {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 200,
        example: "Updated Gaming Laptop",
        description: "Product name",
      },
      price: {
        type: "number",
        format: "float",
        minimum: 0,
        maximum: 999999.99,
        example: 1199.99,
        description: "Product price",
      },
      stock: {
        type: "integer",
        minimum: 0,
        maximum: 999999,
        example: 10,
        description: "Available stock quantity",
      },
      description: {
        type: "string",
        minLength: 10,
        maxLength: 2000,
        example: "Updated product description",
        description: "Product description",
      },
      categoryId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Category ID",
      },
      image: {
        type: "string",
        format: "binary",
        description:
          "New product image (optional, old image will be deleted if provided)",
      },
    },
  },

  // Products List Response
  ProductsListResponse: {
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
            items: { $ref: "#/components/schemas/ProductResponse" },
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

  // Single Product Response
  SingleProductResponse: {
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
        $ref: "#/components/schemas/ProductResponse",
      },
    },
  },

  // Product Create Response
  ProductCreateResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Product created successfully",
      },
      data: {
        $ref: "#/components/schemas/ProductResponse",
      },
    },
  },

  // Product Update Response
  ProductUpdateResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Product updated successfully",
      },
      data: {
        $ref: "#/components/schemas/ProductResponse",
      },
    },
  },

  // Product Delete Response
  ProductDeleteResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Product deleted successfully",
      },
      data: {
        type: "null",
        description: "No data returned for delete operations",
      },
    },
  },

  // Product Restore Response
  ProductRestoreResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Product restored successfully",
      },
      data: {
        $ref: "#/components/schemas/ProductResponse",
      },
    },
  },

  // Product Query Parameters
  ProductQueryParams: {
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
      includeDeleted: {
        type: "boolean",
        default: false,
        example: false,
        description: "Include soft-deleted products in results",
      },
    },
  },

  // Product Error Response
  ProductErrorResponse: {
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
            example: [
              "Name is required",
              "Price must be a valid number",
              "Image size must not exceed 5MB",
            ],
            description: "Detailed error messages or validation errors",
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

  // Image Upload Requirements
  ImageRequirements: {
    type: "object",
    properties: {
      maxSize: {
        type: "string",
        example: "5MB",
        description: "Maximum file size",
      },
      allowedTypes: {
        type: "array",
        items: { type: "string" },
        example: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
        description: "Allowed MIME types",
      },
      allowedExtensions: {
        type: "array",
        items: { type: "string" },
        example: [".jpg", ".jpeg", ".png", ".webp"],
        description: "Allowed file extensions",
      },
    },
  },

  // Bulk Product Operations (for future enhancement)
  BulkProductRequest: {
    type: "object",
    properties: {
      productIds: {
        type: "array",
        items: { type: "string" },
        example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
        description: "Array of product IDs for bulk operations",
      },
      operation: {
        type: "string",
        enum: ["delete", "restore", "permanent-delete", "update-category"],
        example: "delete",
        description: "Bulk operation type",
      },
      data: {
        type: "object",
        properties: {
          categoryId: {
            type: "string",
            example: "507f1f77bcf86cd799439013",
            description: "New category ID for bulk category update",
          },
          stock: {
            type: "integer",
            example: 0,
            description: "Set stock for all products",
          },
        },
      },
    },
  },

  // Stock Update Request
  StockUpdateRequest: {
    type: "object",
    required: ["stock"],
    properties: {
      stock: {
        type: "integer",
        minimum: 0,
        maximum: 999999,
        example: 25,
        description: "New stock quantity",
      },
      adjustment: {
        type: "boolean",
        default: false,
        description:
          "If true, stock value is added/subtracted from current stock",
      },
    },
  },

  // Price Update Request
  PriceUpdateRequest: {
    type: "object",
    required: ["price"],
    properties: {
      price: {
        type: "number",
        format: "float",
        minimum: 0,
        maximum: 999999.99,
        example: 899.99,
        description: "New price",
      },
      discountPercentage: {
        type: "number",
        format: "float",
        minimum: 0,
        maximum: 100,
        example: 10,
        description: "Apply discount percentage to current price",
      },
    },
  },
};