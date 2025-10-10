// pages/api/auth/change-password.ts
import type { NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../lib/utils/apiResponse";
import {
  allowMethods,
  authenticate,
  AuthenticatedRequest,
  composeMiddleware,
  rateLimit,
} from "../../../lib/middleware/auth";
import { changePassword } from "@/lib/controllers/auth";



const changePasswordHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "POST") return sendError(res, "Method not allowed", 405);

  const changePasswordResponse = await changePassword(req, res);

  if (!changePasswordResponse.success) {
    return sendError(res, changePasswordResponse.message, changePasswordResponse.statusCode);
  }

  changePasswordResponse.statusCode = undefined;
  return sendSuccess(res, {}, changePasswordResponse.message, changePasswordResponse.statusCode);
};

export default asyncHandler(
  composeMiddleware(
    rateLimit(100, 15 * 60 * 1000), // 100 requests per 15 minutes
    allowMethods(["POST"]),
    authenticate,
    changePasswordHandler
  )
);
