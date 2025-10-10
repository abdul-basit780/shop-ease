// pages/api/admin/category/index.ts
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
import { index, store } from "@/lib/controllers/category";

// GET: Retrieve all categories with pagination and filtering
const getCategoriesHandler = async (
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
      categories: response.categories,
      pagination: response.pagination,
    },
    response.message,
    response.statusCode
  );
};

// POST: Create a new category
const createCategoryHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await store(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.category,
    response.message,
    response.statusCode
  );
};

const categoryHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getCategoriesHandler(req, res);
    case "POST":
      return createCategoryHandler(req, res);
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
    categoryHandler
  )
);
