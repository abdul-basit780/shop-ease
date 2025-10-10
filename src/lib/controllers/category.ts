// lib/controllers/category.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { Category } from "../models/Category";
import connectToDatabase from "../db/mongodb";
import { isValidObjectId } from "mongoose";
import {
  buildMongoFilter,
  buildMongoSort,
  buildPaginationParams,
  calculatePagination,
} from "../utils/common";
import {
  buildCategoryResponse,
  CategoryResponse,
  CategoryRequest,
  validateCategoryRequest,
} from "../utils/category";

interface Response {
  success: boolean;
  message: string;
  categories?: CategoryResponse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  category?: CategoryResponse;
  statusCode: number | undefined;
}

export const index = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const categoryResponse: Response = {
    success: false,
    message: "",
    categories: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    statusCode: 500,
  };

  const params = buildPaginationParams(req.query);
  const { pageNum, limitNum, skip, pagination } = calculatePagination(
    params.page,
    params.limit,
    0 // Will be updated after count
  );

  // Build filter and sort objects (will exclude soft-deleted by default)
  const filter = buildMongoFilter(params);
  const sort = buildMongoSort(params);

  try {
    const [categories, total] = await Promise.all([
      Category.find(filter).sort(sort).skip(skip).limit(limitNum).exec(),
      Category.countDocuments(filter),
    ]);

    // Recalculate pagination with actual total
    const finalPagination = calculatePagination(
      params.page,
      params.limit,
      total
    );

    const responseCategories = categories.map(buildCategoryResponse);

    categoryResponse.success = true;
    categoryResponse.message = "Categories retrieved successfully";
    categoryResponse.categories = responseCategories;
    categoryResponse.pagination = finalPagination.pagination;
    categoryResponse.statusCode = 200;

    return categoryResponse;
  } catch (err) {
    console.error("Get categories error:", err);
    categoryResponse.message = "Internal server error";
    categoryResponse.statusCode = 500;
    return categoryResponse;
  }
};

export const store = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const categoryResponse: Response = {
    success: false,
    message: "",
    category: undefined,
    statusCode: 500,
  };

  const requestData: CategoryRequest = req.body;

  // Validate request data
  const validationErrors = validateCategoryRequest(requestData);
  if (validationErrors.length > 0) {
    categoryResponse.message = validationErrors.join(", ");
    categoryResponse.statusCode = 400;
    return categoryResponse;
  }

  try {
    // Duplicate checks (only check non-deleted categories)
    const existingCategory = await Category.findOne({
      name: requestData.name.toLowerCase().trim(),
      deletedAt: null,
    });

    if (existingCategory) {
      categoryResponse.message = "Category already exists";
      categoryResponse.statusCode = 409;
      return categoryResponse;
    }

    // Create category
    const newCategory = await Category.create(requestData);

    // Build response
    const responseCategory = buildCategoryResponse(newCategory);
    categoryResponse.category = responseCategory;
    categoryResponse.success = true;
    categoryResponse.message = "Category created successfully";
    categoryResponse.statusCode = 201;
    return categoryResponse;
  } catch (err) {
    console.error("Create category error:", err);
    categoryResponse.message = "Internal server error";
    categoryResponse.statusCode = 500;
    return categoryResponse;
  }
};

export const show = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await connectToDatabase();

  const categoryResponse: Response = {
    success: false,
    message: "",
    category: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    categoryResponse.message = "Invalid category ID";
    categoryResponse.statusCode = 400;
    return categoryResponse;
  }

  try {
    // Only show non-deleted categories by default
    const category = await Category.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!category) {
      categoryResponse.message = "Category not found";
      categoryResponse.statusCode = 404;
      return categoryResponse;
    }

    const responseCategory = buildCategoryResponse(category);
    categoryResponse.category = responseCategory;
    categoryResponse.success = true;
    categoryResponse.message = "Category retrieved successfully";
    categoryResponse.statusCode = 200;
    return categoryResponse;
  } catch (err) {
    console.error("Get category error:", err);
    categoryResponse.message = "Internal server error";
    categoryResponse.statusCode = 500;
    return categoryResponse;
  }
};

export const update = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const categoryResponse: Response = {
    success: false,
    message: "",
    category: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    categoryResponse.message = "Invalid category ID";
    categoryResponse.statusCode = 400;
    return categoryResponse;
  }

  const requestData: CategoryRequest = req.body;

  // Validate request data
  const validationErrors = validateCategoryRequest(requestData);
  if (validationErrors.length > 0) {
    categoryResponse.message = validationErrors.join(", ");
    categoryResponse.statusCode = 400;
    return categoryResponse;
  }

  try {
    // Find existing non-deleted category
    const existingCategory = await Category.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!existingCategory) {
      categoryResponse.message = "Category not found";
      categoryResponse.statusCode = 404;
      return categoryResponse;
    }

    // Check for duplicates if name is being updated (only non-deleted)
    if (
      requestData.name &&
      requestData.name.toLowerCase().trim() !== existingCategory.name
    ) {
      const nameExists = await Category.findOne({
        name: requestData.name.toLowerCase().trim(),
        _id: { $ne: id },
        deletedAt: null,
      });
      if (nameExists) {
        categoryResponse.message = "Category name already exists";
        categoryResponse.statusCode = 409;
        return categoryResponse;
      }
    }

    // Prepare update data
    const updateData = {
      name: requestData.name,
      description: requestData.description,
    };

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCategory) {
      categoryResponse.message = "Category not found";
      categoryResponse.statusCode = 404;
      return categoryResponse;
    }

    // Build response
    const responseCategory = buildCategoryResponse(updatedCategory);
    categoryResponse.category = responseCategory;
    categoryResponse.success = true;
    categoryResponse.message = "Category updated successfully";
    categoryResponse.statusCode = 200;
    return categoryResponse;
  } catch (err) {
    console.error("Update category error:", err);
    categoryResponse.message = "Internal server error";
    categoryResponse.statusCode = 500;
    return categoryResponse;
  }
};

export const destroy = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const categoryResponse: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    categoryResponse.message = "Invalid category ID";
    categoryResponse.statusCode = 400;
    return categoryResponse;
  }

  if (!isValidObjectId(id)) {
    categoryResponse.message = "Invalid category ID";
    categoryResponse.statusCode = 400;
    return categoryResponse;
  }

  try {
    const category = await Category.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!category) {
      categoryResponse.message = "Category not found";
      categoryResponse.statusCode = 404;
      return categoryResponse;
    }

    // Soft delete: Set deletedAt timestamp instead of actually removing
    await Category.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    categoryResponse.success = true;
    categoryResponse.message = "Category deleted successfully";
    categoryResponse.statusCode = 200;
    return categoryResponse;
  } catch (err) {
    console.error("Delete category error:", err);
    categoryResponse.message = "Internal server error";
    categoryResponse.statusCode = 500;
    return categoryResponse;
  }
};

// Optional: Add restore function to restore soft-deleted categories
export const restore = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const categoryResponse: Response = {
    success: false,
    message: "",
    category: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    categoryResponse.message = "Invalid category ID";
    categoryResponse.statusCode = 400;
    return categoryResponse;
  }

  try {
    const category = await Category.findOne({
      _id: id,
      deletedAt: { $ne: null },
    });

    if (!category) {
      categoryResponse.message = "Deleted category not found";
      categoryResponse.statusCode = 404;
      return categoryResponse;
    }

    // Check if a category with the same name exists among non-deleted ones
    const existingCategory = await Category.findOne({
      name: category.name,
      deletedAt: null,
      _id: { $ne: id },
    });

    if (existingCategory) {
      categoryResponse.message =
        "Cannot restore: A category with this name already exists";
      categoryResponse.statusCode = 409;
      return categoryResponse;
    }

    // Restore the category
    category.deletedAt = null;
    await category.save();

    const responseCategory = buildCategoryResponse(category);
    categoryResponse.category = responseCategory;
    categoryResponse.success = true;
    categoryResponse.message = "Category restored successfully";
    categoryResponse.statusCode = 200;
    return categoryResponse;
  } catch (err) {
    console.error("Restore category error:", err);
    categoryResponse.message = "Internal server error";
    categoryResponse.statusCode = 500;
    return categoryResponse;
  }
};

// Optional: Add permanent delete function for hard delete
export const permanentDestroy = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const categoryResponse: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    categoryResponse.message = "Invalid category ID";
    categoryResponse.statusCode = 400;
    return categoryResponse;
  }

  try {
    const category = await Category.findById(id);

    if (!category) {
      categoryResponse.message = "Category not found";
      categoryResponse.statusCode = 404;
      return categoryResponse;
    }

    // Permanently delete the category
    await Category.findByIdAndDelete(id);

    categoryResponse.success = true;
    categoryResponse.message = "Category permanently deleted";
    categoryResponse.statusCode = 200;
    return categoryResponse;
  } catch (err) {
    console.error("Permanent delete category error:", err);
    categoryResponse.message = "Internal server error";
    categoryResponse.statusCode = 500;
    return categoryResponse;
  }
};
