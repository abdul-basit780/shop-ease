// pages/api/admin/option-value/index.ts
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
import { index, store } from "@/lib/controllers/optionValue";

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const getOptionValuesHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await index(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    { optionValues: response.optionValues },
    response.message,
    response.statusCode
  );
};

const createOptionValueHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await store(req, res);

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

const optionValueHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getOptionValuesHandler(req, res);
    case "POST":
      return createOptionValueHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

export default asyncHandler(
  composeMiddleware(
    rateLimit(100, 15 * 60 * 1000),
    allowMethods(["GET", "POST"]),
    authenticate,
    adminOnly,
    optionValueHandler
  )
);
