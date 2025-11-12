// pages/api/customer/feedback/index.ts
import type { NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "@/lib/utils/apiResponse";
import {
  authenticate,
  customerOnly,
  allowMethods,
  rateLimit,
  composeMiddleware,
  AuthenticatedRequest,
} from "@/lib/middleware/auth";
import { createFeedback, getMyFeedbacks } from "@/lib/controllers/feedback";

// GET: Get customer's own feedbacks
const getMyFeedbacksHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await getMyFeedbacks(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.data,
    response.message,
    response.statusCode
  );
};

// POST: Create feedback
const createFeedbackHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await createFeedback(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.data, response.message, response.statusCode);
};

const feedbackHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getMyFeedbacksHandler(req, res);
    case "POST":
      return createFeedbackHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["GET", "POST"]),
    authenticate,
    customerOnly,
    feedbackHandler
  )
);
