// lib/controllers/address.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { Address } from "../models/Address";
import connectToDatabase from "../db/mongodb";
import mongoose from "mongoose";
import {
  buildAddressResponse,
  validateAddAddress,
  validateUpdateAddress,
  validateAddressId,
  ADDRESS_MESSAGES,
  AddressResponse,
  AddAddressRequest,
  UpdateAddressRequest,
} from "../utils/address";

interface Response {
  success: boolean;
  message: string;
  addresses?: AddressResponse[];
  address?: AddressResponse;
  statusCode: number | undefined;
}

// Get all addresses for the customer
export const listAddresses = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const addressResponse: Response = {
    success: false,
    message: "",
    addresses: [],
    statusCode: 500,
  };

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    const addresses = await Address.find({ customerId })
      .sort({ createdAt: -1 })
      .exec();

    addressResponse.addresses = addresses.map(buildAddressResponse);
    addressResponse.success = true;
    addressResponse.message =
      addresses.length > 0
        ? ADDRESS_MESSAGES.LIST_RETRIEVED
        : ADDRESS_MESSAGES.NO_ADDRESSES;
    addressResponse.statusCode = 200;

    return addressResponse;
  } catch (err) {
    console.error("List addresses error:", err);
    addressResponse.message = "Internal server error";
    addressResponse.statusCode = 500;
    return addressResponse;
  }
};

// Add new address
export const addAddress = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const addressResponse: Response = {
    success: false,
    message: "",
    address: undefined,
    statusCode: 500,
  };

  const { street, city, state, zipCode }: AddAddressRequest = req.body;

  // Validate request
  const validationErrors = validateAddAddress(street, city, state, zipCode);
  if (validationErrors.length > 0) {
    addressResponse.message = validationErrors.join(", ");
    addressResponse.statusCode = 400;
    return addressResponse;
  }

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Create new address
    const newAddress = await Address.create({
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zipCode: zipCode.trim(),
      customerId,
    });

    addressResponse.address = buildAddressResponse(newAddress);
    addressResponse.success = true;
    addressResponse.message = ADDRESS_MESSAGES.ADDRESS_ADDED;
    addressResponse.statusCode = 201;

    return addressResponse;
  } catch (err) {
    console.error("Add address error:", err);
    addressResponse.message = "Internal server error";
    addressResponse.statusCode = 500;
    return addressResponse;
  }
};

// Update address
export const updateAddress = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const addressResponse: Response = {
    success: false,
    message: "",
    address: undefined,
    statusCode: 500,
  };

  // addressId comes from path parameter (set in route handler)
  const addressId = req.body.addressId as string;
  const { street, city, state, zipCode }: UpdateAddressRequest = req.body;

  // Validate request
  const validationErrors = validateUpdateAddress(
    addressId,
    street,
    city,
    state,
    zipCode
  );
  if (validationErrors.length > 0) {
    addressResponse.message = validationErrors.join(", ");
    addressResponse.statusCode = 400;
    return addressResponse;
  }

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Check if address exists and belongs to customer
    const existingAddress = await Address.findOne({
      _id: addressId,
      customerId,
    });

    if (!existingAddress) {
      addressResponse.message = ADDRESS_MESSAGES.ADDRESS_NOT_FOUND;
      addressResponse.statusCode = 404;
      return addressResponse;
    }

    // Build update object
    const updateData: any = {};
    if (street !== undefined) updateData.street = street.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (state !== undefined) updateData.state = state.trim();
    if (zipCode !== undefined) updateData.zipCode = zipCode.trim();

    // Update address
    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      updateData,
      { new: true, runValidators: true }
    );

    addressResponse.address = buildAddressResponse(updatedAddress!);
    addressResponse.success = true;
    addressResponse.message = ADDRESS_MESSAGES.ADDRESS_UPDATED;
    addressResponse.statusCode = 200;

    return addressResponse;
  } catch (err) {
    console.error("Update address error:", err);
    addressResponse.message = "Internal server error";
    addressResponse.statusCode = 500;
    return addressResponse;
  }
};

// Delete address
export const deleteAddress = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const addressResponse: Response = {
    success: false,
    message: "",
    address: undefined,
    statusCode: 500,
  };

  // addressId comes from path parameter (set in route handler)
  const addressId = req.body.addressId as string;

  // Validate address ID
  const validationErrors = validateAddressId(addressId);
  if (validationErrors.length > 0) {
    addressResponse.message = validationErrors.join(", ");
    addressResponse.statusCode = 400;
    return addressResponse;
  }

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Check if address exists and belongs to customer
    const address = await Address.findOne({
      _id: addressId,
      customerId,
    });

    if (!address) {
      addressResponse.message = ADDRESS_MESSAGES.ADDRESS_NOT_FOUND;
      addressResponse.statusCode = 404;
      return addressResponse;
    }

    // Delete address
    await Address.findByIdAndDelete(addressId);

    addressResponse.success = true;
    addressResponse.message = ADDRESS_MESSAGES.ADDRESS_DELETED;
    addressResponse.statusCode = 200;

    return addressResponse;
  } catch (err) {
    console.error("Delete address error:", err);
    addressResponse.message = "Internal server error";
    addressResponse.statusCode = 500;
    return addressResponse;
  }
};
