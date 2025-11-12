// pages/api/customer/order/index.ts
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
import { createOrder, listOrders } from "@/lib/controllers/order";

// POST: Create order from cart
const createOrderHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await createOrder(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  const responseData: any = { order: response.order };
  if (response.clientSecret) {
    responseData.clientSecret = response.clientSecret;
  }

  return sendSuccess(res, responseData, response.message, response.statusCode);
};

// GET: List customer orders
const listOrdersHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await listOrders(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    {
      orders: response.orders,
      pagination: response.pagination,
    },
    response.message,
    response.statusCode
  );
};

const orderHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return listOrdersHandler(req, res);
    case "POST":
      return createOrderHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["GET", "POST"]),
    authenticate,
    customerOnly,
    orderHandler
  )
);
