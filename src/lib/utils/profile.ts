// lib/utils/profile.ts
import { Gender } from "../models/enums";

export interface ProfileResponse {
  id: string;
  name: string;
  email: string;
  dob: Date;
  phone: string;
  gender: Gender;
  occupation?: string;
  isActive: boolean;
  isVerified: boolean;
  totalOrders: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileRequest {
  name?: string;
  dob?: string;
  phone?: string;
  gender?: Gender;
  occupation?: string;
}

// Build profile response
export const buildProfileResponse = (customer: any): ProfileResponse => {
  return {
    id: customer._id.toString(),
    name: customer.name,
    email: customer.email,
    dob: customer.dob,
    phone: customer.phone,
    gender: customer.gender,
    occupation: customer.occupation,
    isActive: customer.isActive,
    isVerified: customer.isVerified,
    totalOrders: customer.totalOrders || 0,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
};

// Validate profile update request
export const validateProfileUpdate = (data: UpdateProfileRequest): string[] => {
  const errors: string[] = [];

  // At least one field must be provided
  if (
    !data.name &&
    !data.dob &&
    !data.phone &&
    !data.gender &&
    data.occupation === undefined
  ) {
    errors.push("At least one field must be provided for update");
  }

  // Name validation
  if (data.name !== undefined) {
    if (typeof data.name !== "string") {
      errors.push("Name must be a string");
    } else if (data.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters");
    } else if (data.name.trim().length > 100) {
      errors.push("Name must not exceed 100 characters");
    }
  }

  // DOB validation
  if (data.dob !== undefined) {
    if (typeof data.dob !== "string") {
      errors.push("Date of birth must be a valid date string");
    } else {
      const dobDate = new Date(data.dob);
      if (isNaN(dobDate.getTime())) {
        errors.push("Date of birth must be a valid date");
      } else {
        // Check if date is not in the future
        if (dobDate > new Date()) {
          errors.push("Date of birth cannot be in the future");
        }
        // Check minimum age (e.g., 13 years old)
        const minAge = 13;
        const today = new Date();
        const minBirthDate = new Date(
          today.getFullYear() - minAge,
          today.getMonth(),
          today.getDate()
        );
        if (dobDate > minBirthDate) {
          errors.push(`You must be at least ${minAge} years old`);
        }
        // Check maximum age (e.g., 120 years old)
        const maxAge = 120;
        const maxBirthDate = new Date(
          today.getFullYear() - maxAge,
          today.getMonth(),
          today.getDate()
        );
        if (dobDate < maxBirthDate) {
          errors.push("Invalid date of birth");
        }
      }
    }
  }

  // Phone validation
  if (data.phone !== undefined) {
    if (typeof data.phone !== "string") {
      errors.push("Phone must be a string");
    } else if (data.phone.trim().length < 10) {
      errors.push("Phone must be at least 10 characters");
    } else if (data.phone.trim().length > 20) {
      errors.push("Phone must not exceed 20 characters");
    } else if (!/^[0-9+\-\s()]+$/.test(data.phone)) {
      errors.push(
        "Phone must contain only numbers and valid characters (+, -, space, parentheses)"
      );
    }
  }

  // Gender validation
  if (data.gender !== undefined) {
    if (!Object.values(Gender).includes(data.gender)) {
      errors.push(`Gender must be one of: ${Object.values(Gender).join(", ")}`);
    }
  }

  // Occupation validation (optional field)
  if (
    data.occupation !== undefined &&
    data.occupation !== null &&
    data.occupation !== ""
  ) {
    if (typeof data.occupation !== "string") {
      errors.push("Occupation must be a string");
    } else if (data.occupation.trim().length > 100) {
      errors.push("Occupation must not exceed 100 characters");
    }
  }

  return errors;
};

// Profile action response messages
export const PROFILE_MESSAGES = {
  RETRIEVED: "Profile retrieved successfully",
  UPDATED: "Profile updated successfully",
  PHONE_EXISTS: "Phone number already exists",
};
