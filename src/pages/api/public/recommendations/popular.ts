// pages/api/public/recommendations/popular.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../../lib/utils/apiResponse";
import {
  allowMethods,
  rateLimit,
  composeMiddleware,
} from "../../../../lib/middleware/auth";
import { getPopularProducts } from "../../../../lib/controllers/publicRecommendation";

// GET: Get popular products
const getPopularProductsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const response = await getPopularProducts(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.data, response.message, response.statusCode);
};

const popularHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  if (req.method === "GET") {
    return getPopularProductsHandler(req, res);
  }

  return sendError(res, "Method not allowed", 405);
};

// Apply middleware and export (public endpoint - no auth)
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["GET"]),
    popularHandler
  )
);
