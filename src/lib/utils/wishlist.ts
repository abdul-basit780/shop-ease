// lib/utils/wishlist.ts
import { IWishlist } from "../models/Wishlist";
import { isValidObjectId } from "mongoose";

export interface WishlistProductResponse {
  productId: string;
  name: string;
  price: number;
  stock: number;
  img: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  addedAt: Date;
  isAvailable: boolean;
  optionTypes?: Array<{
    id: string;
    name: string;
    values: Array<{
      id: string;
      value: string;
      img: string | undefined;
      price: number;
      stock: number;
    }>;
  }>;
}

export interface WishlistResponse {
  id: string;
  customerId: string;
  products: WishlistProductResponse[];
  count: number;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToWishlistRequest {
  productId: string;
}

export interface RemoveFromWishlistRequest {
  productId: string;
}

// Helper function to build wishlist response with populated products
export const buildWishlistResponse = (
  wishlist: any // IWishlist with populated products
): WishlistResponse => {
  let totalValue = 0;

  const products: WishlistProductResponse[] = wishlist.products
    .filter((item: any) => item.productId) // Filter out any null products (deleted)
    .map((item: any) => {
      const product = item.productId as any; // Populated product
      const isAvailable = product.stock > 0 && !product.deletedAt;

      if (isAvailable) {
        totalValue += product.price;
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
        addedAt: item.addedAt,
        isAvailable,
      };
    });

  return {
    id: wishlist._id.toString(),
    customerId: wishlist.customerId.toString(),
    products,
    count: products.length,
    totalValue: Math.round(totalValue * 100) / 100, // Round to 2 decimal places
    createdAt: wishlist.createdAt,
    updatedAt: wishlist.updatedAt,
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

// Check if product is in wishlist
export const isProductInWishlist = (
  wishlist: IWishlist,
  productId: string
): boolean => {
  return wishlist.products.some(
    (item) => item.productId.toString() === productId
  );
};

// Wishlist action response messages
export const WISHLIST_MESSAGES = {
  RETRIEVED: "Wishlist retrieved successfully",
  CREATED: "Wishlist created successfully",
  PRODUCT_ADDED: "Product added to wishlist",
  PRODUCT_REMOVED: "Product removed from wishlist",
  PRODUCT_ALREADY_EXISTS: "Product is already in wishlist",
  PRODUCT_NOT_IN_WISHLIST: "Product is not in wishlist",
  WISHLIST_EMPTY: "Wishlist is empty",
  PRODUCT_NOT_FOUND: "Product not found or has been deleted",
};
