// pages/api/admin/patient/[id]/status.ts
import type { NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../../../lib/utils/apiResponse";
import {
  authenticate,
  adminOnly,
  allowMethods,
  rateLimit,
  composeMiddleware,
  AuthenticatedRequest,
} from "../../../../../lib/middleware/auth";
import { updateStatus } from "@/lib/controllers/customer";

// PATCH: Update customer status (block/unblock)
const updateCustomerStatusHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await updateStatus(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response, response.message, response.statusCode);
};

// Main handler
const customerStatusHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "PATCH":
      return updateCustomerStatusHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes
    allowMethods(["PATCH"]),
    authenticate,
    adminOnly,
    customerStatusHandler
  )
);
