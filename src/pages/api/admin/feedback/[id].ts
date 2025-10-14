// pages/api/admin/feedback/[id].ts
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
import { adminShow, adminDestroy } from "@/lib/controllers/adminFeedback";

// GET: Get single feedback (Admin)
const adminGetFeedbackHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await adminShow(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.data, response.message, response.statusCode);
};

// DELETE: Delete feedback (Admin)
const adminDeleteFeedbackHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await adminDestroy(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, null, response.message, response.statusCode);
};

const adminFeedbackByIdHandler = async (
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
    case "GET":
      return adminGetFeedbackHandler(req, res);
    case "DELETE":
      return adminDeleteFeedbackHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(200, 15 * 60 * 1000), // 200 requests per 15 minutes
    allowMethods(["GET", "DELETE"]),
    authenticate,
    adminOnly,
    adminFeedbackByIdHandler
  )
);
