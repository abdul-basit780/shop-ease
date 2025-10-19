// lib/controllers/publicCategory.ts
import { NextApiRequest, NextApiResponse } from "next";
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
  buildPublicCategoryResponse,
  PublicCategoryResponse,
} from "../utils/category";

interface Response {
  success: boolean;
  message: string;
  categories?: PublicCategoryResponse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  category?: PublicCategoryResponse;
  statusCode: number | undefined;
}

export const listCategories = async (
  req: NextApiRequest,
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

  const filter: any = { deletedAt: null };

  // Support filtering by parentId
  if (req.query.parentId !== undefined) {
    if (req.query.parentId === "null" || req.query.parentId === "") {
      filter.parentId = null;
    } else if (isValidObjectId(req.query.parentId)) {
      filter.parentId = req.query.parentId;
    }
  }

  if (params.search) {
    filter.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { description: { $regex: params.search, $options: "i" } },
    ];
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

    const responseCategories = categories.map(buildPublicCategoryResponse);

    const errorMessage = filter.parentId
      ? "No subcategories found"
      : "No categories found";
    categoryResponse.success = true;
    categoryResponse.message =
      categories.length > 0
        ? "Categories retrieved successfully"
        : errorMessage;
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

export const getCategory = async (
  req: NextApiRequest,
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

  if (!id || typeof id !== "string") {
    categoryResponse.message = "Category ID is required";
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

    const responseCategory = buildPublicCategoryResponse(category);
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
