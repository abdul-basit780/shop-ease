// lib/utils/swagger/paths/profile.ts
export const profilePaths = {
  "/api/customer/profile": {
    get: {
      summary: "Get customer profile",
      description:
        "Get the authenticated customer's profile information including personal details and account status. Customer only.",
      tags: ["Customer - Profile"],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Profile retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GetProfileResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Customer not found" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    put: {
      summary: "Update customer profile",
      description:
        "Update the authenticated customer's profile. Only provided fields will be updated. Email cannot be changed. Password and address have separate routes. Customer only.",
      tags: ["Customer - Profile"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateProfileRequest" },
            examples: {
              updateName: {
                summary: "Update name only",
                value: {
                  name: "Jane Smith",
                },
              },
              updatePhone: {
                summary: "Update phone only",
                value: {
                  phone: "+9876543210",
                },
              },
              updateMultiple: {
                summary: "Update multiple fields",
                value: {
                  name: "Jane Smith",
                  phone: "+9876543210",
                  gender: "female",
                  occupation: "Product Manager",
                },
              },
              clearOccupation: {
                summary: "Clear occupation field",
                value: {
                  occupation: "",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Profile updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileResponse" },
            },
          },
        },
        "400": {
          description: "Validation error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ProfileErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Customer not found" },
        "409": { description: "Phone number already exists" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
