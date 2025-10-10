// lib/utils/swagger/paths/product.ts
export const productPaths = {
  "/api/admin/product": {
    get: {
      summary: "List products",
      description:
        "Get all products with pagination, filtering, and optional inclusion of soft-deleted items. Populates category names. Admin only.",
      tags: ["Admin - Product Management"],
      security: [{ bearerAuth: [] }],
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
        {
          name: "includeDeleted",
          in: "query",
          description: "Include soft-deleted products in results",
          schema: {
            type: "boolean",
            default: false,
            example: false,
          },
        },
      ],
      responses: {
        "200": {
          description: "Products retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
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
                      },
                      pagination: {
                        $ref: "#/components/schemas/PaginationInfo",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "429": {
          description: "Rate limit exceeded (1000 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Create product",
      description:
        "Create a new product with image upload. Requires multipart/form-data. Admin only.",
      tags: ["Admin - Product Management"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              required: [
                "name",
                "price",
                "stock",
                "description",
                "categoryId",
                "image",
              ],
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
                  description: "Product image (JPEG, PNG, or WebP, max 5MB)",
                },
              },
            },
            encoding: {
              image: {
                contentType: "image/jpeg, image/png, image/webp",
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Product created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product created successfully",
                  },
                  data: { $ref: "#/components/schemas/ProductResponse" },
                },
              },
            },
          },
        },
        "400": {
          description: "Validation error or missing image",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Category not found or has been deleted" },
        "409": {
          description: "Product with this name already exists in the category",
        },
        "413": { description: "Image file too large (max 5MB)" },
        "429": {
          description: "Rate limit exceeded (1000 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/admin/product/{id}": {
    get: {
      summary: "Get product by ID",
      description:
        "Get a single product by ID with populated category name. Only returns non-deleted products. Admin only.",
      tags: ["Admin - Product Management"],
      security: [{ bearerAuth: [] }],
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
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product retrieved successfully",
                  },
                  data: { $ref: "#/components/schemas/ProductResponse" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid product ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Product not found" },
        "429": {
          description: "Rate limit exceeded (100 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    put: {
      summary: "Update product",
      description:
        "Update an existing product. Image is optional - if not provided, existing image is retained. Only works on non-deleted products. Admin only.",
      tags: ["Admin - Product Management"],
      security: [{ bearerAuth: [] }],
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
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
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
                  example: "Updated description",
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
          },
        },
      },
      responses: {
        "200": {
          description: "Product updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product updated successfully",
                  },
                  data: { $ref: "#/components/schemas/ProductResponse" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid product ID or validation error" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Product or category not found" },
        "409": { description: "Product name already exists in the category" },
        "413": { description: "Image file too large (max 5MB)" },
        "429": {
          description: "Rate limit exceeded (100 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    patch: {
      summary: "Update product (partial)",
      description:
        "Partially update an existing product. Only provided fields will be updated. Admin only.",
      tags: ["Admin - Product Management"],
      security: [{ bearerAuth: [] }],
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
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  minLength: 2,
                  maxLength: 200,
                  description: "Product name",
                },
                price: {
                  type: "number",
                  format: "float",
                  minimum: 0,
                  maximum: 999999.99,
                  description: "Product price",
                },
                stock: {
                  type: "integer",
                  minimum: 0,
                  maximum: 999999,
                  description: "Available stock quantity",
                },
                description: {
                  type: "string",
                  minLength: 10,
                  maxLength: 2000,
                  description: "Product description",
                },
                categoryId: {
                  type: "string",
                  description: "Category ID",
                },
                image: {
                  type: "string",
                  format: "binary",
                  description: "New product image (optional)",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Product updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product updated successfully",
                  },
                  data: { $ref: "#/components/schemas/ProductResponse" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid product ID or validation error" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Product or category not found" },
        "409": { description: "Product name already exists in the category" },
        "413": { description: "Image file too large (max 5MB)" },
        "429": {
          description: "Rate limit exceeded (100 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    delete: {
      summary: "Delete product",
      description:
        "Soft delete a product (default) or permanently delete with ?permanent=true. Permanent deletion removes the image file. Admin only.",
      tags: ["Admin - Product Management"],
      security: [{ bearerAuth: [] }],
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
        {
          name: "permanent",
          in: "query",
          description:
            "Permanently delete the product and its image (cannot be undone)",
          schema: {
            type: "boolean",
            default: false,
            example: false,
          },
        },
      ],
      responses: {
        "200": {
          description: "Product deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product deleted successfully",
                  },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid product ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Product not found" },
        "429": {
          description: "Rate limit exceeded (100 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Restore deleted product",
      description:
        "Restore a soft-deleted product. The product image must still exist. Admin only.",
      tags: ["Admin - Product Management"],
      security: [{ bearerAuth: [] }],
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
        {
          name: "action",
          in: "query",
          required: true,
          description: "Action to perform",
          schema: {
            type: "string",
            enum: ["restore"],
            example: "restore",
          },
        },
      ],
      responses: {
        "200": {
          description: "Product restored successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Product restored successfully",
                  },
                  data: { $ref: "#/components/schemas/ProductResponse" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid product ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Deleted product not found" },
        "409": {
          description:
            "Cannot restore: A product with this name already exists in the category",
        },
        "429": {
          description: "Rate limit exceeded (100 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
