// pages/api/customer/wishlist/index.ts
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
import {
  getWishlist,
  addProduct,
  removeProduct,
} from "@/lib/controllers/wishlist";

// GET: Get customer's wishlist with products
const getWishlistHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await getWishlist(req, res);

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

// POST: Add product to wishlist (or bulk add)
const addToWishlistHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await addProduct(req, res);

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

// DELETE: Remove specific product from wishlist
const removeProductHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
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

const wishlistHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getWishlistHandler(req, res);
    case "POST":
      return addToWishlistHandler(req, res);
    case "DELETE":
      return removeProductHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["GET", "POST", "DELETE"]),
    authenticate,
    customerOnly,
    wishlistHandler
  )
);
