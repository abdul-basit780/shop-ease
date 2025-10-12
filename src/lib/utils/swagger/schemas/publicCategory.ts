// lib/utils/swagger/schemas/publicCategory.ts
export const publicCategorySchemas = {
  // Public Category Response Schema (without deletedAt)
  PublicCategoryResponse: {
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
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Category creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Last update timestamp",
      },
    },
  },

  // Public Categories List Response
  PublicCategoriesListResponse: {
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
            items: { $ref: "#/components/schemas/PublicCategoryResponse" },
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

  // Single Public Category Response
  SinglePublicCategoryResponse: {
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
        $ref: "#/components/schemas/PublicCategoryResponse",
      },
    },
  },

  // Public Category Query Parameters
  PublicCategoryQueryParams: {
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
        example: "electronics",
        description: "Search term to filter categories by name or description",
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
    },
  },

  // Public Category Error Response
  PublicCategoryErrorResponse: {
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
            example: ["Category not found", "Invalid category ID"],
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
