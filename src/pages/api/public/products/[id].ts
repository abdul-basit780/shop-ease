// pages/api/public/products/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  sendSuccess,
  sendError,
  asyncHandler,
  handleOptions,
} from "../../../../lib/utils/apiResponse";
import {
  allowMethods,
  rateLimit,
  composeMiddleware,
} from "../../../../lib/middleware/auth";
import { getProduct } from "../../../../lib/controllers/publicProduct";

// GET: Get single product (public, no auth)
const getProductHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const response = await getProduct(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.product,
    response.message,
    response.statusCode
  );
};

const productHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return getProductHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export (no authentication required)
export default asyncHandler(
  composeMiddleware(
    rateLimit(1000, 15 * 60 * 1000), // 1000 requests per 15 minutes
    allowMethods(["GET"]),
    productHandler
  )
);
