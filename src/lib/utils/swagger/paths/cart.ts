// lib/utils/swagger/paths/cart.ts
export const cartPaths = {
  "/api/customer/cart": {
    get: {
      summary: "Get customer cart",
      description:
        "Get the authenticated customer's cart with all products and selected options populated. Returns empty cart if none exists. Customer only.",
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
        "Add a product to the customer's cart with specified quantity and optional selected options. If the same product+options combination already exists in cart, the quantity will be incremented. Product must exist, not be deleted, and have sufficient stock. Customer only.",
      tags: ["Customer - Cart"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddToCartRequest" },
            examples: {
              withoutOptions: {
                summary: "Simple product without options",
                value: {
                  productId: "507f1f77bcf86cd799439011",
                  quantity: 2,
                },
              },
              withOptions: {
                summary: "Product with selected options",
                value: {
                  productId: "507f1f77bcf86cd799439011",
                  quantity: 1,
                  selectedOptions: [
                    "507f1f77bcf86cd799439013",
                    "507f1f77bcf86cd799439014",
                  ],
                },
              },
            },
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
            "Invalid request (validation error, insufficient stock, product out of stock, or invalid option)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": {
          description: "Product not found, deleted, or option value not found",
        },
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
        "Update the quantity of a specific product+options combination in the cart. Product must exist in cart with matching options and new quantity must not exceed available stock. Customer only.",
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
              $ref: "#/components/schemas/UpdateCartItemRequest",
            },
            examples: {
              withoutOptions: {
                summary: "Update simple product",
                value: {
                  quantity: 5,
                },
              },
              withOptions: {
                summary: "Update product with options",
                value: {
                  quantity: 3,
                  selectedOptions: [
                    "507f1f77bcf86cd799439013",
                    "507f1f77bcf86cd799439014",
                  ],
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
            "Invalid request (validation error, insufficient stock, or invalid option)",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": {
          description:
            "Product not found in cart with specified options, or has been deleted",
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    delete: {
      summary: "Remove product from cart",
      description:
        "Remove a specific product+options combination from the customer's cart. Product with matching options must exist in cart. Customer only.",
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
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/RemoveFromCartRequest",
            },
            examples: {
              withoutOptions: {
                summary: "Remove simple product",
                value: {},
              },
              withOptions: {
                summary: "Remove product with specific options",
                value: {
                  selectedOptions: [
                    "507f1f77bcf86cd799439013",
                    "507f1f77bcf86cd799439014",
                  ],
                },
              },
            },
          },
        },
      },
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
        "404": {
          description: "Product with specified options is not in cart",
        },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
