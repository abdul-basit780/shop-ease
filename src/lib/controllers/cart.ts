// lib/controllers/cart.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { OptionValue } from "../models/OptionValue";
import { OptionType } from "../models/OptionType";
import connectToDatabase from "../db/mongodb";
import mongoose from "mongoose";
import {
  buildCartResponse,
  validateAddToCart,
  validateProductId,
  validateQuantity,
  isProductInCart,
  getCartItemQuantity,
  CART_MESSAGES,
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
} from "../utils/cart";

interface Response {
  success: boolean;
  message: string;
  cart?: CartResponse;
  statusCode: number | undefined;
}

// Get customer's cart with populated products
export const getCart = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const cartResponse: Response = {
    success: false,
    message: "",
    cart: undefined,
    statusCode: 500,
  };

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Create cart if it doesn't exist
    let cart = await Cart.findOne({ customerId })
      .populate({
        path: "products.productId",
        populate: {
          path: "categoryId",
          select: "name",
        },
      })
      .populate("products.selectedOptions")
      .exec();

    if (!cart) {
      cart = await Cart.create({
        customerId,
        products: [],
        totalAmount: 0,
      });
    }

    // Build full response with product details
    const fullResponse = await buildCartResponse(cart);

    cartResponse.cart = fullResponse;
    cartResponse.success = true;
    cartResponse.message =
      fullResponse.count > 0
        ? CART_MESSAGES.RETRIEVED
        : CART_MESSAGES.CART_EMPTY;
    cartResponse.statusCode = 200;

    return cartResponse;
  } catch (err) {
    console.error("Get cart error:", err);
    cartResponse.message = "Internal server error";
    cartResponse.statusCode = 500;
    return cartResponse;
  }
};

// Add product to cart or update quantity if already exists
export const addProduct = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const cartResponse: Response = {
    success: false,
    message: "",
    cart: undefined,
    statusCode: 500,
  };

  const { productId, quantity, selectedOptions }: AddToCartRequest = req.body;

  // Validate request
  const validationErrors = validateAddToCart(productId, quantity);
  if (validationErrors.length > 0) {
    cartResponse.message = validationErrors.join(", ");
    cartResponse.statusCode = 400;
    return cartResponse;
  }

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Check if product exists and is not deleted
    const product = await Product.findOne({
      _id: productId,
      deletedAt: null,
    });

    if (!product) {
      cartResponse.message = CART_MESSAGES.PRODUCT_NOT_FOUND;
      cartResponse.statusCode = 404;
      return cartResponse;
    }

    // Check if product has option types
    const productOptionTypes = await OptionType.find({
      productId: product._id,
      deletedAt: null,
    });

    // If product has options, selectedOptions must be provided
    if (productOptionTypes.length > 0) {
      if (!selectedOptions || selectedOptions.length === 0) {
        cartResponse.message = `This product requires option selection. Please select: ${productOptionTypes
          .map((ot: any) => ot.name)
          .join(", ")}`;
        cartResponse.statusCode = 400;
        return cartResponse;
      }

      // Validate that all required option types are selected
      const selectedOptionTypes = new Set<string>();
      for (const optionId of selectedOptions) {
        const optionValue = await OptionValue.findOne({
          _id: optionId,
          deletedAt: null,
        }).populate("optionTypeId");

        if (!optionValue) {
          cartResponse.message = `Option value not found: ${optionId}`;
          cartResponse.statusCode = 404;
          return cartResponse;
        }

        const optionType = optionValue.optionTypeId as any;
        selectedOptionTypes.add(optionType._id.toString());
      }

      // Check if all option types are selected (at least one value per type)
      const missingOptionTypes = productOptionTypes.filter(
        (ot: any) => !selectedOptionTypes.has(ot._id.toString())
      );

      if (missingOptionTypes.length > 0) {
        cartResponse.message = `Missing required options: ${missingOptionTypes
          .map((ot: any) => ot.name)
          .join(", ")}`;
        cartResponse.statusCode = 400;
        return cartResponse;
      }
    } else {
      // If product has no options, selectedOptions should not be provided
      if (selectedOptions && selectedOptions.length > 0) {
        cartResponse.message =
          "This product does not have options. Please add without selecting options.";
        cartResponse.statusCode = 400;
        return cartResponse;
      }
    }

    // Check stock availability
    if (product.stock === 0) {
      cartResponse.message = CART_MESSAGES.PRODUCT_OUT_OF_STOCK;
      cartResponse.statusCode = 400;
      return cartResponse;
    }

    // Validate and check stock for selected options
    let availableStock = product.stock;
    let effectivePrice = product.price;
    const optionValueIds: mongoose.Types.ObjectId[] = [];

    if (selectedOptions && selectedOptions.length > 0) {
      // Validate all selected options exist and belong to this product
      for (const optionId of selectedOptions) {
        if (!mongoose.Types.ObjectId.isValid(optionId)) {
          cartResponse.message = `Invalid option value ID: ${optionId}`;
          cartResponse.statusCode = 400;
          return cartResponse;
        }

        const optionValue = await OptionValue.findOne({
          _id: optionId,
          deletedAt: null,
        }).populate("optionTypeId");

        if (!optionValue) {
          cartResponse.message = `Option value not found: ${optionId}`;
          cartResponse.statusCode = 404;
          return cartResponse;
        }

        // Verify option belongs to this product
        const optionType = optionValue.optionTypeId as any;
        if (optionType.productId.toString() !== productId) {
          cartResponse.message =
            "Selected option does not belong to this product";
          cartResponse.statusCode = 400;
          return cartResponse;
        }

        // Use option's stock and add to price
        availableStock = Math.min(availableStock, optionValue.stock);
        effectivePrice += optionValue.price;
        optionValueIds.push(new mongoose.Types.ObjectId(optionId));
      }
    }

    // Check stock availability with effective stock
    if (availableStock === 0) {
      cartResponse.message = CART_MESSAGES.PRODUCT_OUT_OF_STOCK;
      cartResponse.statusCode = 400;
      return cartResponse;
    }

    // Get or create cart
    let cart = await Cart.findOne({ customerId });

    const existingQuantity = cart
      ? getCartItemQuantity(cart, productId, optionValueIds)
      : 0;
    const newTotalQuantity = existingQuantity + quantity;

    if (newTotalQuantity > availableStock) {
      cartResponse.message = `${CART_MESSAGES.INSUFFICIENT_STOCK}. Available: ${availableStock}, Requested: ${newTotalQuantity}`;
      cartResponse.statusCode = 400;
      return cartResponse;
    }

    // Check if this exact product+options combination exists in cart
    const existingItemIndex = cart?.products.findIndex((item) => {
      if (item.productId.toString() !== productId) return false;

      const itemOptions = (item.selectedOptions || [])
        .map((id) => id.toString())
        .sort();
      const newOptions = optionValueIds.map((id) => id.toString()).sort();

      return JSON.stringify(itemOptions) === JSON.stringify(newOptions);
    });

    if (cart && existingItemIndex !== undefined && existingItemIndex >= 0) {
      // Update existing item quantity
      cart.products[existingItemIndex].quantity += quantity;
      await cart.save();

      await cart.populate([
        {
          path: "products.productId",
          populate: {
            path: "categoryId",
            select: "name",
          },
        },
        { path: "products.selectedOptions" },
      ]);

      cartResponse.cart = await buildCartResponse(cart);
      cartResponse.success = true;
      cartResponse.message = CART_MESSAGES.PRODUCT_UPDATED;
      cartResponse.statusCode = 200;
      return cartResponse;
    }

    // Add new product to cart
    const updatedCart = await Cart.findOneAndUpdate(
      { customerId },
      {
        $push: {
          products: {
            productId: new mongoose.Types.ObjectId(productId),
            quantity,
            selectedOptions:
              optionValueIds.length > 0 ? optionValueIds : undefined,
          },
        },
        $set: { totalAmount: 0 }, // Will be recalculated in response
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )

    updatedCart.populate([
      {
        path: "products.productId",
        populate: {
          path: "categoryId",
          select: "name",
        },
      },
      { path: "products.selectedOptions" },
    ]);

    cartResponse.cart = await buildCartResponse(updatedCart);
    cartResponse.success = true;
    cartResponse.message = CART_MESSAGES.PRODUCT_ADDED;
    cartResponse.statusCode = 200;

    return cartResponse;
  } catch (err) {
    console.error("Add to cart error:", err);
    cartResponse.message = "Internal server error";
    cartResponse.statusCode = 500;
    return cartResponse;
  }
};

// Update product quantity in cart
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const cartResponse: Response = {
    success: false,
    message: "",
    cart: undefined,
    statusCode: 500,
  };

  // productId comes from path parameter (set in route handler)
  const productId = req.body.productId as string;
  const { quantity, selectedOptions }: UpdateCartItemRequest = req.body;

  // Validate request
  const productIdErrors = validateProductId(productId);
  const quantityErrors = validateQuantity(quantity);
  const validationErrors = [...productIdErrors, ...quantityErrors];

  if (validationErrors.length > 0) {
    cartResponse.message = validationErrors.join(", ");
    cartResponse.statusCode = 400;
    return cartResponse;
  }

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Check if cart exists
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      cartResponse.message = CART_MESSAGES.PRODUCT_NOT_IN_CART;
      cartResponse.statusCode = 404;
      return cartResponse;
    }

    // Find the specific cart item
    const optionIds = (selectedOptions || []).map((id) => id.toString()).sort();
    const itemIndex = cart.products.findIndex((item) => {
      if (item.productId.toString() !== productId) return false;

      const itemOptions = (item.selectedOptions || [])
        .map((id) => id.toString())
        .sort();
      return JSON.stringify(itemOptions) === JSON.stringify(optionIds);
    });

    if (itemIndex === -1) {
      cartResponse.message = CART_MESSAGES.PRODUCT_NOT_IN_CART;
      cartResponse.statusCode = 404;
      return cartResponse;
    }

    // Check if product exists and is not deleted
    const product = await Product.findOne({
      _id: productId,
      deletedAt: null,
    });

    if (!product) {
      cartResponse.message = CART_MESSAGES.PRODUCT_NOT_FOUND;
      cartResponse.statusCode = 404;
      return cartResponse;
    }

    // Calculate available stock
    let availableStock = product.stock;

    if (selectedOptions && selectedOptions.length > 0) {
      for (const optionId of selectedOptions) {
        const optionValue = await OptionValue.findOne({
          _id: optionId,
          deletedAt: null,
        });

        if (!optionValue) {
          cartResponse.message = `Option value not found: ${optionId}`;
          cartResponse.statusCode = 404;
          return cartResponse;
        }

        availableStock = Math.min(availableStock, optionValue.stock);
      }
    }

    // Check stock availability
    if (quantity > availableStock) {
      cartResponse.message = `${CART_MESSAGES.INSUFFICIENT_STOCK}. Available: ${availableStock}, Requested: ${quantity}`;
      cartResponse.statusCode = 400;
      return cartResponse;
    }

    // Update quantity
    cart.products[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate([
      {
        path: "products.productId",
        populate: {
          path: "categoryId",
          select: "name",
        },
      },
      { path: "products.selectedOptions" },
    ]);

    cartResponse.cart = await buildCartResponse(cart);
    cartResponse.success = true;
    cartResponse.message = CART_MESSAGES.PRODUCT_UPDATED;
    cartResponse.statusCode = 200;

    return cartResponse;
  } catch (err) {
    console.error("Update cart error:", err);
    cartResponse.message = "Internal server error";
    cartResponse.statusCode = 500;
    return cartResponse;
  }
};

// Remove product from cart
export const removeProduct = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const cartResponse: Response = {
    success: false,
    message: "",
    cart: undefined,
    statusCode: 500,
  };

  // productId comes from path parameter (set in route handler)
  const productId = req.body.productId as string;
  const { selectedOptions } = req.body;

  // Validate product ID
  const validationErrors = validateProductId(productId);
  if (validationErrors.length > 0) {
    cartResponse.message = validationErrors.join(", ");
    cartResponse.statusCode = 400;
    return cartResponse;
  }

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Check if product is in cart
    const cart = await Cart.findOne({ customerId });

    if (!cart) {
      cartResponse.message = CART_MESSAGES.PRODUCT_NOT_IN_CART;
      cartResponse.statusCode = 404;
      return cartResponse;
    }

    // Check if product has option types
    const product = await Product.findOne({
      _id: productId,
      // deletedAt: null,
    });

    if (!product) {
      cartResponse.message = CART_MESSAGES.PRODUCT_NOT_FOUND;
      cartResponse.statusCode = 404;
      return cartResponse;
    }

    const productOptionTypes = await OptionType.find({
      productId: product._id,
      // deletedAt: null,
    });

    // If product has options, selectedOptions must be provided
    if (productOptionTypes.length > 0) {
      if (!selectedOptions || selectedOptions.length === 0) {
        cartResponse.message =
          "This product has options. Please specify which option combination to remove by providing selectedOptions in the request body.";
        cartResponse.statusCode = 400;
        return cartResponse;
      }
    }

    // Find the specific cart item
    const optionIds = (selectedOptions || [])
      .map((id: string) => id.toString())
      .sort();
    const itemIndex = cart.products.findIndex((item) => {
      if (item.productId.toString() !== productId) return false;

      const itemOptions = (item.selectedOptions || [])
        .map((id) => id.toString())
        .sort();
      return JSON.stringify(itemOptions) === JSON.stringify(optionIds);
    });

    if (itemIndex === -1) {
      cartResponse.message = CART_MESSAGES.PRODUCT_NOT_IN_CART;
      cartResponse.statusCode = 404;
      return cartResponse;
    }

    // Remove product from cart
    cart.products.splice(itemIndex, 1);
    await cart.save();

    await cart.populate([
      {
        path: "products.productId",
        populate: {
          path: "categoryId",
          select: "name",
        },
      },
      { path: "products.selectedOptions" },
    ]);

    cartResponse.cart = await buildCartResponse(cart);
    cartResponse.success = true;
    cartResponse.message = CART_MESSAGES.PRODUCT_REMOVED;
    cartResponse.statusCode = 200;

    return cartResponse;
  } catch (err) {
    console.error("Remove from cart error:", err);
    cartResponse.message = "Internal server error";
    cartResponse.statusCode = 500;
    return cartResponse;
  }
};
