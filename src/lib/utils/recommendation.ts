// lib/utils/recommendation.ts

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  img: string;
  category: string;
  stock: number;
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
export const buildRecommendationResponse = (
  recommendations: any[],
  type: "personalized" | "popular"
): RecommendationResponse => {
  const items = recommendations.map((rec: any) => {
    const product = rec.product || rec;
    const category = product.categoryId?.name || product.categoryId;

    return {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      img: product.img,
      category: category,
      stock: product.stock,
      reason: rec.reason || "Popular choice",
      score: rec.score || 0,
    };
  });

  return {
    recommendations: items,
    type,
    count: items.length,
  };
};

// Build product list response (for popular, trending, similar)
export const buildProductListResponse = (
  products: any[]
): ProductListResponse => {
  const items = products.map((p: any) => ({
    id: p._id.toString(),
    name: p.name,
    price: p.price,
    img: p.img,
    category: p.categoryId?.name || p.categoryId,
    stock: p.stock,
  }));

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
