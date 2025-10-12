// lib/utils/swagger/schemas/address.ts
export const addressSchemas = {
  // Address Response Schema
  AddressResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Address unique identifier",
      },
      street: {
        type: "string",
        example: "123 Main Street",
        description: "Street address",
      },
      city: {
        type: "string",
        example: "New York",
        description: "City name",
      },
      state: {
        type: "string",
        example: "NY",
        description: "State or province",
      },
      zipCode: {
        type: "string",
        example: "10001",
        description: "Postal/ZIP code",
      },
      customerId: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
        description: "Customer ID who owns this address",
      },
      fullAddress: {
        type: "string",
        example: "123 Main Street, New York, NY 10001",
        description: "Complete formatted address",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Address creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Last update timestamp",
      },
    },
  },

  // Add Address Request Schema
  AddAddressRequest: {
    type: "object",
    required: ["street", "city", "state", "zipCode"],
    properties: {
      street: {
        type: "string",
        minLength: 5,
        maxLength: 200,
        example: "123 Main Street",
        description: "Street address (5-200 characters)",
      },
      city: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        example: "New York",
        description: "City name (2-100 characters)",
      },
      state: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        example: "NY",
        description: "State or province (2-100 characters)",
      },
      zipCode: {
        type: "string",
        minLength: 3,
        maxLength: 20,
        example: "10001",
        description: "Postal/ZIP code (3-20 characters)",
      },
    },
  },

  // Update Address Request Schema
  UpdateAddressRequest: {
    type: "object",
    properties: {
      street: {
        type: "string",
        minLength: 5,
        maxLength: 200,
        example: "456 Oak Avenue",
        description: "Street address (optional, 5-200 characters)",
      },
      city: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        example: "Los Angeles",
        description: "City name (optional, 2-100 characters)",
      },
      state: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        example: "CA",
        description: "State or province (optional, 2-100 characters)",
      },
      zipCode: {
        type: "string",
        minLength: 3,
        maxLength: 20,
        example: "90001",
        description: "Postal/ZIP code (optional, 3-20 characters)",
      },
    },
  },

  // Delete Address Request Schema
  DeleteAddressRequest: {
    type: "object",
    description: "No body required - address ID is in the URL path",
  },

  // List Addresses Response
  ListAddressesResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Addresses retrieved successfully",
      },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/AddressResponse" },
        description: "Array of address objects",
      },
    },
  },

  // Single Address Response
  SingleAddressResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Address added successfully",
      },
      data: {
        $ref: "#/components/schemas/AddressResponse",
      },
    },
  },

  // Delete Address Response
  DeleteAddressResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Address deleted successfully",
      },
      data: {
        type: "null",
        description: "No data returned for delete operations",
      },
    },
  },

  // Address Error Response
  AddressErrorResponse: {
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
            example: "ADDRESS_NOT_FOUND",
            description: "Error code for programmatic handling",
          },
          details: {
            type: "array",
            items: { type: "string" },
            example: [
              "Address ID is required",
              "Street must be at least 5 characters",
              "Address not found",
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
