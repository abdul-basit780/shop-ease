// pages/api/customer/cart/[productId].ts
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
import { updateProduct, removeProduct } from "@/lib/controllers/cart";

// PUT: Update product quantity in cart
const updateCartHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  // Add productId from path to request body for controller
  req.body.productId = req.query.productId as string;

  const response = await updateProduct(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.cart, response.message, response.statusCode);
};

// DELETE: Remove product from cart
const removeFromCartHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  // Add productId from path to request body for controller
  req.body.productId = req.query.productId as string;

  const response = await removeProduct(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, response.cart, response.message, response.statusCode);
};

const cartItemHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "PUT":
      return updateCartHandler(req, res);
    case "DELETE":
      return removeFromCartHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["PUT", "DELETE"]),
    authenticate,
    customerOnly,
    cartItemHandler
  )
);