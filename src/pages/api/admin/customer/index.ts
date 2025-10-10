// pages/api/admin/patient/index.ts
import type { NextApiResponse } from "next";
import {
  UserRole,
  Gender,
} from "../../../../lib/models/enums";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../../lib/utils/apiResponse";
import {
  authenticate,
  adminOnly,
  allowMethods,
  rateLimit,
  composeMiddleware,
  AuthenticatedRequest,
} from "../../../../lib/middleware/auth";
import { index } from "@/lib/controllers/customer";

const getCustomersHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await index(req, res);
  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response, response.message, response.statusCode);
};

// Main handler
const customerHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getCustomersHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(1000, 15 * 60 * 1000), // 100 requests per 15 minutes
    allowMethods(["GET"]),
    authenticate,
    adminOnly,
    customerHandler
  )
);
