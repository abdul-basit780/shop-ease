// lib/utils/option.ts
import { IOptionType } from "../models/OptionType";
import { IOptionValue } from "../models/OptionValue";

// ========== Option Type ==========
export interface OptionTypeRequest {
  productId: string;
  name: string;
}

export interface OptionTypeResponse {
  id: string;
  productId: string;
  productName?: string;
  name: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const buildOptionTypeResponse = (
  optionType: IOptionType | any
): OptionTypeResponse => {
  return {
    id: optionType._id.toString(),
    productId:
      optionType.productId?._id?.toString() || optionType.productId?.toString(),
    productName: optionType.productId?.name,
    name: optionType.name,
    deletedAt: optionType.deletedAt,
    createdAt: optionType.createdAt,
    updatedAt: optionType.updatedAt,
  };
};

export const validateOptionTypeRequest = (
  data: OptionTypeRequest
): string[] => {
  const errors: string[] = [];

  if (!data.productId || data.productId.trim().length === 0) {
    errors.push("Product ID is required");
  }

  if (!data.name || data.name.trim().length === 0) {
    errors.push("Name is required");
  } else if (data.name.length > 50) {
    errors.push("Name must not exceed 50 characters");
  }

  return errors;
};

// ========== Option Value ==========
export interface OptionValueRequest {
  optionTypeId: string;
  value: string;
  price?: number;
  stock?: number;
}

export interface OptionValueResponse {
  id: string;
  optionTypeId: string;
  optionTypeName?: string;
  value: string;
  price: number;
  stock: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const buildOptionValueResponse = (
  optionValue: IOptionValue | any
): OptionValueResponse => {
  return {
    id: optionValue._id.toString(),
    optionTypeId:
      optionValue.optionTypeId?._id?.toString() ||
      optionValue.optionTypeId?.toString(),
    optionTypeName: optionValue.optionTypeId?.name,
    value: optionValue.value,
    price: optionValue.price,
    stock: optionValue.stock,
    deletedAt: optionValue.deletedAt,
    createdAt: optionValue.createdAt,
    updatedAt: optionValue.updatedAt,
  };
};

export const validateOptionValueRequest = (
  data: OptionValueRequest
): string[] => {
  const errors: string[] = [];

  if (!data.optionTypeId || data.optionTypeId.trim().length === 0) {
    errors.push("Option type ID is required");
  }

  if (!data.value || data.value.trim().length === 0) {
    errors.push("Value is required");
  } else if (data.value.length > 100) {
    errors.push("Value must not exceed 100 characters");
  }

  if (data.price !== undefined && data.price !== null) {
    if (typeof data.price !== "number") {
      errors.push("Price must be a number");
    } else if (data.price < 0) {
      errors.push("Price cannot be negative");
    }
  }

  if (data.stock !== undefined && data.stock !== null) {
    if (!Number.isInteger(data.stock)) {
      errors.push("Stock must be a whole number");
    } else if (data.stock < 0) {
      errors.push("Stock cannot be negative");
    }
  }

  return errors;
};
