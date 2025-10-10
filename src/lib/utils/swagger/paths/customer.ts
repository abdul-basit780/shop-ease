// lib/utils/swagger/paths/customer.ts
export const customerPaths = {
  "/api/admin/customer": {
    get: {
      summary: "List customers",
      description:
        "Get all customers with pagination, filtering, and sorting. Only returns active customers by default. Admin only.",
      tags: ["Admin - Customer Management"],
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
          description: "Search term to filter customers by name or email",
          schema: {
            type: "string",
            example: "john",
          },
        },
        {
          name: "gender",
          in: "query",
          description: "Filter by gender",
          schema: {
            type: "string",
            enum: ["male", "female", "other"],
            example: "male",
          },
        },
        {
          name: "isActive",
          in: "query",
          description: "Filter by account status",
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
            enum: ["name", "email", "createdAt", "updatedAt"],
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
      ],
      responses: {
        "200": {
          description: "Customers retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CustomersListResponse",
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
  },

  "/api/admin/customer/{id}": {
    get: {
      summary: "Get customer by ID",
      description: "Get a single customer by ID with full details. Admin only.",
      tags: ["Admin - Customer Management"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Customer ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
      ],
      responses: {
        "200": {
          description: "Customer retrieved successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SingleCustomerResponse",
              },
            },
          },
        },
        "400": { description: "Invalid customer ID" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Customer not found" },
        "429": {
          description: "Rate limit exceeded (100 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },

  "/api/admin/customer/{id}/status": {
    patch: {
      summary: "Update customer status",
      description:
        "Activate or deactivate a customer account. Inactive customers cannot log in. Admin only.",
      tags: ["Admin - Customer Management"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Customer ID",
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
            schema: {
              $ref: "#/components/schemas/UpdateCustomerStatusRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Customer status updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpdateCustomerStatusResponse",
              },
            },
          },
        },
        "400": {
          description: "Invalid customer ID or validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CustomerErrorResponse",
              },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Admin only)" },
        "404": { description: "Customer not found" },
        "409": { description: "Customer already has the requested status" },
        "429": {
          description: "Rate limit exceeded (100 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
