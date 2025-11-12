// pages/api/customer/cart/index.ts
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
import { getCart, addProduct } from "@/lib/controllers/cart";

// GET: Get customer's cart with products
const getCartHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await getCart(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.cart, response.message, response.statusCode);
};

// POST: Add product to cart
const addToCartHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await addProduct(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.cart, response.message, response.statusCode);
};

const cartHandler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getCartHandler(req, res);
    case "POST":
      return addToCartHandler(req, res);
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
    cartHandler
  )
);
