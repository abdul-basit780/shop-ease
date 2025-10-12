// lib/utils/swagger/schemas/cart.ts
export const cartSchemas = {
  // Cart Product Response Schema
  CartProductResponse: {
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
        description: "Product price per unit",
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
      quantity: {
        type: "integer",
        minimum: 1,
        maximum: 999,
        example: 2,
        description: "Quantity in cart",
      },
      subtotal: {
        type: "number",
        format: "float",
        example: 2599.98,
        description: "Subtotal for this item (price × quantity)",
      },
      isAvailable: {
        type: "boolean",
        example: true,
        description: "Whether product is in stock and not deleted",
      },
    },
  },

  // Cart Response Schema
  CartResponse: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Cart unique identifier",
      },
      customerId: {
        type: "string",
        example: "507f1f77bcf86cd799439012",
        description: "Customer ID who owns this cart",
      },
      products: {
        type: "array",
        items: { $ref: "#/components/schemas/CartProductResponse" },
        description: "Array of products in the cart",
      },
      count: {
        type: "integer",
        example: 3,
        description: "Total number of unique products in cart",
      },
      totalAmount: {
        type: "number",
        format: "float",
        example: 4599.97,
        description: "Total amount for all available products in cart",
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Cart creation timestamp",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-01-01T00:00:00.000Z",
        description: "Last update timestamp",
      },
    },
  },

  // Add to Cart Request Schema
  AddToCartRequest: {
    type: "object",
    required: ["productId", "quantity"],
    properties: {
      productId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Product ID to add to cart",
      },
      quantity: {
        type: "integer",
        minimum: 1,
        maximum: 999,
        example: 2,
        description: "Quantity to add (1-999)",
      },
    },
  },

  // Update Cart Item Request Schema
  UpdateCartItemRequest: {
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

  // Remove from Cart Request Schema
  RemoveFromCartRequest: {
    type: "object",
    description: "No body required - productId is in the URL path",
  },

  // Get Cart Response
  GetCartResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Cart retrieved successfully",
      },
      cart: {
        $ref: "#/components/schemas/CartResponse",
      },
    },
  },

  // Add Product Response
  AddProductToCartResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Product added to cart",
      },
      cart: {
        $ref: "#/components/schemas/CartResponse",
      },
    },
  },

  // Update Product Response
  UpdateCartItemResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Cart item quantity updated",
      },
      cart: {
        $ref: "#/components/schemas/CartResponse",
      },
    },
  },

  // Remove Product Response
  RemoveProductFromCartResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Product removed from cart",
      },
      cart: {
        $ref: "#/components/schemas/CartResponse",
      },
    },
  },

  // Cart Error Response
  CartErrorResponse: {
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
            example: "INSUFFICIENT_STOCK",
            description: "Error code for programmatic handling",
          },
          details: {
            type: "array",
            items: { type: "string" },
            example: [
              "Product ID is required",
              "Quantity must be at least 1",
              "Insufficient stock available. Available: 5, Requested: 10",
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
