// pages/api/admin/option-type/index.ts
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
import { index, store } from "@/lib/controllers/optionType";

const getOptionTypesHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await index(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    { optionTypes: response.optionTypes },
    response.message,
    response.statusCode
  );
};

const createOptionTypeHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await store(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.optionType,
    response.message,
    response.statusCode
  );
};

const optionTypeHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getOptionTypesHandler(req, res);
    case "POST":
      return createOptionTypeHandler(req, res);
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
    optionTypeHandler
  )
);
