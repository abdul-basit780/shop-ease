// lib/utils/cart.ts
import { ICart } from "../models/Cart";
import { isValidObjectId } from "mongoose";

export interface CartProductResponse {
  productId: string;
  name: string;
  price: number;
  stock: number;
  img: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  quantity: number;
  subtotal: number;
  isAvailable: boolean;
}

export interface CartResponse {
  id: string;
  customerId: string;
  products: CartProductResponse[];
  count: number;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Helper function to build cart response with populated products
export const buildCartResponse = (cart: any): CartResponse => {
  let totalAmount = 0;

  const products: CartProductResponse[] = cart.products
    .filter((item: any) => item.productId) // Filter out any null products (deleted)
    .map((item: any) => {
      const product = item.productId as any; // Populated product
      const isAvailable = product.stock > 0 && !product.deletedAt;
      const subtotal = product.price * item.quantity;

      if (isAvailable) {
        totalAmount += subtotal;
      }

      return {
        productId: product._id.toString(),
        name: product.name,
        price: product.price,
        stock: product.stock,
        img: product.img,
        description: product.description,
        categoryId:
          product.categoryId?._id?.toString() || product.categoryId?.toString(),
        categoryName: product.categoryId?.name,
        quantity: item.quantity,
        subtotal: Math.round(subtotal * 100) / 100,
        isAvailable,
      };
    });

  return {
    id: cart._id.toString(),
    customerId: cart.customerId.toString(),
    products,
    count: products.length,
    totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
};

// Validate product ID
export const validateProductId = (productId: string): string[] => {
  const errors: string[] = [];

  if (!productId) {
    errors.push("Product ID is required");
  } else if (!isValidObjectId(productId)) {
    errors.push("Invalid product ID format");
  }

  return errors;
};

// Validate quantity
export const validateQuantity = (quantity: number): string[] => {
  const errors: string[] = [];

  if (!quantity && quantity !== 0) {
    errors.push("Quantity is required");
  } else if (typeof quantity !== "number") {
    errors.push("Quantity must be a number");
  } else if (quantity < 1) {
    errors.push("Quantity must be at least 1");
  } else if (quantity > 999) {
    errors.push("Quantity cannot exceed 999");
  } else if (!Number.isInteger(quantity)) {
    errors.push("Quantity must be a whole number");
  }

  return errors;
};

// Validate add to cart request
export const validateAddToCart = (
  productId: string,
  quantity: number
): string[] => {
  const errors: string[] = [];

  errors.push(...validateProductId(productId));
  errors.push(...validateQuantity(quantity));

  return errors;
};

// Check if product is in cart
export const isProductInCart = (cart: ICart, productId: string): boolean => {
  return cart.products.some((item) => item.productId.toString() === productId);
};

// Get cart item quantity
export const getCartItemQuantity = (cart: ICart, productId: string): number => {
  const item = cart.products.find(
    (item) => item.productId.toString() === productId
  );
  return item ? item.quantity : 0;
};

// Cart action response messages
export const CART_MESSAGES = {
  RETRIEVED: "Cart retrieved successfully",
  CREATED: "Cart created successfully",
  PRODUCT_ADDED: "Product added to cart",
  PRODUCT_UPDATED: "Cart item quantity updated",
  PRODUCT_REMOVED: "Product removed from cart",
  CART_EMPTY: "Cart is empty",
  PRODUCT_NOT_FOUND: "Product not found or has been deleted",
  PRODUCT_NOT_IN_CART: "Product is not in cart",
  INSUFFICIENT_STOCK: "Insufficient stock available",
  PRODUCT_OUT_OF_STOCK: "Product is out of stock",
};
