// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
} from "../../lib/utils/apiResponse";
import { sendWelcomeEmail } from "@/lib/utils/auth";
const testHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return sendError(res, "Method not allowed", 405);
  }

  sendWelcomeEmail({
    name: "Abdul Basit",
    email: "abdulbasit780@hotmail.com",
  });

  sendSuccess(res, [], "Test successful", 200);
};

export default asyncHandler(testHandler);
