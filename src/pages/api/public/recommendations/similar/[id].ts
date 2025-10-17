// pages/api/customer/recommendations/similar/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../../../lib/utils/apiResponse";
import {
  allowMethods,
  rateLimit,
  composeMiddleware,
} from "../../../../../lib/middleware/auth";
import { getSimilarProducts } from "../../../../../lib/controllers/publicRecommendation";

// GET: Get similar products
const getSimilarProductsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const response = await getSimilarProducts(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.data, response.message, response.statusCode);
};

const similarHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  if (req.method === "GET") {
    return getSimilarProductsHandler(req, res);
  }

  return sendError(res, "Method not allowed", 405);
};

// Apply middleware and export (public endpoint - no auth)
export default asyncHandler(
  composeMiddleware(
    rateLimit(200, 15 * 60 * 1000), // 200 requests per 15 minutes
    allowMethods(["GET"]),
    similarHandler
  )
);
