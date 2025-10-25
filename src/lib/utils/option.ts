// lib/utils/option.ts
import { IOptionValue } from "../models/OptionValue";
import { IOptionType } from "../models/OptionType";
import { isValidObjectId } from "mongoose";

export interface OptionValueResponse {
  id: string;
  optionTypeId: string;
  optionTypeName?: string;
  productId?: string;
  value: string;
  img: string;
  price: number;
  stock: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OptionValueRequest {
  optionTypeId: string;
  value: string;
  img?: string; // Optional in request, handled by file upload
  price: number;
  stock: number;
}

export interface OptionTypeResponse {
  id: string;
  productId: string;
  name: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OptionTypeRequest {
  productId: string;
  name: string;
}

// Build option value response
export const buildOptionValueResponse = (
  optionValue: IOptionValue | any
): OptionValueResponse => {
  return {
    id: optionValue._id.toString(),
    optionTypeId:
      optionValue.optionTypeId?._id?.toString() ||
      optionValue.optionTypeId?.toString(),
    optionTypeName: optionValue.optionTypeId?.name || undefined,
    productId: optionValue.optionTypeId?.productId?.toString() || undefined,
    value: optionValue.value,
    img: optionValue.img,
    price: optionValue.price,
    stock: optionValue.stock,
    deletedAt: optionValue.deletedAt,
    createdAt: optionValue.createdAt,
    updatedAt: optionValue.updatedAt,
  };
};

// Build option type response
export const buildOptionTypeResponse = (
  optionType: IOptionType | any
): OptionTypeResponse => {
  return {
    id: optionType._id.toString(),
    productId:
      optionType.productId?._id?.toString() || optionType.productId?.toString(),
    name: optionType.name,
    deletedAt: optionType.deletedAt,
    createdAt: optionType.createdAt,
    updatedAt: optionType.updatedAt,
  };
};

// Validate option value request
export const validateOptionValueRequest = (
  data: OptionValueRequest | Partial<OptionValueRequest>,
  isUpdate: boolean = false
): string[] => {
  const errors: string[] = [];

  // Option Type ID validation
  if (!isUpdate || data.optionTypeId !== undefined) {
    if (!data.optionTypeId) {
      if (!isUpdate) errors.push("Option type ID is required");
    } else if (!isValidObjectId(data.optionTypeId)) {
      errors.push("Invalid option type ID");
    }
  }

  // Value validation
  if (!isUpdate || data.value !== undefined) {
    if (!data.value || data.value.trim().length === 0) {
      if (!isUpdate) errors.push("Value is required");
    } else if (data.value.length < 1) {
      errors.push("Value must be at least 1 character long");
    } else if (data.value.length > 100) {
      errors.push("Value must not exceed 100 characters");
    }
  }

  // Price validation
  if (!isUpdate || data.price !== undefined) {
    if (data.price !== undefined && data.price !== null) {
      if (typeof data.price !== "number" || isNaN(data.price)) {
        errors.push("Price must be a valid number");
      } else if (data.price < 0) {
        errors.push("Price cannot be negative");
      } else if (data.price > 999999.99) {
        errors.push("Price cannot exceed 999999.99");
      }
    }
  }

  // Stock validation
  if (!isUpdate || data.stock !== undefined) {
    if (data.stock !== undefined && data.stock !== null) {
      if (!Number.isInteger(data.stock)) {
        errors.push("Stock must be a whole number");
      } else if (data.stock < 0) {
        errors.push("Stock cannot be negative");
      } else if (data.stock > 999999) {
        errors.push("Stock cannot exceed 999999");
      }
    }
  }

  return errors;
};

// Validate option type request
export const validateOptionTypeRequest = (
  data: OptionTypeRequest,
  isUpdate: boolean = false
): string[] => {
  const errors: string[] = [];

  // Product ID validation
  if (!isUpdate || data.productId !== undefined) {
    if (!data.productId) {
      if (!isUpdate) errors.push("Product ID is required");
    } else if (!isValidObjectId(data.productId)) {
      errors.push("Invalid product ID");
    }
  }

  // Name validation
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      if (!isUpdate) errors.push("Name is required");
    } else if (data.name.length < 2) {
      errors.push("Name must be at least 2 characters long");
    } else if (data.name.length > 100) {
      errors.push("Name must not exceed 100 characters");
    }
  }

  return errors;
};

// Validate image file
export const validateImageFile = (file: any): string[] => {
  const errors: string[] = [];

  if (!file) {
    return errors; // Image is optional for updates
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

  // Check file size
  if (file.size > MAX_SIZE) {
    errors.push(`Image size must not exceed ${MAX_SIZE / 1024 / 1024}MB`);
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push(`Image must be one of: ${ALLOWED_EXTENSIONS.join(", ")}`);
  }

  return errors;
};
