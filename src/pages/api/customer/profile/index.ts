// pages/api/customer/profile/index.ts
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
import { getProfile, updateProfile } from "@/lib/controllers/profile";

// GET: Get customer's profile
const getProfileHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await getProfile(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.profile,
    response.message,
    response.statusCode
  );
};

// PUT: Update customer's profile
const updateProfileHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await updateProfile(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.profile,
    response.message,
    response.statusCode
  );
};

const profileHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getProfileHandler(req, res);
    case "PUT":
      return updateProfileHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["GET", "PUT"]),
    authenticate,
    customerOnly,
    profileHandler
  )
);
