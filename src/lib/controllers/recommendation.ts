// lib/controllers/recommendation.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import connectToDatabase from "../db/mongodb";
import mongoose from "mongoose";
import { RecommendationService } from "../services/RecommendationService";
import { Feedback } from "../models/Feedback";
import { Wishlist } from "../models/Wishlist";
import {
  buildRecommendationResponse,
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

// Get personalized recommendations for user
export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<Response> => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);
    const limit = parseInt(req.query.limit as string) || 10;

    // Validate limit
    if (limit < 1 || limit > 50) {
      response.message = "Limit must be between 1 and 50";
      response.statusCode = 400;
      return response;
    }

    // Check if user has any feedback or wishlist data
    const [feedbackCount, wishlist] = await Promise.all([
      Feedback.countDocuments({ customerId }),
      Wishlist.findOne({ customerId }).lean(),
    ]);

    const hasWishlist = wishlist?.products && wishlist.products.length > 0;

    let recommendations;
    let recommendationType: "personalized" | "popular";

    if (feedbackCount === 0 && !hasWishlist) {
      // Completely new user - show popular products
      recommendations = await RecommendationService.getPopularProducts(limit);
      recommendationType = "popular";
    } else {
      // User has feedback or wishlist - personalized recommendations
      recommendations = await RecommendationService.getRecommendations(
        customerId,
        limit
      );
      recommendationType = "personalized";
    }

    response.data = buildRecommendationResponse(
      recommendations,
      recommendationType
    );
    response.success = true;
    response.message = RECOMMENDATION_MESSAGES.RETRIEVED;
    response.statusCode = 200;

    return response;
  } catch (err) {
    console.error("Get recommendations error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};
