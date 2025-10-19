// lib/utils/swagger/paths/category.ts
export const categoryPaths = {
  "/api/admin/category": {
    get: {
      summary: "List categories",
      description:
        "Get all categories with pagination, filtering, and optional inclusion of soft-deleted items. Supports filtering by parent category. Admin only.",
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
        {
          name: "parentId",
          in: "query",
          description:
            "Filter by parent category ID (use 'null' or empty string for top-level categories)",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
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
      description: "Create a new category or subcategory. Admin only.",
      tags: ["Admin - Category Management"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CategoryRequest" },
            examples: {
              topLevelCategory: {
                summary: "Top-level category",
                value: {
                  name: "Electronics",
                  description: "Electronic devices and accessories",
                  parentId: null,
                },
              },
              subcategory: {
                summary: "Subcategory",
                value: {
                  name: "Smartphones",
                  description: "Mobile phones and accessories",
                  parentId: "507f1f77bcf86cd799439011",
                },
              },
            },
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
        "400": { description: "Validation error or invalid parent ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Parent category not found" },
        "409": {
          description: "Category with this name already exists in parent",
        },
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
        "Update an existing category. Can change parent category. Only works on non-deleted categories. Admin only.",
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
        "400": {
          description:
            "Invalid category ID, validation error, or circular reference",
          content: {
            "application/json": {
              examples: {
                circularReference: {
                  summary: "Circular reference error",
                  value: {
                    success: false,
                    message: "Category cannot be its own parent",
                  },
                },
              },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Category or parent category not found" },
        "409": { description: "Category name already exists in parent" },
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
        "Soft delete a category (default) or permanently delete with ?permanent=true. Cannot delete categories that have subcategories. Admin only.",
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
        "400": {
          description: "Invalid category ID or category has subcategories",
          content: {
            "application/json": {
              examples: {
                hasSubcategories: {
                  summary: "Has subcategories",
                  value: {
                    success: false,
                    message:
                      "Cannot delete category with subcategories. Delete subcategories first.",
                  },
                },
              },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Category not found" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Restore deleted category",
      description:
        "Restore a soft-deleted category. Parent category must exist and be active. Admin only.",
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
        "400": {
          description: "Invalid category ID or parent not available",
          content: {
            "application/json": {
              examples: {
                parentDeleted: {
                  summary: "Parent deleted",
                  value: {
                    success: false,
                    message:
                      "Cannot restore: parent category not found or deleted",
                  },
                },
              },
            },
          },
        },
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
