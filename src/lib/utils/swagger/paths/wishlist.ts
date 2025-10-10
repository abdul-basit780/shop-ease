// lib/utils/swagger/paths/wishlist.ts
export const wishlistPaths = {
  "/api/customer/wishlist": {
    get: {
      summary: "Get customer wishlist",
      description:
        "Get the authenticated customer's wishlist with all products populated. Returns empty wishlist if none exists. Customer only.",
      tags: ["Customer - Wishlist"],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Wishlist retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GetWishlistResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "429": {
          description: "Rate limit exceeded (1000 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Add product to wishlist",
      description:
        "Add a single product to the customer's wishlist. Product must exist and not be deleted. Cannot add duplicate products. Customer only.",
      tags: ["Customer - Wishlist"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddToWishlistRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Product added to wishlist",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddProductResponse" },
            },
          },
        },
        "400": {
          description: "Invalid product ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WishlistErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Product not found or has been deleted" },
        "409": { description: "Product is already in wishlist" },
        "429": {
          description: "Rate limit exceeded (1000 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    delete: {
      summary: "Remove product from wishlist",
      description:
        "Remove a single product from the customer's wishlist. Product must be in the wishlist. Customer only.",
      tags: ["Customer - Wishlist"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RemoveFromWishlistRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Product removed from wishlist",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RemoveProductResponse" },
            },
          },
        },
        "400": {
          description: "Invalid product ID",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/WishlistErrorResponse" },
            },
          },
        },
        "401": { description: "Unauthorized" },
        "404": { description: "Product is not in wishlist" },
        "429": {
          description: "Rate limit exceeded (1000 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
