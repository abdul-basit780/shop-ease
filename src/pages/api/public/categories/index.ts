// pages/api/public/categories/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../../lib/utils/apiResponse";
import {
  allowMethods,
  rateLimit,
  composeMiddleware,
} from "../../../../lib/middleware/auth";
import { listCategories } from "@/lib/controllers/publicCategory";

// GET: List all categories (public, no auth)
const listCategoriesHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const response = await listCategories(req, res);

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

const categoriesHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return listCategoriesHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export (no authentication required)
export default asyncHandler(
  composeMiddleware(
    rateLimit(1000, 15 * 60 * 1000), // 1000 requests per 15 minutes (more generous for public)
    allowMethods(["GET"]),
    categoriesHandler
  )
);
