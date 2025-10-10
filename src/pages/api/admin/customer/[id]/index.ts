// pages/api/admin/patient/[id]/index.ts
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
import { show } from "@/lib/controllers/customer";

// GET: Retrieve single customer by ID
const getCustomerHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await show(req, res);
  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response, response.message, response.statusCode);
};

// Main handler
const singleCustomerHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getCustomerHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes
    allowMethods(["GET"]),
    authenticate,
    adminOnly,
    singleCustomerHandler
  )
);
