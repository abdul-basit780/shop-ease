// lib/services/RecommendationService.ts
import mongoose from "mongoose";
import { Feedback } from "../models/Feedback";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import { Order } from "../models/Order";
import { Wishlist } from "../models/Wishlist";
import { Cart } from "../models/Cart";
import { OptionType } from "../models/OptionType";
import { OptionValue } from "../models/OptionValue";
import { OrderStatus } from "../models/enums";

interface RecommendedProduct {
  productId: mongoose.Types.ObjectId;
  score: number;
  reason: string;
  product?: any;
}

interface UserPreferences {
  userId: mongoose.Types.ObjectId;
  likedProducts: mongoose.Types.ObjectId[];
  wishlistProducts: mongoose.Types.ObjectId[];
  likedCategoryIds: mongoose.Types.ObjectId[];
  wishlistCategoryIds: mongoose.Types.ObjectId[];
  avgRating: number;
  priceRange: { min: number; max: number };
  hasWishlist: boolean;
  hasFeedback: boolean;
}

export class RecommendationService {
  // Main recommendation method
  static async getRecommendations(
    userId: mongoose.Types.ObjectId,
    limit: number = 10
  ): Promise<RecommendedProduct[]> {
    try {
      const userPrefs = await this.getUserPreferences(userId);
      const collaborativeRecs = await this.collaborativeFiltering(
        userId,
        userPrefs
      );
      const contentBasedRecs = await this.contentBasedFiltering(userPrefs);
      const combined = this.combineRecommendations(
        collaborativeRecs,
        contentBasedRecs
      );
      const filtered = await this.filterUserProducts(userId, combined);

      let recommendations = await this.populateProducts(
        filtered.slice(0, limit)
      );

      // Add more products if not enough
      if (recommendations.length < limit) {
        recommendations = await this.backfillRecommendations(
          userId,
          recommendations,
          limit
        );
      }

      return recommendations;
    } catch (error) {
      console.error("Recommendation error:", error);
      return [];
    }
  }

  // Get user's preferences from past behavior
  private static async getUserPreferences(
    userId: mongoose.Types.ObjectId
  ): Promise<UserPreferences> {
    const feedbacks = await Feedback.find({ customerId: userId })
      .populate({ path: "productId", populate: { path: "categoryId" } })
      .lean();

    const wishlist = await Wishlist.findOne({ customerId: userId })
      .populate({
        path: "products.productId",
        populate: { path: "categoryId" },
      })
      .lean();

    const likedProducts = feedbacks
      .filter((f) => f.rating >= 4)
      .map((f) => f.productId);
    const wishlistProducts =
      wishlist?.products?.map((item: any) => item.productId) || [];

    const likedCategoryIds = [
      ...new Set(
        likedProducts
          .map((p: any) => p?.categoryId?._id || p?.categoryId)
          .filter((c): c is mongoose.Types.ObjectId => !!c)
      ),
    ];

    const wishlistCategoryIds = [
      ...new Set(
        wishlistProducts
          .map((p: any) => p?.categoryId?._id || p?.categoryId)
          .filter((c): c is mongoose.Types.ObjectId => !!c)
      ),
    ];

    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

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

  // Find what others bought with cart items
  private static async collaborativeFiltering(
    userId: mongoose.Types.ObjectId,
    userPrefs: UserPreferences
  ): Promise<RecommendedProduct[]> {
    try {
      const cart = await Cart.findOne({ customerId: userId })
        .select("products")
        .lean();

      if (!cart || cart.products.length === 0) {
        return await this.feedbackBasedCollaborativeFiltering(
          userId,
          userPrefs
        );
      }

      const latestCartItem = cart.products[cart.products.length - 1];
      const targetProductId = latestCartItem.productId;
      const cartProductIds = cart.products.map((p) => p.productId.toString());

      const ordersWithProduct = await Order.find({
        "products.productId": targetProductId,
        customerId: { $ne: userId },
        status: {
          $in: [
            OrderStatus.COMPLETED,
            OrderStatus.SHIPPED,
            OrderStatus.PROCESSING,
          ],
        },
      })
        .select("products")
        .lean();

      if (ordersWithProduct.length === 0) {
        return await this.feedbackBasedCollaborativeFiltering(
          userId,
          userPrefs
        );
      }

      const productFrequency = new Map<
        string,
        {
          count: number;
          totalQuantity: number;
          productId: mongoose.Types.ObjectId;
        }
      >();

      ordersWithProduct.forEach((order) => {
        order.products.forEach((product) => {
          const productIdStr = product.productId.toString();
          if (
            productIdStr === targetProductId.toString() ||
            cartProductIds.includes(productIdStr)
          ) {
            return;
          }

          if (productFrequency.has(productIdStr)) {
            const existing = productFrequency.get(productIdStr)!;
            existing.count += 1;
            existing.totalQuantity += product.quantity;
          } else {
            productFrequency.set(productIdStr, {
              count: 1,
              totalQuantity: product.quantity,
              productId: product.productId,
            });
          }
        });
      });

      const recommendations: RecommendedProduct[] = Array.from(
        productFrequency.entries()
      )
        .map(([productIdStr, data]) => {
          const frequencyScore = data.count / ordersWithProduct.length;
          const quantityBonus = Math.log(data.totalQuantity + 1) * 0.5;
          const score = frequencyScore * 10 + quantityBonus;

          return {
            productId: data.productId,
            score,
            reason: `Frequently bought together`,
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      return recommendations;
    } catch (error) {
      console.error("Collaborative filtering error:", error);
      return [];
    }
  }

  // Find users with similar taste
  private static async feedbackBasedCollaborativeFiltering(
    userId: mongoose.Types.ObjectId,
    userPrefs: UserPreferences
  ): Promise<RecommendedProduct[]> {
    try {
      const userFeedbacks = await Feedback.find({ customerId: userId }).lean();
      if (userFeedbacks.length === 0) return [];

      const userProductIds = userFeedbacks.map((f) => f.productId);
      const similarUserFeedbacks = await Feedback.find({
        productId: { $in: userProductIds },
        customerId: { $ne: userId },
      }).lean();

      const userSimilarity = new Map<string, number>();

      similarUserFeedbacks.forEach((feedback) => {
        const userFeedback = userFeedbacks.find(
          (f) => f.productId.toString() === feedback.productId.toString()
        );
        if (userFeedback) {
          const userIdStr = feedback.customerId.toString();
          const ratingDiff = Math.abs(userFeedback.rating - feedback.rating);
          const similarity = 1 - ratingDiff / 4;
          userSimilarity.set(
            userIdStr,
            (userSimilarity.get(userIdStr) || 0) + similarity
          );
        }
      });

      const similarUsers = Array.from(userSimilarity.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => new mongoose.Types.ObjectId(id));

      if (similarUsers.length === 0) return [];

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
        { $match: { count: { $gte: 2 } } },
        { $sort: { avgRating: -1, count: -1 } },
        { $limit: 20 },
      ]);

      return recommendations.map((rec) => ({
        productId: rec._id as mongoose.Types.ObjectId,
        score: rec.avgRating * (1 + Math.log(rec.count)),
        reason: "Users with similar taste liked this",
      }));
    } catch (error) {
      console.error("Feedback-based collaborative filtering error:", error);
      return [];
    }
  }

  // Find products similar to what user liked
  private static async contentBasedFiltering(
    userPrefs: UserPreferences
  ): Promise<RecommendedProduct[]> {
    try {
      if (
        userPrefs.likedProducts.length === 0 &&
        userPrefs.wishlistProducts.length === 0
      ) {
        return [];
      }

      const excludedProducts = [
        ...userPrefs.likedProducts,
        ...userPrefs.wishlistProducts,
      ];
      const allCategoryIds = [
        ...new Set([
          ...userPrefs.likedCategoryIds,
          ...userPrefs.wishlistCategoryIds,
        ]),
      ];

      const query: any = {
        _id: { $nin: excludedProducts },
        deletedAt: null,
      };

      if (allCategoryIds.length > 0) {
        query.categoryId = { $in: allCategoryIds };
      }

      const priceMargin =
        (userPrefs.priceRange.max - userPrefs.priceRange.min) * 0.3;
      query.price = {
        $gte: Math.max(0, userPrefs.priceRange.min - priceMargin),
        $lte: userPrefs.priceRange.max + priceMargin,
      };

      const products = await Product.find(query)
        .populate("categoryId")
        .limit(20)
        .lean();

      return products.map((product) => {
        let score = 5;
        const categoryIdStr =
          product.categoryId?._id?.toString() || product.categoryId?.toString();

        const hasLikedCategory = userPrefs.likedCategoryIds.some(
          (catId) => catId.toString() === categoryIdStr
        );
        const hasWishlistCategory = userPrefs.wishlistCategoryIds.some(
          (catId) => catId.toString() === categoryIdStr
        );

        if (hasLikedCategory) score += 3;
        else if (hasWishlistCategory) score += 2;

        const avgPrice =
          (userPrefs.priceRange.min + userPrefs.priceRange.max) / 2;
        const priceDiff = Math.abs(product.price - avgPrice);
        const priceScore = Math.max(0, 2 - priceDiff / avgPrice);
        score += priceScore;

        let reason = "Based on your interests";
        if (hasLikedCategory && hasWishlistCategory)
          reason = "Matches your favorites and wishlist";
        else if (hasLikedCategory) reason = "Similar to products you loved";
        else if (hasWishlistCategory) reason = "Based on your wishlist";

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

  // Merge results from both methods
  private static combineRecommendations(
    collaborative: RecommendedProduct[],
    contentBased: RecommendedProduct[]
  ): RecommendedProduct[] {
    const combined = new Map<string, RecommendedProduct>();

    collaborative.forEach((rec) => {
      const key = rec.productId.toString();
      combined.set(key, { ...rec, score: rec.score * 1.5 });
    });

    contentBased.forEach((rec) => {
      const key = rec.productId.toString();
      if (combined.has(key)) {
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

    return Array.from(combined.values()).sort((a, b) => b.score - a.score);
  }

  // Remove products already in cart
  private static async filterUserProducts(
    userId: mongoose.Types.ObjectId,
    recommendations: RecommendedProduct[]
  ): Promise<RecommendedProduct[]> {
    const cartProductIds = await this.getCartProductIds(userId);
    const excludeSet = new Set<string>(cartProductIds);
    return recommendations.filter(
      (rec) => !excludeSet.has(rec.productId.toString())
    );
  }

  // Add popular/trending/new products if needed
  private static async backfillRecommendations(
    userId: mongoose.Types.ObjectId,
    currentRecommendations: RecommendedProduct[],
    targetLimit: number
  ): Promise<RecommendedProduct[]> {
    try {
      const needed = targetLimit - currentRecommendations.length;
      if (needed <= 0) return currentRecommendations;

      const existingProductIds = new Set(
        currentRecommendations.map((r) => r.product._id.toString())
      );
      const cartProductIds = await this.getCartProductIds(userId);
      cartProductIds.forEach((id) => existingProductIds.add(id));

      // Fetch all backfill products in parallel
      const [popularProducts, trendingProducts, newArrivals] =
        await Promise.all([
          this.getPopularProducts(needed * 2, userId, existingProductIds),
          this.getTrendingProducts(needed * 2, userId, existingProductIds),
          this.getNewArrivals(needed * 2, userId, existingProductIds),
        ]);

      const backfillProducts: RecommendedProduct[] = [];
      const perStrategy = Math.ceil(needed / 3);

      // Add popular products
      popularProducts.forEach((product) => {
        if (
          backfillProducts.length < perStrategy &&
          !existingProductIds.has(product._id.toString())
        ) {
          backfillProducts.push({
            productId: product._id,
            score: 3,
            reason: "Popular choice",
            product,
          });
          existingProductIds.add(product._id.toString());
        }
      });

      // Add trending products
      trendingProducts.forEach((product) => {
        if (
          backfillProducts.length < needed &&
          !existingProductIds.has(product._id.toString())
        ) {
          backfillProducts.push({
            productId: product._id,
            score: 2,
            reason: "Trending now",
            product,
          });
          existingProductIds.add(product._id.toString());
        }
      });

      // Add new arrivals
      newArrivals.forEach((product) => {
        if (
          backfillProducts.length < needed &&
          !existingProductIds.has(product._id.toString())
        ) {
          backfillProducts.push({
            productId: product._id,
            score: 1,
            reason: "New arrival",
            product,
          });
          existingProductIds.add(product._id.toString());
        }
      });

      backfillProducts.sort((a, b) => b.score - a.score);
      return [...currentRecommendations, ...backfillProducts.slice(0, needed)];
    } catch (error) {
      console.error("Backfill error:", error);
      return currentRecommendations;
    }
  }

  // OPTIMIZED: Load full product details with options - BATCH QUERIES
  private static async populateProducts(
    recommendations: RecommendedProduct[]
  ): Promise<RecommendedProduct[]> {
    if (recommendations.length === 0) return [];

    const productIds = recommendations.map((r) => r.productId);

    // Fetch products
    const products = await Product.find({
      _id: { $in: productIds },
      deletedAt: null,
    })
      .populate("categoryId")
      .lean();

    // BATCH: Fetch ALL option types and values at once
    const [allOptionTypes, allOptionValues] = await Promise.all([
      OptionType.find({ productId: { $in: productIds }, deletedAt: null })
        .sort({ name: 1 })
        .lean(),
      OptionValue.find({
        optionTypeId: {
          $in: await OptionType.find({
            productId: { $in: productIds },
            deletedAt: null,
          }).distinct("_id"),
        },
        deletedAt: null,
      })
        .sort({ value: 1 })
        .lean(),
    ]);

    // Build maps for fast lookup
    const optionTypesByProduct = new Map<string, any[]>();
    allOptionTypes.forEach((ot) => {
      const key = ot.productId.toString();
      if (!optionTypesByProduct.has(key)) {
        optionTypesByProduct.set(key, []);
      }
      optionTypesByProduct.get(key)!.push(ot);
    });

    const optionValuesByType = new Map<string, any[]>();
    allOptionValues.forEach((ov) => {
      const key = ov.optionTypeId.toString();
      if (!optionValuesByType.has(key)) {
        optionValuesByType.set(key, []);
      }
      optionValuesByType.get(key)!.push(ov);
    });

    // Filter products with stock (in-memory check using cached data)
    const productsWithStock = products.filter((product) => {
      const productOptionTypes =
        optionTypesByProduct.get(product._id.toString()) || [];

      if (productOptionTypes.length > 0) {
        // Has options - check if any option has stock
        return productOptionTypes.some((ot) => {
          const values = optionValuesByType.get(ot._id.toString()) || [];
          return values.some((ov) => ov.stock > 0);
        });
      } else {
        // No options - check main stock
        return product.stock > 0;
      }
    });

    const productMap = new Map(
      productsWithStock.map((p) => [p._id.toString(), p])
    );

    // Build final results with options
    return recommendations
      .map((rec) => {
        const product = productMap.get(rec.productId.toString());
        if (!product) return null;

        const productOptionTypes =
          optionTypesByProduct.get(product._id.toString()) || [];

        if (productOptionTypes.length > 0) {
          // Cast to any to add dynamic optionTypes property
          (product as any).optionTypes = productOptionTypes.map((ot) => ({
            id: ot._id.toString(),
            name: ot.name,
            values: (optionValuesByType.get(ot._id.toString()) || []).map(
              (ov) => ({
                id: ov._id.toString(),
                value: ov.value,
                img: ov.img,
                price: ov.price,
                stock: ov.stock,
              })
            ),
          }));
        }

        return { ...rec, product };
      })
      .filter(
        (rec): rec is RecommendedProduct & { product: any } => rec !== null
      );
  }

  // Helper: Get cart product IDs
  static async getCartProductIds(
    userId: mongoose.Types.ObjectId
  ): Promise<string[]> {
    try {
      const cart = await Cart.findOne({ customerId: userId })
        .select("products")
        .lean();
      return cart ? cart.products.map((p) => p.productId.toString()) : [];
    } catch (error) {
      console.error("Cart products error:", error);
      return [];
    }
  }

  // OPTIMIZED: Get best-selling products
  static async getPopularProducts(
    limit: number = 10,
    userId?: mongoose.Types.ObjectId,
    existingProductIds?: Set<string>
  ): Promise<any[]> {
    try {
      const cartProductIds = userId ? await this.getCartProductIds(userId) : [];
      const excludeProductIds = [
        ...cartProductIds,
        ...(existingProductIds ? Array.from(existingProductIds) : []),
      ];

      const popularProducts = await Order.aggregate([
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            totalSold: { $sum: "$products.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit * 3 },
      ]);

      if (popularProducts.length === 0) {
        // Fallback: return any products
        return await Product.find({
          deletedAt: null,
          _id: { $nin: excludeProductIds },
        })
          .populate("categoryId")
          .limit(limit)
          .lean();
      }

      const productIds = popularProducts
        .map((p) => p._id)
        .filter((id) => !excludeProductIds.includes(id.toString()));

      // Fetch products and ratings in parallel
      const [products, productRatings] = await Promise.all([
        Product.find({ _id: { $in: productIds }, deletedAt: null })
          .populate("categoryId")
          .lean(),
        Feedback.aggregate([
          { $match: { productId: { $in: productIds } } },
          { $group: { _id: "$productId", avgRating: { $avg: "$rating" } } },
        ]),
      ]);

      // BATCH: Fetch options for all products at once
      const [allOptionTypes, allOptionValues] = await Promise.all([
        OptionType.find({
          productId: { $in: productIds },
          deletedAt: null,
        }).lean(),
        OptionValue.find({
          optionTypeId: {
            $in: await OptionType.find({
              productId: { $in: productIds },
              deletedAt: null,
            }).distinct("_id"),
          },
          deletedAt: null,
        }).lean(),
      ]);

      // Build maps
      const optionTypesByProduct = new Map<string, any[]>();
      allOptionTypes.forEach((ot) => {
        const key = ot.productId.toString();
        if (!optionTypesByProduct.has(key)) optionTypesByProduct.set(key, []);
        optionTypesByProduct.get(key)!.push(ot);
      });

      const optionValuesByType = new Map<string, any[]>();
      allOptionValues.forEach((ov) => {
        const key = ov.optionTypeId.toString();
        if (!optionValuesByType.has(key)) optionValuesByType.set(key, []);
        optionValuesByType.get(key)!.push(ov);
      });

      // Filter by stock (in-memory)
      const productsWithStock = products.filter((product) => {
        const productOptionTypes =
          optionTypesByProduct.get(product._id.toString()) || [];
        if (productOptionTypes.length > 0) {
          return productOptionTypes.some((ot) => {
            const values = optionValuesByType.get(ot._id.toString()) || [];
            return values.some((ov) => ov.stock > 0);
          });
        }
        return product.stock > 0;
      });

      // Filter by ratings
      const ratingMap = new Map(
        productRatings.map((r) => [r._id.toString(), r.avgRating])
      );
      const filteredProducts = productsWithStock.filter((product) => {
        const avgRating = ratingMap.get(product._id.toString());
        return !avgRating || avgRating > 4;
      });

      return filteredProducts.slice(0, limit);
    } catch (error) {
      console.error("Popular products error:", error);
      return [];
    }
  }

  // OPTIMIZED: Get recently popular products
  static async getTrendingProducts(
    limit: number = 10,
    userId?: mongoose.Types.ObjectId,
    existingProductIds?: Set<string>
  ): Promise<any[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const cartProductIds = userId ? await this.getCartProductIds(userId) : [];
      const excludeProductIds = [
        ...cartProductIds,
        ...(existingProductIds ? Array.from(existingProductIds) : []),
      ];

      const trendingProducts = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: {
              $in: [
                OrderStatus.COMPLETED,
                OrderStatus.SHIPPED,
                OrderStatus.PROCESSING,
              ],
            },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            recentSales: { $sum: "$products.quantity" },
          },
        },
        { $sort: { recentSales: -1 } },
        { $limit: limit * 3 },
      ]);

      if (trendingProducts.length === 0) {
        return await Product.find({
          deletedAt: null,
          _id: { $nin: excludeProductIds },
        })
          .populate("categoryId")
          .limit(limit)
          .lean();
      }

      const productIds = trendingProducts
        .map((p) => p._id)
        .filter((id) => !excludeProductIds.includes(id.toString()));

      const [products, productRatings] = await Promise.all([
        Product.find({ _id: { $in: productIds }, deletedAt: null })
          .populate("categoryId")
          .lean(),
        Feedback.aggregate([
          { $match: { productId: { $in: productIds } } },
          { $group: { _id: "$productId", avgRating: { $avg: "$rating" } } },
        ]),
      ]);

      const [allOptionTypes, allOptionValues] = await Promise.all([
        OptionType.find({
          productId: { $in: productIds },
          deletedAt: null,
        }).lean(),
        OptionValue.find({
          optionTypeId: {
            $in: await OptionType.find({
              productId: { $in: productIds },
              deletedAt: null,
            }).distinct("_id"),
          },
          deletedAt: null,
        }).lean(),
      ]);

      const optionTypesByProduct = new Map<string, any[]>();
      allOptionTypes.forEach((ot) => {
        const key = ot.productId.toString();
        if (!optionTypesByProduct.has(key)) optionTypesByProduct.set(key, []);
        optionTypesByProduct.get(key)!.push(ot);
      });

      const optionValuesByType = new Map<string, any[]>();
      allOptionValues.forEach((ov) => {
        const key = ov.optionTypeId.toString();
        if (!optionValuesByType.has(key)) optionValuesByType.set(key, []);
        optionValuesByType.get(key)!.push(ov);
      });

      const productsWithStock = products.filter((product) => {
        const productOptionTypes =
          optionTypesByProduct.get(product._id.toString()) || [];
        if (productOptionTypes.length > 0) {
          return productOptionTypes.some((ot) => {
            const values = optionValuesByType.get(ot._id.toString()) || [];
            return values.some((ov) => ov.stock > 0);
          });
        }
        return product.stock > 0;
      });

      const ratingMap = new Map(
        productRatings.map((r) => [r._id.toString(), r.avgRating])
      );
      const filteredProducts = productsWithStock.filter((product) => {
        const avgRating = ratingMap.get(product._id.toString());
        return !avgRating || avgRating > 4;
      });

      return filteredProducts.slice(0, limit);
    } catch (error) {
      console.error("Trending products error:", error);
      return [];
    }
  }

  // OPTIMIZED: Get newest products
  static async getNewArrivals(
    limit: number = 10,
    userId?: mongoose.Types.ObjectId,
    existingProductIds?: Set<string>
  ): Promise<any[]> {
    try {
      const cartProductIds = userId ? await this.getCartProductIds(userId) : [];
      const excludeProductIds = [
        ...cartProductIds,
        ...(existingProductIds ? Array.from(existingProductIds) : []),
      ];

      const products = await Product.find({
        deletedAt: null,
        _id: { $nin: excludeProductIds },
      })
        .sort({ createdAt: -1 })
        .limit(limit * 2)
        .populate("categoryId")
        .lean();

      const productIds = products.map((p) => p._id);

      const [allOptionTypes, allOptionValues] = await Promise.all([
        OptionType.find({
          productId: { $in: productIds },
          deletedAt: null,
        }).lean(),
        OptionValue.find({
          optionTypeId: {
            $in: await OptionType.find({
              productId: { $in: productIds },
              deletedAt: null,
            }).distinct("_id"),
          },
          deletedAt: null,
        }).lean(),
      ]);

      const optionTypesByProduct = new Map<string, any[]>();
      allOptionTypes.forEach((ot) => {
        const key = ot.productId.toString();
        if (!optionTypesByProduct.has(key)) optionTypesByProduct.set(key, []);
        optionTypesByProduct.get(key)!.push(ot);
      });

      const optionValuesByType = new Map<string, any[]>();
      allOptionValues.forEach((ov) => {
        const key = ov.optionTypeId.toString();
        if (!optionValuesByType.has(key)) optionValuesByType.set(key, []);
        optionValuesByType.get(key)!.push(ov);
      });

      const productsWithStock = products.filter((product) => {
        const productOptionTypes =
          optionTypesByProduct.get(product._id.toString()) || [];
        if (productOptionTypes.length > 0) {
          return productOptionTypes.some((ot) => {
            const values = optionValuesByType.get(ot._id.toString()) || [];
            return values.some((ov) => ov.stock > 0);
          });
        }
        return product.stock > 0;
      });

      return productsWithStock.slice(0, limit);
    } catch (error) {
      console.error("New arrivals error:", error);
      return [];
    }
  }
}
