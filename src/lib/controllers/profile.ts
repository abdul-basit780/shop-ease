// lib/controllers/profile.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { Customer } from "../models/Customer";
import connectToDatabase from "../db/mongodb";
import mongoose from "mongoose";
import {
  buildProfileResponse,
  validateProfileUpdate,
  PROFILE_MESSAGES,
  ProfileResponse,
  UpdateProfileRequest,
} from "../utils/profile";

interface Response {
  success: boolean;
  message: string;
  profile?: ProfileResponse;
  statusCode: number | undefined;
}

// Get customer's profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const profileResponse: Response = {
    success: false,
    message: "",
    profile: undefined,
    statusCode: 500,
  };

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    const customer = await Customer.findById(customerId);

    if (!customer) {
      profileResponse.message = "Customer not found";
      profileResponse.statusCode = 404;
      return profileResponse;
    }

    profileResponse.profile = buildProfileResponse(customer);
    profileResponse.success = true;
    profileResponse.message = PROFILE_MESSAGES.RETRIEVED;
    profileResponse.statusCode = 200;

    return profileResponse;
  } catch (err) {
    console.error("Get profile error:", err);
    profileResponse.message = "Internal server error";
    profileResponse.statusCode = 500;
    return profileResponse;
  }
};

// Update customer's profile
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const profileResponse: Response = {
    success: false,
    message: "",
    profile: undefined,
    statusCode: 500,
  };

  const { name, dob, phone, gender, occupation }: UpdateProfileRequest =
    req.body;

  // Validate request
  const validationErrors = validateProfileUpdate({
    name,
    dob,
    phone,
    gender,
    occupation,
  });

  if (validationErrors.length > 0) {
    profileResponse.message = validationErrors.join(", ");
    profileResponse.statusCode = 400;
    return profileResponse;
  }

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Check if customer exists
    const existingCustomer = await Customer.findById(customerId);

    if (!existingCustomer) {
      profileResponse.message = "Customer not found";
      profileResponse.statusCode = 404;
      return profileResponse;
    }

    // Check if phone is being updated and if it already exists for another customer
    if (phone && phone !== existingCustomer.phone) {
      const phoneExists = await Customer.findOne({
        phone: phone.trim(),
        _id: { $ne: customerId },
      });

      if (phoneExists) {
        profileResponse.message = PROFILE_MESSAGES.PHONE_EXISTS;
        profileResponse.statusCode = 409;
        return profileResponse;
      }
    }

    // Build update object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (dob !== undefined) updateData.dob = new Date(dob);
    if (phone !== undefined) updateData.phone = phone.trim();
    if (gender !== undefined) updateData.gender = gender;
    if (occupation !== undefined) {
      // Allow empty string to clear occupation
      updateData.occupation = occupation.trim() || null;
    }

    // Update profile
    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      profileResponse.message = "Failed to update profile";
      profileResponse.statusCode = 500;
      return profileResponse;
    }

    profileResponse.profile = buildProfileResponse(updatedCustomer);
    profileResponse.success = true;
    profileResponse.message = PROFILE_MESSAGES.UPDATED;
    profileResponse.statusCode = 200;

    return profileResponse;
  } catch (err) {
    console.error("Update profile error:", err);
    profileResponse.message = "Internal server error";
    profileResponse.statusCode = 500;
    return profileResponse;
  }
};
