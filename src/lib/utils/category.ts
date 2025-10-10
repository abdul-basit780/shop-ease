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

export interface CategoryRequest {
  name: string;
  description: string;
}

// Helper function to build category response
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

export const validateCategoryRequest = (data: CategoryRequest): string[] => {
  const errors: string[] = [];

  if (!data.name) {
    errors.push("Name is required");
  }

  if (!data.description) {
    errors.push("Description is required");
  }

  return errors;
};
