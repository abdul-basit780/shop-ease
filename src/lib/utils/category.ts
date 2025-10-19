// lib/utils/category.ts
import { ICategory } from "../models/Category";

export interface CategoryRequest {
  name: string;
  description: string;
  parentId?: string | null;
}

export interface CategoryResponse {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicCategoryResponse {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const buildCategoryResponse = (
  category: ICategory
): CategoryResponse => {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    parentId: category.parentId ? category.parentId.toString() : null,
    deletedAt: category.deletedAt,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

export const buildPublicCategoryResponse = (
  category: ICategory
): PublicCategoryResponse => {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    parentId: category.parentId ? category.parentId.toString() : null,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
};

export const validateCategoryRequest = (data: CategoryRequest): string[] => {
  const errors: string[] = [];

  if (
    !data.name ||
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Name is required");
  } else if (data.name.trim().length > 100) {
    errors.push("Name must be less than 100 characters");
  }

  if (
    !data.description ||
    typeof data.description !== "string" ||
    data.description.trim().length === 0
  ) {
    errors.push("Description is required");
  } else if (data.description.trim().length > 500) {
    errors.push("Description must be less than 500 characters");
  }

  // parentId is optional, but if provided, should be a string or null
  if (
    data.parentId !== undefined &&
    data.parentId !== null &&
    typeof data.parentId !== "string"
  ) {
    errors.push("Parent ID must be a string or null");
  }

  return errors;
};
