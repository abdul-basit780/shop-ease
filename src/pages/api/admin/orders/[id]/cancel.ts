// pages/api/admin/orders/[id]/cancel.ts
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
import { adminCancelOrder } from "@/lib/controllers/adminOrder";

// POST: Cancel order (Admin)
const adminCancelOrderHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await adminCancelOrder(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  const responseData: any = { order: response.order };
  if (response.refundInfo) {
    responseData.refundInfo = response.refundInfo;
  }

  return sendSuccess(res, responseData, response.message, response.statusCode);
};

const adminOrderCancelHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    return sendError(res, "Invalid order ID", 400);
  }

  switch (req.method) {
    case "POST":
      return adminCancelOrderHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(200, 15 * 60 * 1000), // 200 requests per 15 minutes
    allowMethods(["POST"]),
    authenticate,
    adminOnly,
    adminOrderCancelHandler
  )
);
