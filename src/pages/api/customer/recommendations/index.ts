// pages/api/customer/recommendations/index.ts
import type { NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../../lib/utils/apiResponse";
import {
  authenticate,
  customerOnly,
  allowMethods,
  rateLimit,
  composeMiddleware,
  AuthenticatedRequest,
} from "../../../../lib/middleware/auth";
import { getRecommendations } from "../../../../lib/controllers/recommendation";

// GET: Get personalized recommendations
const getRecommendationsHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await getRecommendations(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.data, response.message, response.statusCode);
};

const recommendationsHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  if (req.method === "GET") {
    return getRecommendationsHandler(req, res);
  }

  return sendError(res, "Method not allowed", 405);
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["GET"]),
    authenticate,
    customerOnly,
    recommendationsHandler
  )
);