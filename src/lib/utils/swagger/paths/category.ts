// lib/utils/swagger/paths/category.ts
export const categoryPaths = {
  "/api/admin/category": {
    get: {
      summary: "List categories",
      description:
        "Get all categories with pagination, filtering, and optional inclusion of soft-deleted items. Admin only.",
      tags: ["Admin - Category Management"],
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
          description: "Search term to filter categories by name",
          schema: {
            type: "string",
            example: "Electronics",
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
        {
          name: "includeDeleted",
          in: "query",
          description: "Include soft-deleted categories in results",
          schema: {
            type: "boolean",
            default: false,
            example: false,
          },
        },
      ],
      responses: {
        "200": {
          description: "Categories retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Categories retrieved successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      categories: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/CategoryResponse",
                        },
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
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Create category",
      description: "Create a new category. Admin only.",
      tags: ["Admin - Category Management"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoryRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Category created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Category created successfully",
                  },
                  data: { $ref: "#/components/schemas/CategoryResponse" },
                },
              },
            },
          },
        },
        "400": { description: "Validation error" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "409": { description: "Category already exists" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/admin/category/{id}": {
    get: {
      summary: "Get category by ID",
      description:
        "Get a single category by ID. Only returns non-deleted categories unless specified. Admin only.",
      tags: ["Admin - Category Management"],
      security: [{ bearerAuth: [] }],
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
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Category retrieved successfully",
                  },
                  data: { $ref: "#/components/schemas/CategoryResponse" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid category ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Category not found" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
    put: {
      summary: "Update category",
      description:
        "Update an existing category. Only works on non-deleted categories. Admin only.",
      tags: ["Admin - Category Management"],
      security: [{ bearerAuth: [] }],
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
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoryRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Category updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Category updated successfully",
                  },
                  data: { $ref: "#/components/schemas/CategoryResponse" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid category ID or validation error" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Category not found" },
        "409": { description: "Category name already exists" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
    patch: {
      summary: "Update category (partial)",
      description:
        "Partially update an existing category. Only works on non-deleted categories. Admin only.",
      tags: ["Admin - Category Management"],
      security: [{ bearerAuth: [] }],
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
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoryRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Category updated successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Category updated successfully",
                  },
                  data: { $ref: "#/components/schemas/CategoryResponse" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid category ID or validation error" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Category not found" },
        "409": { description: "Category name already exists" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
    delete: {
      summary: "Delete category",
      description:
        "Soft delete a category (default) or permanently delete with ?permanent=true. Admin only.",
      tags: ["Admin - Category Management"],
      security: [{ bearerAuth: [] }],
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
        {
          name: "permanent",
          in: "query",
          description: "Permanently delete the category (cannot be undone)",
          schema: {
            type: "boolean",
            default: false,
            example: false,
          },
        },
      ],
      responses: {
        "200": {
          description: "Category deleted successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Category deleted successfully",
                  },
                  data: { type: "null" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid category ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Category not found" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Restore deleted category",
      description: "Restore a soft-deleted category. Admin only.",
      tags: ["Admin - Category Management"],
      security: [{ bearerAuth: [] }],
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
          description: "Category restored successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Category restored successfully",
                  },
                  data: { $ref: "#/components/schemas/CategoryResponse" },
                },
              },
            },
          },
        },
        "400": { description: "Invalid category ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Deleted category not found" },
        "409": {
          description:
            "Cannot restore: A category with this name already exists",
        },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
  },
};
