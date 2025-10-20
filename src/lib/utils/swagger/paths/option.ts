// lib/utils/swagger/paths/option.ts
export const optionPaths = {
  "/api/admin/option-type": {
    get: {
      summary: "List all option types",
      description:
        "Get all option types for products. Can be filtered by productId. Admin only.",
      tags: ["Admin - Product Options"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "query",
          description: "Filter by product ID",
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Option types retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OptionTypesListResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Create option type",
      description:
        "Create a new option type for a product (e.g., Size, Color). Admin only.",
      tags: ["Admin - Product Options"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OptionTypeRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Option type created successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SingleOptionTypeResponse" },
            },
          },
        },
        "400": { description: "Validation error or invalid product ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Product not found" },
        "409": {
          description:
            "Option type with this name already exists for this product",
        },
        "500": { description: "Internal server error" },
      },
    },
  },

  "/api/admin/option-type/{id}": {
    get: {
      summary: "Get option type by ID",
      description: "Get a single option type. Admin only.",
      tags: ["Admin - Product Options"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Option type retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SingleOptionTypeResponse" },
            },
          },
        },
        "400": { description: "Invalid ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Option type not found" },
        "500": { description: "Internal server error" },
      },
    },
    put: {
      summary: "Update option type",
      description: "Update an existing option type. Admin only.",
      tags: ["Admin - Product Options"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OptionTypeRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Option type updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SingleOptionTypeResponse" },
            },
          },
        },
        "400": { description: "Validation error or invalid product ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Option type or product not found" },
        "409": {
          description: "Option type name already exists for this product",
        },
        "500": { description: "Internal server error" },
      },
    },
    delete: {
      summary: "Delete option type",
      description: "Soft delete an option type. Admin only.",
      tags: ["Admin - Product Options"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Option type deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DeleteResponse" },
            },
          },
        },
        "400": { description: "Invalid ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Option type not found" },
        "500": { description: "Internal server error" },
      },
    },
  },

  "/api/admin/option-value": {
    get: {
      summary: "List option values",
      description:
        "Get all option values, optionally filtered by option type. Admin only.",
      tags: ["Admin - Product Options"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "optionTypeId",
          in: "query",
          description: "Filter by option type ID",
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Option values retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OptionValuesListResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Create option value",
      description:
        "Create a new option value with price and stock. Admin only.",
      tags: ["Admin - Product Options"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OptionValueRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Option value created successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SingleOptionValueResponse",
              },
            },
          },
        },
        "400": { description: "Validation error or invalid option type ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Option type not found" },
        "409": { description: "Option value already exists for this type" },
        "500": { description: "Internal server error" },
      },
    },
  },

  "/api/admin/option-value/{id}": {
    get: {
      summary: "Get option value by ID",
      description:
        "Get a single option value with price and stock. Admin only.",
      tags: ["Admin - Product Options"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Option value retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SingleOptionValueResponse",
              },
            },
          },
        },
        "400": { description: "Invalid ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Option value not found" },
        "500": { description: "Internal server error" },
      },
    },
    put: {
      summary: "Update option value",
      description:
        "Update an existing option value including price and stock. Admin only.",
      tags: ["Admin - Product Options"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/OptionValueRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Option value updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SingleOptionValueResponse",
              },
            },
          },
        },
        "400": { description: "Validation error or invalid option type ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Option value or type not found" },
        "409": { description: "Option value already exists for this type" },
        "500": { description: "Internal server error" },
      },
    },
    delete: {
      summary: "Delete option value",
      description: "Soft delete an option value. Admin only.",
      tags: ["Admin - Product Options"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Option value deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DeleteResponse" },
            },
          },
        },
        "400": { description: "Invalid ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Option value not found" },
        "500": { description: "Internal server error" },
      },
    },
  },
};
