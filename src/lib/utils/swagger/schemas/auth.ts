// lib/utils/swagger/schemas/auth.ts
import { UserRole, Gender } from "../../../models/enums";

export const authSchemas = {
  // User Response Model
  UserResponse: {
    type: "object",
    properties: {
      id: { type: "string", description: "User ID" },
      name: { type: "string", description: "User full name" },
      email: { type: "string", description: "User email address" },
      phone: { type: "string", description: "User phone number" },
      role: {
        type: "string",
        enum: Object.values(UserRole),
        description: "User role",
      },
      isActive: {
        type: "boolean",
        description: "Account active status",
      },
    },
  },

  // Authentication Response
  AuthResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Login successful" },
      data: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Login successful" },
          user: { $ref: "#/components/schemas/UserResponse" },
          token: {
            type: "string",
            description: "JWT authentication token",
          },
          expiresIn: {
            type: "string",
            example: "7d",
            description: "Token expiration time",
          },
          isVerified: {
            type: "boolean",
            description: "Email verification status (customers only)",
          },
        },
      },
    },
  },

  // Login Request
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "user@example.com",
        description: "User email address",
      },
      password: {
        type: "string",
        format: "password",
        example: "password123",
        description: "User password",
      },
    },
  },

  // Customer Registration Request
  CustomerRegistrationRequest: {
    type: "object",
    required: [
      "name",
      "email",
      "password",
      "dob",
      "phone",
      "gender",
      "address",
    ],
    properties: {
      name: {
        type: "string",
        example: "John Doe",
        minLength: 2,
        maxLength: 100,
        description: "Customer full name",
      },
      email: {
        type: "string",
        format: "email",
        example: "john@example.com",
        description: "Customer email address",
      },
      password: {
        type: "string",
        format: "password",
        example: "Password123@",
        minLength: 6,
        description: "Account password (minimum 6 characters)",
      },
      dob: {
        type: "string",
        format: "date",
        example: "1990-01-01",
        description: "Date of birth (YYYY-MM-DD)",
      },
      phone: {
        type: "string",
        pattern: "^\\+?[0-9]{7,15}$",
        example: "+1234567890",
        description: "Phone number (7-15 digits, optional + prefix)",
      },
      gender: {
        type: "string",
        enum: Object.values(Gender),
        description: "Customer gender",
      },
      address: {
        $ref: "#/components/schemas/Address",
        description: "Customer address",
      },
      occupation: {
        type: "string",
        example: "Software Engineer",
        maxLength: 100,
        description: "Customer occupation (optional)",
      },
    },
  },

  // Address Schema
  Address: {
    type: "object",
    required: ["street", "city", "state", "zipCode"],
    properties: {
      street: {
        type: "string",
        example: "123 Main St",
        description: "Street address",
      },
      city: {
        type: "string",
        example: "New York",
        description: "City",
      },
      state: {
        type: "string",
        example: "NY",
        description: "State or province",
      },
      zipCode: {
        type: "string",
        pattern: "^\\d{5}(?:-\\d{4})?$",
        example: "10001",
        description: "ZIP or postal code",
      },
    },
  },

  // Registration Response
  RegistrationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Registration successful" },
      data: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Registration successful" },
          user: { $ref: "#/components/schemas/UserResponse" },
          token: {
            type: "string",
            description: "JWT authentication token",
          },
          expiresIn: {
            type: "string",
            example: "7d",
            description: "Token expiration time",
          },
        },
      },
    },
  },

  // Change Password Request (for authenticated users)
  ChangePasswordRequest: {
    type: "object",
    required: ["currentPassword", "newPassword"],
    properties: {
      currentPassword: {
        type: "string",
        format: "password",
        example: "currentPassword123",
        description: "Current password for verification",
      },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 6,
        example: "newPassword123@",
        description: "New password (minimum 6 characters)",
      },
    },
  },

  // Forgot Password Request
  ForgotPasswordRequest: {
    type: "object",
    required: ["email"],
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "user@example.com",
        description:
          "Email address for password reset (Admin accounts excluded)",
      },
    },
  },

  // Reset Password Request
  ResetPasswordRequest: {
    type: "object",
    required: ["token", "newPassword"],
    properties: {
      token: {
        type: "string",
        description: "Password reset token received via email",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
      newPassword: {
        type: "string",
        format: "password",
        minLength: 6,
        example: "NewPassword123@",
        description: "New password (minimum 6 characters)",
      },
    },
  },

  // Email Verification Request
  VerifyEmailRequest: {
    type: "object",
    required: ["token"],
    properties: {
      token: {
        type: "string",
        description: "Email verification token received via email",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
  },

  // Generic Success Response
  SuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example: "Operation completed successfully",
      },
      data: {
        type: "object",
        additionalProperties: true,
        description: "Response data (structure varies by endpoint)",
      },
    },
  },

  // Error Response
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: {
        type: "string",
        example: "Error message describing what went wrong",
      },
      error: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "Error code for programmatic handling",
          },
          details: {
            type: "array",
            items: { type: "string" },
            description: "Detailed error messages or validation errors",
          },
        },
      },
    },
  },

  // Me Endpoint Response
  MeResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example: "User data retrieved successfully",
      },
      data: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/UserResponse" },
          success: { type: "boolean", example: true },
          message: {
            type: "string",
            example: "User data retrieved successfully",
          },
        },
      },
    },
  },

  // Password Change Response
  PasswordChangeResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example: "Password has been changed successfully.",
      },
      data: { type: "object", example: {} },
    },
  },

  // Email Verification Response
  EmailVerificationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example:
          "Verification email sent successfully. Please check your inbox.",
      },
      data: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string" },
        },
      },
    },
  },
};
