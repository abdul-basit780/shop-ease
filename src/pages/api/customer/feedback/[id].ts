// pages/api/customer/feedback/[id].ts
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
import { updateMyFeedback, deleteMyFeedback } from "@/lib/controllers/feedback";

// PUT: Update customer's own feedback
const updateMyFeedbackHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await updateMyFeedback(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.data, response.message, response.statusCode);
};

// DELETE: Delete customer's own feedback
const deleteMyFeedbackHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await deleteMyFeedback(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, null, response.message, response.statusCode);
};

const feedbackByIdHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    return sendError(res, "Invalid feedback ID", 400);
  }

  switch (req.method) {
    case "PUT":
      return updateMyFeedbackHandler(req, res);
    case "DELETE":
      return deleteMyFeedbackHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["PUT", "DELETE"]),
    authenticate,
    customerOnly,
    feedbackByIdHandler
  )
);
