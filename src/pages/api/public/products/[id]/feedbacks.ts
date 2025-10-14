// pages/api/public/products/[id]/feedbacks.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "@/lib/utils/apiResponse";
import {
  allowMethods,
  rateLimit,
  composeMiddleware,
} from "@/lib/middleware/auth";
import { getProductFeedbacks } from "@/lib/controllers/feedback";

// GET: Get feedbacks for a product (Public)
const getProductFeedbacksHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { id } = req.query;

  if (typeof id !== "string") {
    return sendError(res, "Invalid product ID", 400);
  }

  const response = await getProductFeedbacks(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    {
      feedbacks: response.data,
      stats: response.stats,
      pagination: response.pagination,
    },
    response.message,
    response.statusCode
  );
};

const productFeedbacksHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getProductFeedbacksHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export (no authentication required for public route)
export default asyncHandler(
  composeMiddleware(
    rateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes for public
    allowMethods(["GET"]),
    productFeedbacksHandler
  )
);
