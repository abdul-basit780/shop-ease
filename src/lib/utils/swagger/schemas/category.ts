// lib/utils/swagger/schemas/category.ts
export const categorySchemas = {
  CategoryRequest: {
    type: "object",
    required: ["name", "description"],
    properties: {
      name: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        example: "Electronics",
        description: "Category name (must be unique within parent category)",
      },
      description: {
        type: "string",
        minLength: 1,
        maxLength: 500,
        example: "Electronic devices and accessories",
        description: "Category description",
      },
      parentId: {
        type: "string",
        nullable: true,
        example: "507f1f77bcf86cd799439011",
        description: "Parent category ID (null for top-level categories)",
      },
    },
  },

  CategoryResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Category unique identifier",
      },
      name: {
        type: "string",
        example: "Electronics",
        description: "Category name",
      },
      description: {
        type: "string",
        example: "Electronic devices and accessories",
        description: "Category description",
      },
      parentId: {
        type: "string",
        nullable: true,
        example: null,
        description: "Parent category ID (null for top-level categories)",
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

  PaginationInfo: {
    type: "object",
    properties: {
      page: {
        type: "number",
        example: 1,
        description: "Current page number",
      },
      limit: {
        type: "number",
        example: 10,
        description: "Items per page",
      },
      total: {
        type: "number",
        example: 100,
        description: "Total number of items",
      },
      totalPages: {
        type: "number",
        example: 10,
        description: "Total number of pages",
      },
      hasNext: {
        type: "boolean",
        example: true,
        description: "Whether there is a next page",
      },
      hasPrev: {
        type: "boolean",
        example: false,
        description: "Whether there is a previous page",
      },
    },
  },

  CategoriesListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Categories retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          categories: {
            type: "array",
            items: { $ref: "#/components/schemas/CategoryResponse" },
            description: "Array of category objects",
          },
          pagination: {
            $ref: "#/components/schemas/PaginationInfo",
            description: "Pagination information",
          },
        },
      },
    },
  },

  SingleCategoryResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Category retrieved successfully",
      },
      data: {
        $ref: "#/components/schemas/CategoryResponse",
      },
    },
  },

  CategoryCreateResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Category created successfully",
      },
      data: {
        $ref: "#/components/schemas/CategoryResponse",
      },
    },
  },

  CategoryUpdateResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Category updated successfully",
      },
      data: {
        $ref: "#/components/schemas/CategoryResponse",
      },
    },
  },

  CategoryDeleteResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Category deleted successfully",
      },
      data: {
        type: "null",
        description: "No data returned for delete operations",
      },
    },
  },

  CategoryRestoreResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Category restored successfully",
      },
      data: {
        $ref: "#/components/schemas/CategoryResponse",
      },
    },
  },

  CategoryErrorResponse: {
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
            example: "CATEGORY_NOT_FOUND",
            description: "Error code for programmatic handling",
          },
          details: {
            type: "array",
            items: { type: "string" },
            example: ["Name is required", "Description is required"],
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

  CategoryQueryParams: {
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
        example: "Electronics",
        description: "Search term to filter categories by name",
      },
      sortBy: {
        type: "string",
        default: "name",
        enum: ["name", "createdAt", "updatedAt"],
        example: "name",
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
        description: "Include soft-deleted categories in results",
      },
      parentId: {
        type: "string",
        nullable: true,
        example: "507f1f77bcf86cd799439011",
        description:
          "Filter by parent category ID (use 'null' for top-level categories)",
      },
    },
  },

  BulkCategoryRequest: {
    type: "object",
    properties: {
      categoryIds: {
        type: "array",
        items: { type: "string" },
        example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
        description: "Array of category IDs for bulk operations",
      },
      operation: {
        type: "string",
        enum: ["delete", "restore", "permanent-delete"],
        example: "delete",
        description: "Bulk operation type",
      },
    },
  },
};
