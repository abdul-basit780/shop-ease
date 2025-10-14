// lib/controllers/cart.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
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
      .exec();

    if (!cart) {
      cart = await Cart.create({
        customerId,
        products: [],
        totalAmount: 0,
      });
    }

    // Build full response with product details
    const fullResponse = buildCartResponse(cart);

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

  const { productId, quantity }: AddToCartRequest = req.body;

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

    // Check stock availability
    if (product.stock === 0) {
      cartResponse.message = CART_MESSAGES.PRODUCT_OUT_OF_STOCK;
      cartResponse.statusCode = 400;
      return cartResponse;
    }

    // Get or create cart
    let cart = await Cart.findOne({ customerId });

    const existingQuantity = cart ? getCartItemQuantity(cart, productId) : 0;
    const newTotalQuantity = existingQuantity + quantity;

    if (newTotalQuantity > product.stock) {
      cartResponse.message = `${CART_MESSAGES.INSUFFICIENT_STOCK}. Available: ${product.stock}, Requested: ${newTotalQuantity}`;
      cartResponse.statusCode = 400;
      return cartResponse;
    }

    // If product already in cart, update quantity
    if (cart && isProductInCart(cart, productId)) {
      const updatedCart = await Cart.findOneAndUpdate(
        {
          customerId,
          "products.productId": new mongoose.Types.ObjectId(productId),
        },
        {
          $inc: { "products.$.quantity": quantity },
          $set: { totalAmount: 0 }, // Will be recalculated in response
        },
        { new: true }
      ).populate({
        path: "products.productId",
        populate: {
          path: "categoryId",
          select: "name",
        },
      });

      cartResponse.cart = buildCartResponse(updatedCart!);
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
          },
        },
        $set: { totalAmount: 0 }, // Will be recalculated in response
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).populate({
      path: "products.productId",
      populate: {
        path: "categoryId",
        select: "name",
      },
    });

    cartResponse.cart = buildCartResponse(updatedCart);
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
  const { quantity }: UpdateCartItemRequest = req.body;

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

    // Check if cart exists and product is in cart
    const cart = await Cart.findOne({ customerId });

    if (!cart || !isProductInCart(cart, productId)) {
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

    // Check stock availability
    if (quantity > product.stock) {
      cartResponse.message = `${CART_MESSAGES.INSUFFICIENT_STOCK}. Available: ${product.stock}, Requested: ${quantity}`;
      cartResponse.statusCode = 400;
      return cartResponse;
    }

    // Update quantity
    const updatedCart = await Cart.findOneAndUpdate(
      {
        customerId,
        "products.productId": new mongoose.Types.ObjectId(productId),
      },
      {
        $set: {
          "products.$.quantity": quantity,
          totalAmount: 0, // Will be recalculated in response
        },
      },
      { new: true }
    ).populate({
      path: "products.productId",
      populate: {
        path: "categoryId",
        select: "name",
      },
    });

    cartResponse.cart = buildCartResponse(updatedCart!);
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

    if (!cart || !isProductInCart(cart, productId)) {
      cartResponse.message = CART_MESSAGES.PRODUCT_NOT_IN_CART;
      cartResponse.statusCode = 404;
      return cartResponse;
    }

    // Remove product from cart
    const updatedCart = await Cart.findOneAndUpdate(
      { customerId },
      {
        $pull: {
          products: {
            productId: new mongoose.Types.ObjectId(productId),
          },
        },
        $set: { totalAmount: 0 }, // Will be recalculated in response
      },
      { new: true }
    ).populate({
      path: "products.productId",
      populate: {
        path: "categoryId",
        select: "name",
      },
    });

    cartResponse.cart = buildCartResponse(updatedCart!);
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
