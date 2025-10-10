// lib/utils/swagger/schemas/wishlist.ts
export const wishlistSchemas = {
  // Wishlist Product Response Schema
  WishlistProductResponse: {
    type: "object",
    properties: {
      productId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Product unique identifier",
      },
      name: {
        type: "string",
        example: "Gaming Laptop",
        description: "Product name",
      },
      price: {
        type: "number",
        format: "float",
        example: 1299.99,
        description: "Product price",
      },
      stock: {
        type: "integer",
        example: 15,
        description: "Available stock quantity",
      },
      img: {
        type: "string",
        example: "/uploads/products/product_1704067200_abc123.jpg",
        description: "Product image URL",
      },
      description: {
        type: "string",
        example: "High-performance gaming laptop with RTX 4060",
        description: "Product description",
      },
      categoryId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Category ID",
      },
      categoryName: {
        type: "string",
        example: "Electronics",
        description: "Category name (populated from category)",
      },
      addedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Date when product was added to wishlist",
      },
      isAvailable: {
        type: "boolean",
        example: true,
        description: "Whether product is in stock and not deleted",
      },
    },
  },

  // Wishlist Response Schema
  WishlistResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Wishlist unique identifier",
      },
      customerId: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
        description: "Customer ID who owns this wishlist",
      },
      products: {
        type: "array",
        items: { $ref: "#/components/schemas/WishlistProductResponse" },
        description: "Array of products in the wishlist",
      },
      count: {
        type: "integer",
        example: 5,
        description: "Total number of products in wishlist",
      },
      totalValue: {
        type: "number",
        format: "float",
        example: 2499.95,
        description: "Total value of all available products in wishlist",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Wishlist creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Last update timestamp",
      },
    },
  },

  // Add Product Request Schema
  AddToWishlistRequest: {
    type: "object",
    required: ["productId"],
    properties: {
      productId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Product ID to add to wishlist",
      },
    },
  },

  // Remove Product Request Schema
  RemoveFromWishlistRequest: {
    type: "object",
    required: ["productId"],
    properties: {
      productId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Product ID to remove from wishlist",
      },
    },
  },

  // Get Wishlist Response
  GetWishlistResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Wishlist retrieved successfully",
      },
      wishlist: {
        $ref: "#/components/schemas/WishlistResponse",
      },
    },
  },

  // Add Product Response
  AddProductResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Product added to wishlist",
      },
      wishlist: {
        $ref: "#/components/schemas/WishlistResponse",
      },
    },
  },

  // Remove Product Response
  RemoveProductResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Product removed from wishlist",
      },
      wishlist: {
        $ref: "#/components/schemas/WishlistResponse",
      },
    },
  },

  // Wishlist Error Response
  WishlistErrorResponse: {
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
            example: "PRODUCT_NOT_FOUND",
            description: "Error code for programmatic handling",
          },
          details: {
            type: "array",
            items: { type: "string" },
            example: [
              "Product ID is required",
              "Invalid product ID format",
              "Product not found or has been deleted",
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
