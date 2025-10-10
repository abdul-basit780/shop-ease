// pages/api/admin/product/index.ts
import type { NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../../lib/utils/apiResponse";
import {
  authenticate,
  adminOnly,
  allowMethods,
  rateLimit,
  composeMiddleware,
  AuthenticatedRequest,
} from "../../../../lib/middleware/auth";
import { index, store } from "@/lib/controllers/product";

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// GET: Retrieve all products with pagination and filtering
const getProductsHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await index(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    {
      products: response.products,
      pagination: response.pagination,
    },
    response.message,
    response.statusCode
  );
};

// POST: Create a new product with image upload
const createProductHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await store(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.product,
    response.message,
    response.statusCode
  );
};

const productHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getProductsHandler(req, res);
    case "POST":
      return createProductHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(1000, 15 * 60 * 1000), // 1000 requests per 15 minutes
    allowMethods(["GET", "POST"]),
    authenticate,
    adminOnly,
    productHandler
  )
);
