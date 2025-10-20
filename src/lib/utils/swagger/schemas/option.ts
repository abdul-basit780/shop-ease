// lib/utils/swagger/schemas/option.ts
export const optionSchemas = {
  // Option Type Schemas
  OptionTypeRequest: {
    type: "object",
    required: ["productId", "name"],
    properties: {
      productId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Product ID that this option type belongs to",
      },
      name: {
        type: "string",
        minLength: 1,
        maxLength: 50,
        example: "Size",
        description:
          "Option type name (e.g., Size, Color, Material). Must be unique for this product.",
      },
    },
  },

  OptionTypeResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
      },
      productId: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
        description: "Product ID that this option type belongs to",
      },
      productName: {
        type: "string",
        example: "T-Shirt",
        description: "Product name (populated)",
      },
      name: {
        type: "string",
        example: "size",
      },
      deletedAt: {
        type: "string",
        format: "date-time",
        nullable: true,
        example: null,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
      },
    },
  },

  // Option Value Schemas
  OptionValueRequest: {
    type: "object",
    required: ["optionTypeId", "value"],
    properties: {
      optionTypeId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Option type ID",
      },
      value: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        example: "M",
        description:
          "Option value (e.g., M, Red, Cotton). Must be unique for this option type.",
      },
      price: {
        type: "number",
        format: "float",
        minimum: 0,
        example: 5.0,
        description: "Additional price for this option (default: 0)",
      },
      stock: {
        type: "integer",
        minimum: 0,
        example: 100,
        description: "Stock quantity for this option (default: 0)",
      },
    },
  },

  OptionValueResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
      },
      optionTypeId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
      },
      optionTypeName: {
        type: "string",
        example: "size",
        description: "Populated option type name",
      },
      value: {
        type: "string",
        example: "m",
      },
      price: {
        type: "number",
        format: "float",
        example: 5.0,
        description: "Additional price for this option",
      },
      stock: {
        type: "integer",
        example: 100,
        description: "Available stock for this option",
      },
      deletedAt: {
        type: "string",
        format: "date-time",
        nullable: true,
        example: null,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
      },
    },
  },

  // List Responses
  OptionTypesListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example: "Option types retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          optionTypes: {
            type: "array",
            items: { $ref: "#/components/schemas/OptionTypeResponse" },
          },
        },
      },
    },
  },

  OptionValuesListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example: "Option values retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          optionValues: {
            type: "array",
            items: { $ref: "#/components/schemas/OptionValueResponse" },
          },
        },
      },
    },
  },

  // Single Item Responses
  SingleOptionTypeResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example: "Option type retrieved successfully",
      },
      data: { $ref: "#/components/schemas/OptionTypeResponse" },
    },
  },

  SingleOptionValueResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example: "Option value retrieved successfully",
      },
      data: { $ref: "#/components/schemas/OptionValueResponse" },
    },
  },

  // Delete Response
  DeleteResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Deleted successfully" },
      data: { type: "null" },
    },
  },
};
