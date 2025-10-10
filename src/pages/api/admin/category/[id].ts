// pages/api/admin/category/[id].ts
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
import {
  show,
  update,
  destroy,
  restore,
  permanentDestroy,
} from "@/lib/controllers/category";

// GET: Retrieve a specific category
const getCategoryHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await show(req, res);

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

// PUT/PATCH: Update a specific category
const updateCategoryHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await update(req, res);

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

// DELETE: Soft delete a specific category
const deleteCategoryHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  // Check if it's a permanent delete request
  const isPermanent = req.query.permanent === "true";

  const response = isPermanent
    ? await permanentDestroy(req, res)
    : await destroy(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, null, response.message, response.statusCode);
};

// POST: Restore a soft-deleted category
const restoreCategoryHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await restore(req, res);

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

// Main handler that routes to appropriate method handler
const categoryHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  // Handle restore action separately
  if (req.method === "POST" && req.query.action === "restore") {
    return restoreCategoryHandler(req, res);
  }

  switch (req.method) {
    case "GET":
      return getCategoryHandler(req, res);
    case "PUT":
    case "PATCH":
      return updateCategoryHandler(req, res);
    case "DELETE":
      return deleteCategoryHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes
    allowMethods(["GET", "PUT", "PATCH", "DELETE", "POST"]),
    authenticate,
    adminOnly,
    categoryHandler
  )
);
