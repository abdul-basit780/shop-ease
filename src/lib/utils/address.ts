// lib/utils/address.ts
import { IAddress } from "../models/Address";
import { isValidObjectId } from "mongoose";

export interface AddressResponse {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  customerId: string;
  fullAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddAddressRequest {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface UpdateAddressRequest {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

// Build address response
export const buildAddressResponse = (address: any): AddressResponse => {
  return {
    id: address._id.toString(),
    street: address.street,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    customerId: address.customerId.toString(),
    fullAddress: `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
};

// Validate address ID
export const validateAddressId = (addressId: string): string[] => {
  const errors: string[] = [];

  if (!addressId) {
    errors.push("Address ID is required");
  } else if (!isValidObjectId(addressId)) {
    errors.push("Invalid address ID format");
  }

  return errors;
};

// Validate address fields
export const validateAddressFields = (
  street?: string,
  city?: string,
  state?: string,
  zipCode?: string,
  isRequired: boolean = true
): string[] => {
  const errors: string[] = [];

  // Street validation
  if (isRequired && !street) {
    errors.push("Street is required");
  } else if (street !== undefined) {
    if (typeof street !== "string") {
      errors.push("Street must be a string");
    } else if (street.trim().length < 5) {
      errors.push("Street must be at least 5 characters");
    } else if (street.trim().length > 200) {
      errors.push("Street must not exceed 200 characters");
    }
  }

  // City validation
  if (isRequired && !city) {
    errors.push("City is required");
  } else if (city !== undefined) {
    if (typeof city !== "string") {
      errors.push("City must be a string");
    } else if (city.trim().length < 2) {
      errors.push("City must be at least 2 characters");
    } else if (city.trim().length > 100) {
      errors.push("City must not exceed 100 characters");
    }
  }

  // State validation
  if (isRequired && !state) {
    errors.push("State is required");
  } else if (state !== undefined) {
    if (typeof state !== "string") {
      errors.push("State must be a string");
    } else if (state.trim().length < 2) {
      errors.push("State must be at least 2 characters");
    } else if (state.trim().length > 100) {
      errors.push("State must not exceed 100 characters");
    }
  }

  // Zip code validation
  if (isRequired && !zipCode) {
    errors.push("Zip code is required");
  } else if (zipCode !== undefined) {
    if (typeof zipCode !== "string") {
      errors.push("Zip code must be a string");
    } else if (zipCode.trim().length < 3) {
      errors.push("Zip code must be at least 3 characters");
    } else if (zipCode.trim().length > 20) {
      errors.push("Zip code must not exceed 20 characters");
    }
  }

  return errors;
};

// Validate add address request
export const validateAddAddress = (
  street: string,
  city: string,
  state: string,
  zipCode: string
): string[] => {
  return validateAddressFields(street, city, state, zipCode, true);
};

// Validate update address request
export const validateUpdateAddress = (
  addressId: string,
  street?: string,
  city?: string,
  state?: string,
  zipCode?: string
): string[] => {
  const errors: string[] = [];

  // Validate address ID
  errors.push(...validateAddressId(addressId));

  // At least one field must be provided
  if (
    street === undefined &&
    city === undefined &&
    state === undefined &&
    zipCode === undefined
  ) {
    errors.push("At least one field must be provided for update");
  }

  // Validate provided fields
  errors.push(...validateAddressFields(street, city, state, zipCode, false));

  return errors;
};

// Address action response messages
export const ADDRESS_MESSAGES = {
  LIST_RETRIEVED: "Addresses retrieved successfully",
  ADDRESS_RETRIEVED: "Address retrieved successfully",
  ADDRESS_ADDED: "Address added successfully",
  ADDRESS_UPDATED: "Address updated successfully",
  ADDRESS_DELETED: "Address deleted successfully",
  ADDRESS_NOT_FOUND: "Address not found",
  NO_ADDRESSES: "No addresses found",
  UNAUTHORIZED_ACCESS: "You are not authorized to access this address",
};
