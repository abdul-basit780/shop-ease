// lib/utils/category.ts
import { ICategory } from "../models/Category";

export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicCategoryResponse {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryRequest {
  name: string;
  description: string;
}

// Helper function to build category response (admin)
export const buildCategoryResponse = (
  category: ICategory
): CategoryResponse => {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    deletedAt: category.deletedAt,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

// Helper function to build public category response (excludes deletedAt)
export const buildPublicCategoryResponse = (
  category: ICategory
): PublicCategoryResponse => {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

export const validateCategoryRequest = (data: CategoryRequest): string[] => {
  const errors: string[] = [];

  if (!data.name) {
    errors.push("Name is required");
  } else if (typeof data.name !== "string") {
    errors.push("Name must be a string");
  } else if (data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters");
  } else if (data.name.trim().length > 100) {
    errors.push("Name must not exceed 100 characters");
  }

  if (!data.description) {
    errors.push("Description is required");
  } else if (typeof data.description !== "string") {
    errors.push("Description must be a string");
  } else if (data.description.trim().length < 10) {
    errors.push("Description must be at least 10 characters");
  } else if (data.description.trim().length > 500) {
    errors.push("Description must not exceed 500 characters");
  }

  return errors;
};
