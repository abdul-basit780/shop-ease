// lib/utils/swagger/schemas/profile.ts
export const profileSchemas = {
  // Profile Response Schema
  ProfileResponse: {
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
        description: "Customer email address (read-only)",
      },
      dob: {
        type: "string",
        format: "date",
        example: "1990-01-15",
        description: "Customer date of birth",
      },
      phone: {
        type: "string",
        example: "+1234567890",
        description: "Customer phone number",
      },
      gender: {
        type: "string",
        enum: ["male", "female", "other"],
        example: "male",
        description: "Customer gender",
      },
      occupation: {
        type: "string",
        example: "Software Engineer",
        description: "Customer occupation (optional)",
        nullable: true,
      },
      isActive: {
        type: "boolean",
        example: true,
        description: "Whether the customer account is active",
      },
      isVerified: {
        type: "boolean",
        example: true,
        description: "Whether the customer email is verified",
      },
      totalOrders: {
        type: "integer",
        example: 5,
        description: "Total number of orders placed",
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

  // Update Profile Request Schema
  UpdateProfileRequest: {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        example: "John Doe",
        description: "Customer full name (optional)",
      },
      dob: {
        type: "string",
        format: "date",
        example: "1990-01-15",
        description:
          "Customer date of birth (optional, must be at least 13 years old)",
      },
      phone: {
        type: "string",
        minLength: 10,
        maxLength: 20,
        example: "+1234567890",
        description: "Customer phone number (optional, must be unique)",
      },
      gender: {
        type: "string",
        enum: ["male", "female", "other"],
        example: "male",
        description: "Customer gender (optional)",
      },
      occupation: {
        type: "string",
        maxLength: 100,
        example: "Software Engineer",
        description: "Customer occupation (optional, can be empty to clear)",
      },
    },
  },

  // Get Profile Response
  GetProfileResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Profile retrieved successfully",
      },
      data: {
        $ref: "#/components/schemas/ProfileResponse",
      },
    },
  },

  // Update Profile Response
  UpdateProfileResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Profile updated successfully",
      },
      data: {
        $ref: "#/components/schemas/ProfileResponse",
      },
    },
  },

  // Profile Error Response
  ProfileErrorResponse: {
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
            example: "PHONE_EXISTS",
            description: "Error code for programmatic handling",
          },
          details: {
            type: "array",
            items: { type: "string" },
            example: [
              "Name must be at least 2 characters",
              "Phone number already exists",
              "You must be at least 13 years old",
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
