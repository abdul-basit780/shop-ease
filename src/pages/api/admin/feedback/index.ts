// pages/api/admin/feedback/index.ts
import type { NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "@/lib/utils/apiResponse";
import {
  authenticate,
  adminOnly,
  allowMethods,
  rateLimit,
  composeMiddleware,
  AuthenticatedRequest,
} from "@/lib/middleware/auth";
import { adminIndex } from "@/lib/controllers/adminFeedback";

// GET: Get all feedbacks with filters (Admin)
const adminGetFeedbacksHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await adminIndex(req, res);

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

const adminFeedbackHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return adminGetFeedbacksHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["GET"]),
    authenticate,
    adminOnly,
    adminFeedbackHandler
  )
);
