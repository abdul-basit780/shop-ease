// lib/utils/swagger/paths/cart.ts
export const cartPaths = {
  "/api/customer/cart": {
    get: {
      summary: "Get customer cart",
      description:
        "Get the authenticated customer's cart with all products, categories, and selected options fully populated. Creates an empty cart if none exists. Customer only.",
      tags: ["Customer - Cart"],
      security: [{ bearerAuth: [] }],
      responses: {
        "200": {
          description: "Cart retrieved successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GetCartResponse" },
              examples: {
                emptyCart: {
                  summary: "Empty cart",
                  value: {
                    success: true,
                    message: "Cart is empty",
                    cart: {
                      id: "507f1f77bcf86cd799439011",
                      customerId: "507f1f77bcf86cd799439012",
                      products: [],
                      count: 0,
                      totalAmount: 0,
                      createdAt: "2024-01-01T00:00:00.000Z",
                      updatedAt: "2024-01-01T00:00:00.000Z",
                    },
                  },
                },
                cartWithProducts: {
                  summary: "Cart with products and options",
                  value: {
                    success: true,
                    message: "Cart retrieved successfully",
                    cart: {
                      id: "507f1f77bcf86cd799439011",
                      customerId: "507f1f77bcf86cd799439012",
                      products: [
                        {
                          productId: "507f1f77bcf86cd799439013",
                          name: "Premium T-Shirt",
                          description: "Comfortable cotton t-shirt",
                          price: 34.99,
                          stock: 30,
                          img: "/uploads/products/tshirt.jpg",
                          categoryId: "507f1f77bcf86cd799439014",
                          categoryName: "Clothing",
                          quantity: 2,
                          selectedOptions: [
                            {
                              _id: "507f1f77bcf86cd799439015",
                              optionTypeId: "507f1f77bcf86cd799439016",
                              optionTypeName: "Size",
                              value: "Large",
                              price: 0,
                              stock: 50,
                            },
                            {
                              _id: "507f1f77bcf86cd799439017",
                              optionTypeId: "507f1f77bcf86cd799439018",
                              optionTypeName: "Color",
                              value: "Blue",
                              price: 5.0,
                              stock: 30,
                            },
                          ],
                          subtotal: 69.98,
                          isAvailable: true,
                        },
                      ],
                      count: 1,
                      totalAmount: 69.98,
                      createdAt: "2024-01-01T00:00:00.000Z",
                      updatedAt: "2024-01-01T12:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
        },
        "401": { description: "Unauthorized - Invalid or missing token" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    post: {
      summary: "Add product to cart",
      description:
        "Add a product to cart with specified quantity and optional selected options. If the same product+options combination already exists, quantity will be incremented. Validates: product exists, not deleted, stock availability, option requirements, and option belonging. Customer only.",
      tags: ["Customer - Cart"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AddToCartRequest" },
            examples: {
              simpleProduct: {
                summary: "Simple product without options",
                description: "Product has no option types defined",
                value: {
                  productId: "507f1f77bcf86cd799439011",
                  quantity: 2,
                },
              },
              productWithOptions: {
                summary: "Product with size and color options",
                description:
                  "Product has option types, so selectedOptions is required with at least one value per option type",
                value: {
                  productId: "507f1f77bcf86cd799439011",
                  quantity: 1,
                  selectedOptions: [
                    "507f1f77bcf86cd799439013",
                    "507f1f77bcf86cd799439014",
                  ],
                },
              },
              incrementQuantity: {
                summary: "Same product+options already in cart",
                description:
                  "If exact combination exists, quantity will be incremented",
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
          description: "Product added to cart successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AddProductToCartResponse" },
              examples: {
                added: {
                  summary: "New product added",
                  value: {
                    success: true,
                    message: "Product added to cart",
                    cart: {
                      id: "507f1f77bcf86cd799439011",
                      customerId: "507f1f77bcf86cd799439012",
                      products: [
                        {
                          productId: "507f1f77bcf86cd799439013",
                          name: "Premium T-Shirt",
                          price: 34.99,
                          quantity: 1,
                          selectedOptions: [
                            {
                              _id: "507f1f77bcf86cd799439015",
                              optionTypeName: "Size",
                              value: "Large",
                              price: 0,
                            },
                          ],
                          subtotal: 34.99,
                          isAvailable: true,
                        },
                      ],
                      count: 1,
                      totalAmount: 34.99,
                    },
                  },
                },
                updated: {
                  summary: "Existing product quantity incremented",
                  value: {
                    success: true,
                    message: "Cart item quantity updated",
                    cart: {
                      id: "507f1f77bcf86cd799439011",
                      customerId: "507f1f77bcf86cd799439012",
                      products: [
                        {
                          productId: "507f1f77bcf86cd799439013",
                          name: "Premium T-Shirt",
                          price: 34.99,
                          quantity: 3,
                          subtotal: 104.97,
                          isAvailable: true,
                        },
                      ],
                      count: 1,
                      totalAmount: 104.97,
                    },
                  },
                },
              },
            },
          },
        },
        "400": {
          description:
            "Bad request - validation error, stock issue, or option validation failure",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
              examples: {
                validationError: {
                  summary: "Validation errors",
                  value: {
                    success: false,
                    message:
                      "Product ID is required, Quantity must be between 1 and 999",
                  },
                },
                missingOptions: {
                  summary: "Product requires options but none provided",
                  value: {
                    success: false,
                    message:
                      "This product requires option selection. Please select: Size, Color",
                  },
                },
                missingOptionType: {
                  summary: "Not all required option types selected",
                  value: {
                    success: false,
                    message: "Missing required options: Color",
                  },
                },
                noOptionsAllowed: {
                  summary: "Options provided for product without options",
                  value: {
                    success: false,
                    message:
                      "This product does not have options. Please add without selecting options.",
                  },
                },
                insufficientStock: {
                  summary: "Not enough stock available",
                  value: {
                    success: false,
                    message: "Insufficient stock. Available: 5, Requested: 10",
                  },
                },
                outOfStock: {
                  summary: "Product is out of stock",
                  value: {
                    success: false,
                    message: "Product is out of stock",
                  },
                },
                invalidOption: {
                  summary: "Option does not belong to product",
                  value: {
                    success: false,
                    message: "Selected option does not belong to this product",
                  },
                },
              },
            },
          },
        },
        "404": {
          description: "Product or option value not found or deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
              examples: {
                productNotFound: {
                  summary: "Product not found",
                  value: {
                    success: false,
                    message: "Product not found",
                  },
                },
                optionNotFound: {
                  summary: "Option value not found",
                  value: {
                    success: false,
                    message: "Option value not found: 507f1f77bcf86cd799439013",
                  },
                },
              },
            },
          },
        },
        "401": { description: "Unauthorized - Invalid or missing token" },
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
        "Update the quantity of a specific product+options combination in the cart. The product with exact matching options must exist in cart. New quantity is validated against available stock (minimum of product stock and all option stocks). Customer only.",
      tags: ["Customer - Cart"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          description: "Product ID to update",
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
              simpleProduct: {
                summary: "Update simple product quantity",
                value: {
                  quantity: 5,
                },
              },
              productWithOptions: {
                summary: "Update specific product variant",
                description:
                  "selectedOptions must match exact cart item to update",
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
          description: "Cart item quantity updated successfully",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateCartItemResponse" },
            },
          },
        },
        "400": {
          description: "Bad request - validation error or insufficient stock",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
              examples: {
                validationError: {
                  summary: "Invalid quantity",
                  value: {
                    success: false,
                    message: "Quantity must be between 1 and 999",
                  },
                },
                insufficientStock: {
                  summary: "Insufficient stock",
                  value: {
                    success: false,
                    message: "Insufficient stock. Available: 5, Requested: 10",
                  },
                },
              },
            },
          },
        },
        "404": {
          description:
            "Product with specified options not found in cart, or product has been deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
              examples: {
                notInCart: {
                  summary: "Product not in cart",
                  value: {
                    success: false,
                    message: "Product not found in cart",
                  },
                },
                productDeleted: {
                  summary: "Product has been deleted",
                  value: {
                    success: false,
                    message: "Product not found",
                  },
                },
                optionNotFound: {
                  summary: "Option value not found",
                  value: {
                    success: false,
                    message: "Option value not found: 507f1f77bcf86cd799439013",
                  },
                },
              },
            },
          },
        },
        "401": { description: "Unauthorized - Invalid or missing token" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
    delete: {
      summary: "Remove product from cart",
      description:
        "Remove a specific product+options combination from cart. For products with options, selectedOptions in request body must match the exact cart item to remove. For products without options, selectedOptions should be omitted or empty. Customer only.",
      tags: ["Customer - Cart"],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "productId",
          in: "path",
          required: true,
          description: "Product ID to remove",
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
              simpleProduct: {
                summary: "Remove simple product",
                description: "For products without options",
                value: {},
              },
              productWithOptions: {
                summary: "Remove specific variant",
                description:
                  "selectedOptions must match exact cart item to remove",
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
          description: "Product removed from cart successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RemoveProductFromCartResponse",
              },
            },
          },
        },
        "400": {
          description: "Bad request - validation error or missing options",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
              examples: {
                invalidProductId: {
                  summary: "Invalid product ID",
                  value: {
                    success: false,
                    message: "Product ID must be a valid ObjectId",
                  },
                },
                missingOptions: {
                  summary: "Options required but not provided",
                  value: {
                    success: false,
                    message:
                      "This product has options. Please specify which option combination to remove by providing selectedOptions in the request body.",
                  },
                },
              },
            },
          },
        },
        "404": {
          description:
            "Product with specified options not found in cart, or product has been deleted",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CartErrorResponse" },
              examples: {
                notInCart: {
                  summary: "Product not in cart",
                  value: {
                    success: false,
                    message: "Product not found in cart",
                  },
                },
                productNotFound: {
                  summary: "Product not found or deleted",
                  value: {
                    success: false,
                    message: "Product not found",
                  },
                },
              },
            },
          },
        },
        "401": { description: "Unauthorized - Invalid or missing token" },
        "429": {
          description: "Rate limit exceeded (200 requests per 15 minutes)",
        },
        "500": { description: "Internal server error" },
      },
    },
  },
};
