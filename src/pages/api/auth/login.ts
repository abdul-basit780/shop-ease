// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../lib/utils/apiResponse";
import { login } from "../../../lib/controllers/auth";

const loginHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  // Only allow POST method
  if (req.method !== "POST") {
    return sendError(res, "Method not allowed", 405);
  }

  const result = await login(req, res);

  if (!result.success) {
    return sendError(res, result.message, result.statusCode || 500);
  }
 
  result.statusCode = undefined;

  return sendSuccess(res, result, result.message);
};

export default asyncHandler(loginHandler);
