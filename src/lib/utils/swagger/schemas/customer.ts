// lib/utils/swagger/schemas/customer.ts
export const customerSchemas = {
  // Customer Response Schema
  CustomerResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Customer unique identifier",
      },
      name: {
        type: "string",
        example: "John Doe",
        description: "Customer full name",
      },
      email: {
        type: "string",
        format: "email",
        example: "john.doe@example.com",
        description: "Customer email address",
      },
      phone: {
        type: "string",
        example: "+1234567890",
        description: "Customer phone number",
      },
      dob: {
        type: "string",
        format: "date",
        example: "1990-01-15",
        description: "Customer date of birth",
      },
      gender: {
        type: "string",
        enum: ["male", "female", "other"],
        example: "male",
        description: "Customer gender",
      },
      isActive: {
        type: "boolean",
        example: true,
        description: "Whether the customer account is active",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Account creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Last update timestamp",
      },
    },
  },

  // Customers List Response
  CustomersListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Customers retrieved successfully",
      },
      customers: {
        type: "array",
        items: { $ref: "#/components/schemas/CustomerResponse" },
        description: "Array of customer objects",
      },
      pagination: {
        $ref: "#/components/schemas/PaginationInfo",
        description: "Pagination information",
      },
    },
  },

  // Single Customer Response
  SingleCustomerResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Customer retrieved successfully",
      },
      customer: {
        $ref: "#/components/schemas/CustomerResponse",
      },
    },
  },

  // Update Customer Status Request
  UpdateCustomerStatusRequest: {
    type: "object",
    required: ["isActive"],
    properties: {
      isActive: {
        type: "boolean",
        example: true,
        description:
          "Set customer account status (true = active, false = inactive)",
      },
    },
  },

  // Update Customer Status Response
  UpdateCustomerStatusResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Customer status updated successfully",
      },
      customer: {
        $ref: "#/components/schemas/CustomerResponse",
      },
    },
  },

  // Customer Query Parameters
  CustomerQueryParams: {
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
        example: "john",
        description: "Search term to filter customers by name or email",
      },
      gender: {
        type: "string",
        enum: ["male", "female", "other"],
        example: "male",
        description: "Filter by gender",
      },
      isActive: {
        type: "string",
        enum: ["true", "false"],
        example: "true",
        description: "Filter by account status",
      },
      sortBy: {
        type: "string",
        default: "name",
        enum: ["name", "email", "createdAt", "updatedAt"],
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

  // Customer Error Response
  CustomerErrorResponse: {
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
            example: "CUSTOMER_NOT_FOUND",
            description: "Error code for programmatic handling",
          },
          details: {
            type: "array",
            items: { type: "string" },
            example: [
              "Customer not found",
              "Invalid customer ID",
              "isActive field is required and must be a boolean",
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
};
