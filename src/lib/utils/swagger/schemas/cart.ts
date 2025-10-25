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
        example: "Premium T-Shirt",
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
        description:
          "Selected option values for this cart item (populated with full option details)",
        items: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "507f1f77bcf86cd799439013",
              description: "Option value ID",
            },
            optionTypeId: {
              type: "string",
              example: "507f1f77bcf86cd799439015",
              description: "Option type ID",
            },
            optionTypeName: {
              type: "string",
              example: "Size",
              description: "Option type name",
            },
            value: {
              type: "string",
              example: "Large",
              description: "Option value",
            },
            price: {
              type: "number",
              format: "float",
              example: 5.0,
              description: "Additional price for this option",
            },
            stock: {
              type: "integer",
              example: 30,
              description: "Available stock for this option value",
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
        description: "Array of products in the cart with populated details",
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
          "Array of option value IDs. REQUIRED if product has option types. MUST NOT be provided if product has no options. At least one value for each option type must be selected.",
      },
    },
    description:
      "Add product to cart. If the exact product+options combination already exists, quantity will be incremented.",
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
          "Array of option value IDs to identify which cart item variant to update. Must match the exact options of the cart item.",
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
          "Array of option value IDs to identify which cart item variant to remove. REQUIRED if product has options.",
      },
    },
    description:
      "productId is in the URL path. selectedOptions identifies which specific variant to remove (required for products with options).",
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
    },
    examples: {
      validationError: {
        success: false,
        message: "Product ID is required, Quantity must be at least 1",
      },
      missingOptions: {
        success: false,
        message:
          "This product requires option selection. Please select: Size, Color",
      },
      missingOptionType: {
        success: false,
        message: "Missing required options: Color",
      },
      noOptionsAllowed: {
        success: false,
        message:
          "This product does not have options. Please add without selecting options.",
      },
      insufficientStock: {
        success: false,
        message: "Insufficient stock. Available: 5, Requested: 10",
      },
      outOfStock: {
        success: false,
        message: "Product is out of stock",
      },
      productNotFound: {
        success: false,
        message: "Product not found",
      },
      optionNotFound: {
        success: false,
        message: "Option value not found: 507f1f77bcf86cd799439013",
      },
      optionNotBelonging: {
        success: false,
        message: "Selected option does not belong to this product",
      },
      notInCart: {
        success: false,
        message: "Product not found in cart",
      },
      removeWithOptions: {
        success: false,
        message:
          "This product has options. Please specify which option combination to remove by providing selectedOptions in the request body.",
      },
    },
  },

  // Option Validation Rules (for documentation)
  CartOptionValidationRules: {
    type: "object",
    description: "Business rules for handling products with options",
    properties: {
      productsWithOptions: {
        type: "object",
        properties: {
          rule: {
            type: "string",
            example: "Products with option types REQUIRE selectedOptions",
            description:
              "If a product has option types defined, selectedOptions array is MANDATORY in add/update/remove requests",
          },
          validation: {
            type: "string",
            example: "At least one value for EACH option type must be selected",
            description:
              "All option types must have at least one value selected. Cannot select partial option types.",
          },
          errorExample: {
            type: "string",
            example:
              "This product requires option selection. Please select: size, color",
          },
        },
      },
      productsWithoutOptions: {
        type: "object",
        properties: {
          rule: {
            type: "string",
            example:
              "Products without option types MUST NOT have selectedOptions",
            description:
              "If a product has no option types, selectedOptions should be omitted or empty",
          },
          errorExample: {
            type: "string",
            example:
              "This product does not have options. Please add without selecting options.",
          },
        },
      },
      optionBelonging: {
        type: "object",
        properties: {
          rule: {
            type: "string",
            example: "All selected option values must belong to the product",
            description:
              "Each option value must be from an option type that belongs to the product being added",
          },
          errorExample: {
            type: "string",
            example: "Selected option does not belong to this product",
          },
        },
      },
      stockCalculation: {
        type: "object",
        properties: {
          rule: {
            type: "string",
            example:
              "Available stock = MIN(product.stock, optionValue1.stock, optionValue2.stock, ...)",
            description:
              "The available stock is the minimum of the product's base stock and all selected option values' stocks",
          },
          example: {
            type: "string",
            example:
              "Product stock: 100, Size Large stock: 50, Color Blue stock: 30 → Available: 30",
          },
        },
      },
      priceCalculation: {
        type: "object",
        properties: {
          rule: {
            type: "string",
            example:
              "Effective price = product.price + SUM(selectedOptions.price)",
            description:
              "The effective price is the product's base price plus the sum of all selected option values' prices",
          },
          example: {
            type: "string",
            example:
              "Product: $29.99, Size Large: +$0.00, Color Blue: +$5.00 → Effective price: $34.99",
          },
        },
      },
      cartItemIdentification: {
        type: "object",
        properties: {
          rule: {
            type: "string",
            example:
              "Each unique product+options combination is a separate cart item",
            description:
              "Same product with different options = different cart items. Same product with same options = quantity incremented.",
          },
          example: {
            type: "string",
            example:
              "T-Shirt (Large, Blue) and T-Shirt (Medium, Red) are 2 separate items",
          },
        },
      },
    },
  },
};
