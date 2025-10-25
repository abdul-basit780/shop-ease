// pages/api/admin/option-value/[id].ts
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
import { show, update, destroy } from "@/lib/controllers/optionValue";

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const getOptionValueHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await show(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.optionValue,
    response.message,
    response.statusCode
  );
};

const updateOptionValueHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await update(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.optionValue,
    response.message,
    response.statusCode
  );
};

const deleteOptionValueHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await destroy(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, null, response.message, response.statusCode);
};

const optionValueHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getOptionValueHandler(req, res);
    case "PUT":
    case "PATCH":
      return updateOptionValueHandler(req, res);
    case "DELETE":
      return deleteOptionValueHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

export default asyncHandler(
  composeMiddleware(
    rateLimit(100, 15 * 60 * 1000),
    allowMethods(["GET", "PUT", "PATCH", "DELETE"]),
    authenticate,
    adminOnly,
    optionValueHandler
  )
);
