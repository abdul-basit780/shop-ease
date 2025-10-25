// lib/controllers/recommendation.ts
import { NextApiResponse } from "next";
import connectToDatabase from "../db/mongodb";
import mongoose from "mongoose";
import { RecommendationService } from "../services/RecommendationService";
import {
  buildProductListResponse,
  RECOMMENDATION_MESSAGES,
  RecommendationResponse,
  ProductListResponse,
} from "../utils/recommendation";

interface Response {
  success: boolean;
  message: string;
  data?: RecommendationResponse | ProductListResponse;
  statusCode: number;
}

// Get popular products (public endpoint)
export const getPopularProducts = async (
  req: any,
  res: NextApiResponse
): Promise<Response> => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate limit
    if (limit < 1 || limit > 50) {
      response.message = "Limit must be between 1 and 50";
      response.statusCode = 400;
      return response;
    }

    const products = await RecommendationService.getPopularProducts(limit);

    response.data = buildProductListResponse(products);
    response.success = true;
    response.message = RECOMMENDATION_MESSAGES.POPULAR_RETRIEVED;
    response.statusCode = 200;

    return response;
  } catch (err) {
    console.error("Get popular products error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};

// Get trending products (public endpoint)
export const getTrendingProducts = async (
  req: any,
  res: NextApiResponse
): Promise<Response> => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate limit
    if (limit < 1 || limit > 50) {
      response.message = "Limit must be between 1 and 50";
      response.statusCode = 400;
      return response;
    }

    const products = await RecommendationService.getTrendingProducts(limit);

    response.data = buildProductListResponse(products);
    response.success = true;
    response.message = RECOMMENDATION_MESSAGES.TRENDING_RETRIEVED;
    response.statusCode = 200;

    return response;
  } catch (err) {
    console.error("Get trending products error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};

// Get similar products based on a specific product
export const getSimilarProducts = async (
  req: any,
  res: NextApiResponse
): Promise<Response> => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    const { id } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate ID
    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      response.message = "Invalid product ID";
      response.statusCode = 400;
      return response;
    }

    // Validate limit
    if (limit < 1 || limit > 50) {
      response.message = "Limit must be between 1 and 50";
      response.statusCode = 400;
      return response;
    }

    const { Product } = require("../models/Product");
    const product = await Product.findById(id).populate("categoryId").lean();

    if (!product || product.deletedAt) {
      response.message = RECOMMENDATION_MESSAGES.PRODUCT_NOT_FOUND;
      response.statusCode = 404;
      return response;
    }

    // Find similar products based on category and price
    const priceMargin = product.price * 0.3;
    const similarProducts = await Product.find({
      _id: { $ne: id },
      categoryId: product.categoryId._id || product.categoryId,
      price: {
        $gte: product.price - priceMargin,
        $lte: product.price + priceMargin,
      },
      deletedAt: null,
      stock: { $gt: 0 },
    })
      .populate("categoryId")
      .limit(limit)
      .lean();

    response.data = buildProductListResponse(similarProducts);
    response.success = true;
    response.message = RECOMMENDATION_MESSAGES.SIMILAR_RETRIEVED;
    response.statusCode = 200;

    return response;
  } catch (err) {
    console.error("Get similar products error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};
