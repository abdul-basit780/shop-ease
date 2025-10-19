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
    0
  );

  const filter = buildMongoFilter(params);

  // Support filtering by parentId
  if (req.query.parentId !== undefined) {
    if (req.query.parentId === "null" || req.query.parentId === "") {
      filter.parentId = null;
    } else if (isValidObjectId(req.query.parentId)) {
      filter.parentId = req.query.parentId;
    }
  }

  const sort = buildMongoSort(params);

  try {
    const [categories, total] = await Promise.all([
      Category.find(filter).sort(sort).skip(skip).limit(limitNum).exec(),
      Category.countDocuments(filter),
    ]);

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

  const validationErrors = validateCategoryRequest(requestData);
  if (validationErrors.length > 0) {
    categoryResponse.message = validationErrors.join(", ");
    categoryResponse.statusCode = 400;
    return categoryResponse;
  }

  try {
    // Validate parent category exists if parentId provided
    if (requestData.parentId) {
      if (!isValidObjectId(requestData.parentId)) {
        categoryResponse.message = "Invalid parent category ID";
        categoryResponse.statusCode = 400;
        return categoryResponse;
      }

      const parentExists = await Category.findOne({
        _id: requestData.parentId,
        deletedAt: null,
      });

      if (!parentExists) {
        categoryResponse.message = "Parent category not found";
        categoryResponse.statusCode = 404;
        return categoryResponse;
      }
    }

    // Check for duplicate names within same parent
    const existingCategory = await Category.findOne({
      name: requestData.name.toLowerCase().trim(),
      parentId: requestData.parentId || null,
      deletedAt: null,
    });

    if (existingCategory) {
      categoryResponse.message = requestData.parentId
        ? "Subcategory with this name already exists in this category"
        : "Category with this name already exists";
      categoryResponse.statusCode = 409;
      return categoryResponse;
    }

    const newCategory = await Category.create({
      name: requestData.name.toLowerCase().trim(),
      description: requestData.description,
      parentId: requestData.parentId || null,
    });

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

  const validationErrors = validateCategoryRequest(requestData);
  if (validationErrors.length > 0) {
    categoryResponse.message = validationErrors.join(", ");
    categoryResponse.statusCode = 400;
    return categoryResponse;
  }

  try {
    const existingCategory = await Category.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!existingCategory) {
      categoryResponse.message = "Category not found";
      categoryResponse.statusCode = 404;
      return categoryResponse;
    }

    // Validate parent category exists if parentId provided
    if (requestData.parentId) {
      if (!isValidObjectId(requestData.parentId)) {
        categoryResponse.message = "Invalid parent category ID";
        categoryResponse.statusCode = 400;
        return categoryResponse;
      }

      // Prevent circular reference
      if (requestData.parentId === id) {
        categoryResponse.message = "Category cannot be its own parent";
        categoryResponse.statusCode = 400;
        return categoryResponse;
      }

      const parentExists = await Category.findOne({
        _id: requestData.parentId,
        deletedAt: null,
      });

      if (!parentExists) {
        categoryResponse.message = "Parent category not found";
        categoryResponse.statusCode = 404;
        return categoryResponse;
      }
    }

    // Check for duplicate names within same parent
    const nameExists = await Category.findOne({
      name: requestData.name.toLowerCase().trim(),
      parentId: requestData.parentId || null,
      _id: { $ne: id },
      deletedAt: null,
    });

    if (nameExists) {
      categoryResponse.message = requestData.parentId
        ? "Subcategory with this name already exists in this category"
        : "Category with this name already exists";
      categoryResponse.statusCode = 409;
      return categoryResponse;
    }

    const updateData = {
      name: requestData.name.toLowerCase().trim(),
      description: requestData.description,
      parentId: requestData.parentId || null,
    };

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCategory) {
      categoryResponse.message = "Category not found";
      categoryResponse.statusCode = 404;
      return categoryResponse;
    }

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

    // Check if category has subcategories
    const hasSubcategories = await Category.findOne({
      parentId: id,
      deletedAt: null,
    });

    if (hasSubcategories) {
      categoryResponse.message =
        "Cannot delete category with subcategories. Delete subcategories first.";
      categoryResponse.statusCode = 400;
      return categoryResponse;
    }

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

    // Check if parent exists if category has parentId
    if (category.parentId) {
      const parentExists = await Category.findOne({
        _id: category.parentId,
        deletedAt: null,
      });

      if (!parentExists) {
        categoryResponse.message =
          "Cannot restore: parent category not found or deleted";
        categoryResponse.statusCode = 400;
        return categoryResponse;
      }
    }

    // Check for duplicate names within same parent
    const existingCategory = await Category.findOne({
      name: category.name,
      parentId: category.parentId,
      deletedAt: null,
      _id: { $ne: id },
    });

    if (existingCategory) {
      categoryResponse.message =
        "Cannot restore: A category with this name already exists";
      categoryResponse.statusCode = 409;
      return categoryResponse;
    }

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

    // Check for subcategories
    const hasSubcategories = await Category.findOne({ parentId: id });

    if (hasSubcategories) {
      categoryResponse.message = "Cannot delete category with subcategories";
      categoryResponse.statusCode = 400;
      return categoryResponse;
    }

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
