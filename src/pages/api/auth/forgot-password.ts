// pages/api/auth/forgot-password.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../lib/utils/apiResponse";
import { forgotPassword } from "@/lib/controllers/auth";

interface ForgotPasswordRequest {
  email: string;
}

const forgotPasswordHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") return handleOptions(res);
  if (req.method !== "POST") return sendError(res, "Method not allowed", 405);

  const result = await forgotPassword(req, res);

  if (!result.success) {
    return sendError(res, result.message, result.statusCode || 500);
  }

  result.statusCode = undefined;

  return sendSuccess(res, result, result.message);
};

export default asyncHandler(forgotPasswordHandler);
