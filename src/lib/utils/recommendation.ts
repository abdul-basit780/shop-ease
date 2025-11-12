// lib/utils/recommendation.ts

import { getProductsRatings, ProductRating } from "./product";
import mongoose from "mongoose";

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  img: string;
  category: string;
  stock: number;
  averageRating?: number;
  totalReviews?: number;
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
  }>[];
}

export interface RecommendationItem extends ProductItem {
  reason: string;
  score: number;
}

export interface RecommendationResponse {
  recommendations: RecommendationItem[];
  type: "personalized" | "popular";
  count: number;
}

export interface ProductListResponse {
  products: ProductItem[];
  count: number;
}

// Build recommendation response
export const buildRecommendationResponse = async (
  recommendations: any[],
  type: "personalized" | "popular"
): Promise<RecommendationResponse> => {
  const productIds = recommendations.map((rec: any) => rec.productId || rec.product?._id);
  const ratingsMap = await getProductsRatings(productIds); // Fetch ratings for all products
  const items = recommendations.map((rec: any) => {
    const product = rec.product || rec;
    const category = product.categoryId?.name || product.categoryId;
    const rating = ratingsMap?.get(product._id.toString());

    return {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      img: product.img,
      category: category,
      stock: product.stock,
      averageRating: rating?.averageRating,
      totalReviews: rating?.totalReviews,
      reason: rec.reason || "Popular choice",
      score: rec.score || 0,
      optionTypes: product.optionTypes || [],
    };
  });

  return {
    recommendations: items,
    type,
    count: items.length,
  };
};

// Build product list response (for popular, trending, similar)
export const buildProductListResponse = async (
  products: any[],
): Promise<ProductListResponse> => {
  const productIds = products.map((p) => p._id);
  const ratingsMap = await getProductsRatings(productIds); // Fetch ratings for all products
  const items = products.map((p: any) => {
    const rating = ratingsMap?.get(p._id.toString());
    return {
      id: p._id.toString(),
      name: p.name,
      price: p.price,
      img: p.img,
      category: p.categoryId?.name || p.categoryId,
      stock: p.stock,
      averageRating: rating?.averageRating,
      totalReviews: rating?.totalReviews,
      optionTypes: p.optionTypes || [],
    };
  });

  return {
    products: items,
    count: items.length,
  };
};

// Recommendation action response messages
export const RECOMMENDATION_MESSAGES = {
  RETRIEVED: "Recommendations retrieved successfully",
  POPULAR_RETRIEVED: "Popular products retrieved successfully",
  TRENDING_RETRIEVED: "Trending products retrieved successfully",
  SIMILAR_RETRIEVED: "Similar products retrieved successfully",
  PRODUCT_NOT_FOUND: "Product not found",
};
