// pages/api/admin/orders/index.ts
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
import { adminListOrders } from "@/lib/controllers/adminOrder";

// GET: Get all orders with filters (Admin)
const adminGetOrdersHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await adminListOrders(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    {
      orders: response.orders,
      stats: response.stats,
      pagination: response.pagination,
    },
    response.message,
    response.statusCode
  );
};

const adminOrdersHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return adminGetOrdersHandler(req, res);
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
    adminOrdersHandler
  )
);
