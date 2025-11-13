// lib/utils/swagger/schemas/contact.ts
export const contactSchemas = {
  ContactRequest: {
    type: "object",
    properties: {
      name: { type: "string", example: "John Doe" },
      email: { type: "string", format: "email", example: "john@example.com" },
      subject: { type: "string", example: "Product Inquiry" },
      message: { type: "string", example: "I have a question about..." },
    },
    required: ["name", "email", "subject", "message"],
  },

  ContactResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: {
        type: "string",
        example: "Contact form submitted successfully",
      },
    },
  },

  ContactErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      message: { type: "string", example: "Validation failed" },
      errors: { type: "array", items: { type: "string" } },
    },
  },
};
