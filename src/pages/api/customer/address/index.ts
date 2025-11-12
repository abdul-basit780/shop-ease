// pages/api/customer/address/index.ts
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
import { listAddresses, addAddress } from "@/lib/controllers/address";

// GET: List all addresses for the customer
const listAddressesHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await listAddresses(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.addresses,
    response.message,
    response.statusCode
  );
};

// POST: Add new address
const addAddressHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  const response = await addAddress(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(
    res,
    response.address,
    response.message,
    response.statusCode
  );
};

const addressHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "GET":
      return listAddressesHandler(req, res);
    case "POST":
      return addAddressHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(15000, 15 * 60 * 1000), // 15000 requests per 15 minutes
    allowMethods(["GET", "POST"]),
    authenticate,
    customerOnly,
    addressHandler
  )
);
