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
        example: "T-Shirt",
        description: "Product name",
      },
      price: {
        type: "number",
        format: "float",
        example: 34.99,
        description: "Effective price (base price + selected options prices)",
      },
      stock: {
        type: "integer",
        example: 50,
        description:
          "Available stock (minimum of base stock and option stocks)",
      },
      img: {
        type: "string",
        example: "/uploads/products/product_1704067200_abc123.jpg",
        description: "Product image URL",
      },
      description: {
        type: "string",
        example: "Comfortable cotton t-shirt",
        description: "Product description",
      },
      categoryId: {
        type: "string",
        example: "507f1f77bcf86cd799439011",
        description: "Category ID",
      },
      categoryName: {
        type: "string",
        example: "Clothing",
        description: "Category name (populated from category)",
      },
      quantity: {
        type: "integer",
        minimum: 1,
        maximum: 999,
        example: 2,
        description: "Quantity in cart",
      },
      selectedOptions: {
        type: "array",
        description: "Selected option values for this cart item",
        items: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "507f1f77bcf86cd799439013",
              description: "Option value ID",
            },
            optionTypeName: {
              type: "string",
              example: "size",
              description: "Option type name",
            },
            value: {
              type: "string",
              example: "m",
              description: "Option value",
            },
            price: {
              type: "number",
              format: "float",
              example: 5.0,
              description: "Additional price for this option",
            },
          },
        },
      },
      subtotal: {
        type: "number",
        format: "float",
        example: 69.98,
        description: "Subtotal for this item (effective price × quantity)",
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
        description:
          "Total number of unique product+option combinations in cart",
      },
      totalAmount: {
        type: "number",
        format: "float",
        example: 209.97,
        description:
          "Total amount for all available products in cart (includes option prices)",
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
      selectedOptions: {
        type: "array",
        items: { type: "string" },
        example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
        description:
          "Array of option value IDs to select (e.g., Size: M, Color: Red)",
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
      selectedOptions: {
        type: "array",
        items: { type: "string" },
        example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
        description:
          "Array of option value IDs (must match the cart item being updated)",
      },
    },
  },

  // Remove from Cart Request Schema
  RemoveFromCartRequest: {
    type: "object",
    properties: {
      selectedOptions: {
        type: "array",
        items: { type: "string" },
        example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
        description:
          "Array of option value IDs (must match the cart item being removed)",
      },
    },
    description:
      "productId is in the URL path. selectedOptions identifies which variant to remove.",
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
              "Selected option does not belong to this product",
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
