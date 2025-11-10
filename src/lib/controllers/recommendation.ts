// lib/controllers/recommendation.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import connectToDatabase from "../db/mongodb";
import mongoose from "mongoose";
import { RecommendationService } from "../services/RecommendationService";
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
  
    const recommendations = await RecommendationService.getRecommendations(
      customerId,
      limit,
    );
    response.data = buildRecommendationResponse(
      recommendations,
      'personalized'
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
