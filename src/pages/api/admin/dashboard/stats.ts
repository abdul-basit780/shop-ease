// pages/api/admin/dashboard/stats.ts
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
import { getDashboardStats } from "@/lib/controllers/adminDashboard";

// GET: Get dashboard overview statistics (Admin)
const adminGetDashboardStatsHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await getDashboardStats(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.data, response.message, response.statusCode);
};

const adminDashboardStatsHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return adminGetDashboardStatsHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(200, 15 * 60 * 1000), // 200 requests per 15 minutes
    allowMethods(["GET"]),
    authenticate,
    adminOnly,
    adminDashboardStatsHandler
  )
);
