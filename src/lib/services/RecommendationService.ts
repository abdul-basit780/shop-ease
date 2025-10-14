// lib/services/RecommendationService.ts
import mongoose from "mongoose";
import { Feedback } from "../models/Feedback";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { Order } from "../models/Order";
import { Wishlist } from "../models/Wishlist";

interface RecommendedProduct {
  productId: mongoose.Types.ObjectId;
  score: number;
  reason: string;
  product?: any;
}

interface UserPreferences {
  userId: mongoose.Types.ObjectId;
  likedProducts: mongoose.Types.ObjectId[]; // From feedback (4-5 stars)
  wishlistProducts: mongoose.Types.ObjectId[]; // From wishlist
  likedCategoryIds: mongoose.Types.ObjectId[];
  wishlistCategoryIds: mongoose.Types.ObjectId[];
  avgRating: number;
  priceRange: { min: number; max: number };
  hasWishlist: boolean;
  hasFeedback: boolean;
}

export class RecommendationService {
  // Main recommendation method - combines collaborative and content-based
  static async getRecommendations(
    userId: mongoose.Types.ObjectId,
    limit: number = 10
  ): Promise<RecommendedProduct[]> {
    try {
      // Get user preferences from feedback
      const userPrefs = await this.getUserPreferences(userId);

      // Get collaborative filtering recommendations
      const collaborativeRecs = await this.collaborativeFiltering(
        userId,
        userPrefs
      );

      // Get content-based filtering recommendations
      const contentBasedRecs = await this.contentBasedFiltering(userPrefs);

      // Combine and rank recommendations
      const combined = this.combineRecommendations(
        collaborativeRecs,
        contentBasedRecs
      );

      // Remove products user already purchased or reviewed
      const filtered = await this.filterUserProducts(userId, combined);

      // Populate product details
      const recommendations = await this.populateProducts(
        filtered.slice(0, limit)
      );

      return recommendations;
    } catch (error) {
      console.error("Recommendation error:", error);
      return [];
    }
  }

  // Get user preferences from their feedback history and wishlist
  private static async getUserPreferences(
    userId: mongoose.Types.ObjectId
  ): Promise<UserPreferences> {
    // Get feedback data
    const feedbacks = await Feedback.find({ customerId: userId })
      .populate({
        path: "productId",
        populate: { path: "categoryId" },
      })
      .lean();

    // Get wishlist data
    const wishlist = await Wishlist.findOne({ customerId: userId })
      .populate({
        path: "products.productId",
        populate: { path: "categoryId" },
      })
      .lean();

    // Products user rated 4 or 5 stars
    const likedProducts = feedbacks
      .filter((f) => f.rating >= 4)
      .map((f) => f.productId);

    // Products in wishlist
    const wishlistProducts =
      wishlist?.products?.map((item: any) => item.productId) || [];

    // Extract category IDs from liked products (feedback)
    const likedCategoryIds = [
      ...new Set(
        likedProducts
          .map((p: any) => p?.categoryId?._id || p?.categoryId)
          .filter((c): c is mongoose.Types.ObjectId => !!c)
      ),
    ];

    // Extract category IDs from wishlist products
    const wishlistCategoryIds = [
      ...new Set(
        wishlistProducts
          .map((p: any) => p?.categoryId?._id || p?.categoryId)
          .filter((c): c is mongoose.Types.ObjectId => !!c)
      ),
    ];

    // Calculate average rating
    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    // Calculate price range preference from both feedback and wishlist
    const allProducts = [...likedProducts, ...wishlistProducts];
    const prices = allProducts
      .map((p: any) => p?.price)
      .filter((p): p is number => typeof p === "number");

    const priceRange = {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : Number.MAX_VALUE,
    };

    return {
      userId,
      likedProducts: likedProducts.map((p: any) => p._id),
      wishlistProducts: wishlistProducts.map((p: any) => p._id),
      likedCategoryIds,
      wishlistCategoryIds,
      avgRating,
      priceRange,
      hasWishlist: wishlistProducts.length > 0,
      hasFeedback: feedbacks.length > 0,
    };
  }

  // Collaborative Filtering: Find similar users and recommend their liked products
  private static async collaborativeFiltering(
    userId: mongoose.Types.ObjectId,
    userPrefs: UserPreferences
  ): Promise<RecommendedProduct[]> {
    try {
      // Find users who rated the same products similarly
      const userFeedbacks = await Feedback.find({
        customerId: userId,
      }).lean();

      if (userFeedbacks.length === 0) return [];

      // Get product IDs this user has rated
      const userProductIds = userFeedbacks.map((f) => f.productId);

      // Find other users who rated these products
      const similarUserFeedbacks = await Feedback.find({
        productId: { $in: userProductIds },
        customerId: { $ne: userId },
      }).lean();

      // Calculate similarity scores for each user
      const userSimilarity = new Map<string, number>();

      similarUserFeedbacks.forEach((feedback) => {
        const userFeedback = userFeedbacks.find(
          (f) => f.productId.toString() === feedback.productId.toString()
        );

        if (userFeedback) {
          const userIdStr = feedback.customerId.toString();
          const ratingDiff = Math.abs(userFeedback.rating - feedback.rating);
          const similarity = 1 - ratingDiff / 4; // Normalize to 0-1

          userSimilarity.set(
            userIdStr,
            (userSimilarity.get(userIdStr) || 0) + similarity
          );
        }
      });

      // Get top similar users
      const similarUsers = Array.from(userSimilarity.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => new mongoose.Types.ObjectId(id));

      if (similarUsers.length === 0) return [];

      // Get products liked by similar users
      const recommendations = await Feedback.aggregate([
        {
          $match: {
            customerId: { $in: similarUsers },
            rating: { $gte: 4 },
            productId: { $nin: userProductIds },
          },
        },
        {
          $group: {
            _id: "$productId",
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
        {
          $match: { count: { $gte: 2 } }, // At least 2 similar users liked it
        },
        { $sort: { avgRating: -1, count: -1 } },
        { $limit: 20 },
      ]);

      return recommendations.map((rec) => ({
        productId: rec._id as mongoose.Types.ObjectId,
        score: rec.avgRating * (1 + Math.log(rec.count)),
        reason: "Users with similar taste liked this",
      }));
    } catch (error) {
      console.error("Collaborative filtering error:", error);
      return [];
    }
  }

  // Content-Based Filtering: Recommend similar products based on user preferences
  private static async contentBasedFiltering(
    userPrefs: UserPreferences
  ): Promise<RecommendedProduct[]> {
    try {
      // Need either feedback or wishlist data
      if (
        userPrefs.likedProducts.length === 0 &&
        userPrefs.wishlistProducts.length === 0
      ) {
        return [];
      }

      // Combine liked and wishlist products to exclude
      const excludedProducts = [
        ...userPrefs.likedProducts,
        ...userPrefs.wishlistProducts,
      ];

      // Combine categories from both sources
      const allCategoryIds = [
        ...new Set([
          ...userPrefs.likedCategoryIds,
          ...userPrefs.wishlistCategoryIds,
        ]),
      ];

      // Build query for similar products
      const query: any = {
        _id: { $nin: excludedProducts },
        deletedAt: null,
        stock: { $gt: 0 },
      };

      // Filter by preferred categories
      if (allCategoryIds.length > 0) {
        query.categoryId = { $in: allCategoryIds };
      }

      // Filter by price range (with 30% tolerance)
      const priceMargin =
        (userPrefs.priceRange.max - userPrefs.priceRange.min) * 0.3;
      query.price = {
        $gte: Math.max(0, userPrefs.priceRange.min - priceMargin),
        $lte: userPrefs.priceRange.max + priceMargin,
      };

      // Find matching products and populate category
      const products = await Product.find(query)
        .populate("categoryId")
        .limit(20)
        .lean();

      // Calculate scores based on category match and price similarity
      return products.map((product) => {
        let score = 5; // Base score

        // Category match bonus - higher weight for feedback categories
        const categoryIdStr =
          product.categoryId?._id?.toString() || product.categoryId?.toString();

        const hasLikedCategory = userPrefs.likedCategoryIds.some(
          (catId) => catId.toString() === categoryIdStr
        );
        const hasWishlistCategory = userPrefs.wishlistCategoryIds.some(
          (catId) => catId.toString() === categoryIdStr
        );

        if (hasLikedCategory) {
          score += 3; // Strong signal from feedback
        } else if (hasWishlistCategory) {
          score += 2; // Medium signal from wishlist
        }

        // Price similarity bonus
        const avgPrice =
          (userPrefs.priceRange.min + userPrefs.priceRange.max) / 2;
        const priceDiff = Math.abs(product.price - avgPrice);
        const priceScore = Math.max(0, 2 - priceDiff / avgPrice);
        score += priceScore;

        // Determine reason based on source
        let reason = "Based on your interests";
        if (hasLikedCategory && hasWishlistCategory) {
          reason = "Matches your favorites and wishlist";
        } else if (hasLikedCategory) {
          reason = "Similar to products you loved";
        } else if (hasWishlistCategory) {
          reason = "Based on your wishlist";
        }

        return {
          productId: new mongoose.Types.ObjectId(product._id),
          score,
          reason,
        };
      });
    } catch (error) {
      console.error("Content-based filtering error:", error);
      return [];
    }
  }

  // Combine recommendations from both algorithms
  private static combineRecommendations(
    collaborative: RecommendedProduct[],
    contentBased: RecommendedProduct[]
  ): RecommendedProduct[] {
    const combined = new Map<string, RecommendedProduct>();

    // Add collaborative filtering results (higher weight)
    collaborative.forEach((rec) => {
      const key = rec.productId.toString();
      combined.set(key, {
        ...rec,
        score: rec.score * 1.5, // Give more weight to collaborative
      });
    });

    // Add content-based results
    contentBased.forEach((rec) => {
      const key = rec.productId.toString();
      if (combined.has(key)) {
        // Product recommended by both algorithms - boost score
        const existing = combined.get(key)!;
        combined.set(key, {
          ...existing,
          score: existing.score + rec.score,
          reason: "Highly recommended",
        });
      } else {
        combined.set(key, rec);
      }
    });

    // Sort by score
    return Array.from(combined.values()).sort((a, b) => b.score - a.score);
  }

  // Filter out products user already purchased, reviewed, or has in wishlist
  private static async filterUserProducts(
    userId: mongoose.Types.ObjectId,
    recommendations: RecommendedProduct[]
  ): Promise<RecommendedProduct[]> {
    // Get user's feedback product IDs
    const feedbackProducts = await Feedback.find({ customerId: userId })
      .distinct("productId")
      .lean();

    // Get user's wishlist product IDs
    const wishlist = await Wishlist.findOne({ customerId: userId }).lean();
    const wishlistProductIds =
      wishlist?.products?.map((item: any) => item.productId.toString()) || [];

    const excludeSet = new Set([
      ...feedbackProducts.map((id) => id.toString()),
      ...wishlistProductIds,
    ]);

    // Filter out reviewed and wishlisted products
    return recommendations.filter(
      (rec) => !excludeSet.has(rec.productId.toString())
    );
  }

  // Populate product details
  private static async populateProducts(
    recommendations: RecommendedProduct[]
  ): Promise<RecommendedProduct[]> {
    const productIds = recommendations.map((r) => r.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      deletedAt: null,
    })
      .populate("categoryId")
      .lean();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    return recommendations
      .map((rec) => ({
        ...rec,
        product: productMap.get(rec.productId.toString()),
      }))
      .filter((rec) => rec.product); // Remove products that no longer exist
  }

  // Get popular products (fallback for new users)
  static async getPopularProducts(limit: number = 10): Promise<any[]> {
    try {
      const popular = await Feedback.aggregate([
        { $match: { rating: { $gte: 4 } } },
        {
          $group: {
            _id: "$productId",
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gte: 5 } } },
        {
          $addFields: {
            score: {
              $multiply: ["$avgRating", { $add: [1, { $ln: "$count" }] }],
            },
          },
        },
        { $sort: { score: -1 } },
        { $limit: limit },
      ]);

      const productIds = popular.map((p) => p._id);
      const products = await Product.find({
        _id: { $in: productIds },
        deletedAt: null,
        stock: { $gt: 0 },
      })
        .populate("categoryId")
        .lean();

      return products;
    } catch (error) {
      console.error("Popular products error:", error);
      return [];
    }
  }

  // Get trending products (recent high ratings)
  static async getTrendingProducts(limit: number = 10): Promise<any[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trending = await Feedback.aggregate([
        {
          $match: {
            rating: { $gte: 4 },
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: "$productId",
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
        { $match: { count: { $gte: 3 } } },
        { $sort: { count: -1, avgRating: -1 } },
        { $limit: limit },
      ]);

      const productIds = trending.map((p) => p._id);
      const products = await Product.find({
        _id: { $in: productIds },
        deletedAt: null,
        stock: { $gt: 0 },
      })
        .populate("categoryId")
        .lean();

      return products;
    } catch (error) {
      console.error("Trending products error:", error);
      return [];
    }
  }
}
