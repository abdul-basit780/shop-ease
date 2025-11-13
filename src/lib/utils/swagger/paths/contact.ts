// lib/utils/swagger/paths/contact.ts
export const contactPaths = {
  "/api/public/contact": {
    // Add the path key
    post: {
      tags: ["Public - Contact"],
      summary: "Submit a contact form",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ContactRequest",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Contact form submitted successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ContactResponse",
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ContactErrorResponse",
              },
            },
          },
        },
      },
    },
  },
};
