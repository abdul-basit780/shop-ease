// pages/api/customer/address/[id].ts
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
import { updateAddress, deleteAddress } from "@/lib/controllers/address";

// PUT: Update address
const updateAddressHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  // Add addressId from path to request body for controller
  req.body.addressId = req.query.id as string;

  const response = await updateAddress(req, res);

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

// DELETE: Delete address
const deleteAddressHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  // Add addressId from path to request body for controller
  req.body.addressId = req.query.id as string;

  const response = await deleteAddress(req, res);

  if (!response.success) {
    return sendError(res, response.message, response.statusCode);
  }

  return sendSuccess(res, null, response.message, response.statusCode);
};

const addressIdHandler = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  if (req.method === "OPTIONS") {
    return handleOptions(res);
  }

  switch (req.method) {
    case "PUT":
      return updateAddressHandler(req, res);
    case "DELETE":
      return deleteAddressHandler(req, res);
    default:
      return sendError(res, "Method not allowed", 405);
  }
};

// Apply middleware and export
export default asyncHandler(
  composeMiddleware(
    rateLimit(200, 15 * 60 * 1000), // 200 requests per 15 minutes
    allowMethods(["PUT", "DELETE"]),
    authenticate,
    customerOnly,
    addressIdHandler
  )
);
