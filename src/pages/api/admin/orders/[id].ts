// pages/api/admin/orders/[id].ts
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
import {
  adminGetOrder,
  adminUpdateOrderStatus,
} from "@/lib/controllers/adminOrder";

// GET: Get single order (Admin)
const adminGetOrderHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await adminGetOrder(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.order,
    response.message,
    response.statusCode
  );
};

// PUT: Update order status (Admin)
const adminUpdateOrderStatusHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await adminUpdateOrderStatus(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.order,
    response.message,
    response.statusCode
  );
};

const adminOrderByIdHandler = async (
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
    case "GET":
      return adminGetOrderHandler(req, res);
    case "PUT":
      return adminUpdateOrderStatusHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["GET", "PUT"]),
    authenticate,
    adminOnly,
    adminOrderByIdHandler
  )
);
