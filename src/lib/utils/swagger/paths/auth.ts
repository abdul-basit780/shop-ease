// lib/utils/swagger/paths/auth.ts
import { UserRole, Gender } from "../../../models/enums";

export const authPaths = {
  "/api/auth/login": {
    post: {
      summary: "User login",
      description:
        "Authenticate user and return JWT token for admin or customer",
      tags: ["Authentication"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "user@example.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "password123",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string", example: "Login successful" },
                  data: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: { type: "string", example: "Login successful" },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          email: { type: "string" },
                          phone: { type: "string" },
                          role: {
                            type: "string",
                            enum: Object.values(UserRole),
                          },
                          isActive: {
                            type: "boolean",
                            description:
                              "Account active status (customers only)",
                          },
                          isVerified: {
                            type: "boolean",
                            description:
                              "Email verification status (customers only)",
                          },
                        },
                      },
                      token: { type: "string" },
                      expiresIn: { type: "string", example: "7d" },
                    },
                  },
                },
              },
            },
          },
        },
        "401": { description: "Invalid credentials or inactive account" },
        "423": { description: "Account is locked (too many failed attempts)" },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/auth/register": {
    post: {
      summary: "Customer registration",
      description: "Register a new customer account",
      tags: ["Authentication"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
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
                name: { type: "string", example: "John Doe" },
                email: {
                  type: "string",
                  format: "email",
                  example: "john@example.com",
                },
                password: {
                  type: "string",
                  format: "password",
                  example: "Password123@",
                  minLength: 6,
                },
                dob: {
                  type: "string",
                  format: "date",
                  example: "1990-01-01",
                },
                phone: {
                  type: "string",
                  pattern: "^\\+?[0-9]{7,15}$",
                  example: "+1234567890",
                },
                gender: { type: "string", enum: Object.values(Gender) },
                address: {
                  type: "object",
                  required: ["street", "city", "state", "zipCode"],
                  properties: {
                    street: { type: "string", example: "123 Main St" },
                    city: { type: "string", example: "New York" },
                    state: { type: "string", example: "NY" },
                    zipCode: {
                      type: "string",
                      pattern: "^\\d{5}(?:-\\d{4})?$",
                      example: "10001",
                    },
                  },
                },
                occupation: {
                  type: "string",
                  example: "Software Engineer",
                  description: "Customer occupation (optional)",
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "Registration successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example: "Registration successful",
                  },
                  data: {
                    type: "object",
                    properties: {
                      success: { type: "boolean", example: true },
                      message: {
                        type: "string",
                        example: "Registration successful",
                      },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          email: { type: "string" },
                          phone: { type: "string" },
                          role: { type: "string", example: "CUSTOMER" },
                          isActive: {
                            type: "boolean",
                            example: true,
                            description:
                              "Account active status (customers only)",
                          },
                          isVerified: {
                            type: "boolean",
                            description:
                              "Email verification status (customers only)",
                          },
                        },
                      },
                      token: { type: "string" },
                      expiresIn: { type: "string", example: "7d" },
                    },
                  },
                },
              },
            },
          },
        },
        "400": { description: "Validation error" },
        "409": { description: "Email already registered" },
        "500": { description: "Internal server error" },
      },
    },
  },

  // Password Reset Flow
  "/api/auth/forgot-password": {
    post: {
      summary: "Request password reset",
      description:
        "Send password reset email to user. Always returns success for security (doesn't reveal if email exists). **Note: Admin accounts cannot reset passwords through this endpoint for security reasons.**",
      tags: ["Authentication"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email"],
              properties: {
                email: {
                  type: "string",
                  format: "email",
                  example: "user@example.com",
                  description:
                    "Email address for password reset (Admin accounts excluded for security)",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description:
            "Reset email sent (if account exists and is not an admin)",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example:
                      "If an account with that email exists, you will receive a password reset email.",
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
            },
          },
        },
        "400": { description: "Validation error" },
        "404": { description: "User not found" },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/auth/reset-password": {
    post: {
      summary: "Reset password with token",
      description: "Reset user password using the token received in email",
      tags: ["Authentication"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
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
          },
        },
      },
      responses: {
        "200": {
          description: "Password reset successful",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example:
                      "Password has been reset successfully. You can now login with your new password.",
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
            },
          },
        },
        "400": { description: "Invalid or expired token, or validation error" },
        "403": { description: "Account not active" },
        "500": { description: "Internal server error" },
      },
    },
  },

  // Email Verification Flow
  "/api/auth/send-verification": {
    post: {
      summary: "Send email verification",
      description:
        "Send verification email to authenticated customer. Rate limited to 100 requests per 15 minutes. Customer only.",
      tags: ["Authentication"],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Verification email sent",
          content: {
            "application/json": {
              schema: {
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
            },
          },
        },
        "400": { description: "Email already verified" },
        "401": { description: "Unauthorized" },
        "403": { description: "Forbidden (Customer only)" },
        "404": { description: "Customer not found" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/auth/verify-email": {
    post: {
      summary: "Verify email address",
      description:
        "Verify email address using the token received in verification email",
      tags: ["Authentication"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
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
          },
        },
      },
      responses: {
        "200": {
          description: "Email verified successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example:
                      "Email verified successfully! Your account is now fully activated.",
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
            },
          },
        },
        "400": {
          description:
            "Invalid or expired verification token, or validation error",
        },
        "403": { description: "Account not active" },
        "500": { description: "Internal server error" },
      },
    },
  },

  // Change Password (Authenticated)
  "/api/auth/change-password": {
    post: {
      summary: "Change password",
      description:
        "Change password for authenticated user. Rate limited to 100 requests per 15 minutes.",
      tags: ["Authentication"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
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
          },
        },
      },
      responses: {
        "200": {
          description: "Password changed successfully",
          content: {
            "application/json": {
              schema: {
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
            },
          },
        },
        "400": {
          description: "Validation error",
        },
        "401": { description: "Invalid current password" },
        "404": { description: "User not found" },
        "429": { description: "Rate limit exceeded" },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/auth/me": {
    get: {
      summary: "Get current user information",
      description: "Get current authenticated user information",
      tags: ["Authentication"],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "User information retrieved successfully",
          content: {
            "application/json": {
              schema: {
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
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          email: { type: "string" },
                          phone: { type: "string" },
                          role: {
                            type: "string",
                            enum: Object.values(UserRole),
                          },
                          isActive: {
                            type: "boolean",
                            description: "Account active status (customers only)",
                          },
                          isVerified: {
                            type: "boolean",
                            description:
                              "Email verification status (customers only)",
                          },
                        },
                      },
                      success: { type: "boolean", example: true },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        "401": { description: "Unauthorized or invalid token" },
        "404": { description: "User not found" },
        "423": { description: "Account is locked (admin accounts)" },
        "500": { description: "Internal server error" },
      },
    },
  },
};
