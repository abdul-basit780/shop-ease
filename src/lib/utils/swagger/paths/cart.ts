// lib/utils/swagger/paths/cart.ts
export const cartPaths = {
  "/api/customer/cart": {
    get: {
      summary: "Get customer cart",
      description:
        "Get the authenticated customer's cart with all products populated. Returns empty cart if none exists. Customer only.",
      tags: ["Customer - Cart"],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Cart retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GetCartResponse" },
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
      summary: "Add product to cart",
      description:
        "Add a product to the customer's cart with specified quantity. If product already exists in cart, the quantity will be incremented. Product must exist, not be deleted, and have sufficient stock. Customer only.",
      tags: ["Customer - Cart"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddToCartRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Product added to cart",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddProductToCartResponse" },
            },
          },
        },
        "400": {
          description:
            "Invalid request (validation error, insufficient stock, or product out of stock)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Product not found or has been deleted" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
  "/api/customer/cart/{productId}": {
    put: {
      summary: "Update cart item quantity",
      description:
        "Update the quantity of a product in the cart. Product must exist in cart and new quantity must not exceed available stock. Customer only.",
      tags: ["Customer - Cart"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          description: "Product ID",
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
              required: ["quantity"],
              properties: {
                quantity: {
                  type: "integer",
                  minimum: 1,
                  maximum: 999,
                  example: 5,
                  description: "New quantity (1-999)",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Cart item quantity updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCartItemResponse" },
            },
          },
        },
        "400": {
          description:
            "Invalid request (validation error or insufficient stock)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Product not found in cart or has been deleted" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    delete: {
      summary: "Remove product from cart",
      description:
        "Remove a product from the customer's cart. Product must exist in cart. Customer only.",
      tags: ["Customer - Cart"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          description: "Product ID",
          schema: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
        },
      ],
      responses: {
        "200": {
          description: "Product removed from cart",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RemoveProductFromCartResponse",
              },
            },
          },
        },
        "400": {
          description: "Invalid product ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Product is not in cart" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
