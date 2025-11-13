// pages/api/public/contact.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../lib/utils/apiResponse";
import {
  allowMethods,
  rateLimit,
  composeMiddleware,
} from "../../../lib/middleware/auth";
import { postContact } from "@/lib/controllers/contact";

const postContactHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const response = await postContact(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    [],
    response.message,
    response.statusCode
  );

  
};

const contactHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "POST":
      return postContactHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export (no authentication required)
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["POST"]),
    contactHandler
  )
);
