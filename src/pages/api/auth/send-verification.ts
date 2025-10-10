// pages/api/auth/send-verification.ts
import type { NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../lib/utils/apiResponse";
import {
  authenticate,
  allowMethods,
  rateLimit,
  composeMiddleware,
  AuthenticatedRequest,
  customerOnly,
} from "../../../lib/middleware/auth";
import { sendVerification } from "../../../lib/controllers/auth";

const sendVerificationHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "POST") return sendError(res, "Method not allowed", 405);

  const result = await sendVerification(req, res);

  if (!result.success) {
    return sendError(res, result.message, result.statusCode || 500);
  }

  result.statusCode = undefined;

  return sendSuccess(res, result, result.message);
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes
    allowMethods(["POST"]),
    authenticate,
    customerOnly,
    sendVerificationHandler
  )
);
