// pages/api/customer/wishlist/[productId].ts
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
import { removeProduct } from "@/lib/controllers/wishlist";

// DELETE: Remove specific product from wishlist
const removeProductHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  // Set productId from URL parameter to body for controller
  req.body = { productId: req.query.productId };

  const response = await removeProduct(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.wishlist,
    response.message,
    response.statusCode
  );
};

const wishlistProductHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "DELETE":
      return removeProductHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(200, 15 * 60 * 1000), // 200 requests per 15 minutes
    allowMethods(["GET", "DELETE"]),
    authenticate,
    customerOnly,
    wishlistProductHandler
  )
);
