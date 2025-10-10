// pages/api/auth/me.ts
import { NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../lib/utils/apiResponse";
import {
  allowMethods,
  authenticate,
  AuthenticatedRequest,
  composeMiddleware,
  rateLimit,
} from "../../../lib/middleware/auth";
import { me } from "@/lib/controllers/auth";

const meHandler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  // Only allow GET method
  if (req.method !== "GET") {
    return sendError(res, "Method not allowed", 405);
  }

  const meResponse = await me(req, res);

  if (!meResponse.success) {
    return sendError(res, meResponse.message, meResponse.statusCode || 500);
  }

  meResponse.statusCode = undefined;

  return sendSuccess(res, meResponse, meResponse.message);
};

export default asyncHandler(
  composeMiddleware(
    rateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes
    allowMethods(["GET"]),
    authenticate,
    meHandler
  )
);
