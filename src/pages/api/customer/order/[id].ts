// pages/api/customer/order/[id].ts
import type { NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../../lib/utils/apiResponse";
import {
  authenticate,
  customerOnly,
  allowMethods,
  rateLimit,
  composeMiddleware,
  AuthenticatedRequest,
} from "../../../../lib/middleware/auth";
import { getOrder, cancelOrder, confirmPayment } from "@/lib/controllers/order";

// GET: Get single order
const getOrderHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await getOrder(req, res);

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

// PATCH: Cancel order or confirm payment
const patchOrderHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  // Check if this is a payment confirmation request
  if (req.body?.action === "confirmPayment") {
    const response = await confirmPayment(req, res);
    if (!response.success) {
      return sendError(res, response.message, response.statusCode);
    }
    return sendSuccess(res, response.order, response.message, response.statusCode);
  }

  // Otherwise, it's a cancel order request
  const response = await cancelOrder(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  const responseData: any = { order: response.order };
  if (response.refundInfo) {
    responseData.refundInfo = response.refundInfo;
  }

  return sendSuccess(res, responseData, response.message, response.statusCode);
};

const orderIdHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getOrderHandler(req, res);
    case "PATCH":
      return patchOrderHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes
    allowMethods(["GET", "PATCH"]),
    authenticate,
    customerOnly,
    orderIdHandler
  )
);
