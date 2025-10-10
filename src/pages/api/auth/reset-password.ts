// pages/api/auth/reset-password.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../lib/utils/apiResponse";
import { resetPassword } from "../../../lib/controllers/auth";

const resetPasswordHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "POST") return sendError(res, "Method not allowed", 405);

  const result = await resetPassword(req, res);

  if (!result.success) {
    return sendError(res, result.message, result.statusCode || 500);
  }

  result.statusCode = undefined;

  return sendSuccess(res, result, result.message);
};

export default asyncHandler(resetPasswordHandler);
