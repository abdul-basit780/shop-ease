// lib/utils/swagger/paths/address.ts
export const addressPaths = {
  "/api/customer/address": {
    get: {
      summary: "List customer addresses",
      description:
        "Get all addresses for the authenticated customer, sorted by creation date (newest first). Customer only.",
      tags: ["Customer - Address"],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Addresses retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ListAddressesResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Add new address",
      description:
        "Add a new address for the authenticated customer. All fields are required. Customer only.",
      tags: ["Customer - Address"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddAddressRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Address added successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SingleAddressResponse" },
            },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddressErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/customer/address/{id}": {
    put: {
      summary: "Update address",
      description:
        "Update an existing address. Only provided fields will be updated. Address must belong to the authenticated customer. Customer only.",
      tags: ["Customer - Address"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Address ID",
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
          },
        },
      },
      responses: {
        "200": {
          description: "Address updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SingleAddressResponse" },
            },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddressErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Address not found" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    delete: {
      summary: "Delete address",
      description:
        "Delete an address. Address must belong to the authenticated customer. Customer only.",
      tags: ["Customer - Address"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "Address ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
      ],
      responses: {
        "200": {
          description: "Address deleted successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/DeleteAddressResponse" },
            },
          },
        },
        "400": {
          description: "Invalid address ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddressErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Address not found" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
