// lib/controllers/publicProduct.ts
import { NextApiRequest, NextApiResponse } from "next";
import { Product } from "../models/Product";
import connectToDatabase from "../db/mongodb";
import { isValidObjectId } from "mongoose";
import { buildPaginationParams, calculatePagination } from "../utils/common";
import {
  buildPublicProductResponse,
  PublicProductResponse,
} from "../utils/product";

interface Response {
  success: boolean;
  message: string;
  products?: PublicProductResponse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  product?: PublicProductResponse;
  statusCode: number | undefined;
}

// Get all products (public - no auth required)
export const listProducts = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const productResponse: Response = {
    success: false,
    message: "",
    products: [],
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

  // Build filter - only show non-deleted products
  const filter: any = { deletedAt: null };

  // Filter by category
  if (req.query.categoryId) {
    if (!isValidObjectId(req.query.categoryId)) {
      productResponse.message = "Invalid category ID";
      productResponse.statusCode = 400;
      return productResponse;
    }
    filter.categoryId = req.query.categoryId;
  }

  // Filter by stock availability
  if (req.query.inStock === "true") {
    filter.stock = { $gt: 0 };
  } else if (req.query.inStock === "false") {
    filter.stock = 0;
  }

  // Price range filters
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) {
      const minPrice = parseFloat(req.query.minPrice as string);
      if (!isNaN(minPrice)) {
        filter.price.$gte = minPrice;
      }
    }
    if (req.query.maxPrice) {
      const maxPrice = parseFloat(req.query.maxPrice as string);
      if (!isNaN(maxPrice)) {
        filter.price.$lte = maxPrice;
      }
    }
  }

  // Search filter
  if (params.search) {
    filter.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { description: { $regex: params.search, $options: "i" } },
    ];
  }

  // Build sort
  const sortBy = (req.query.sortBy as string) || "name";
  const sortOrder = (req.query.sortOrder as string) || "asc";
  const sort: any = {};
  sort[sortBy] = sortOrder === "asc" ? 1 : -1;

  try {
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "name")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Product.countDocuments(filter),
    ]);

    // Recalculate pagination with actual total
    const finalPagination = calculatePagination(
      params.page,
      params.limit,
      total
    );

    const responseProducts = products.map(buildPublicProductResponse);

    productResponse.success = true;
    productResponse.message =
      products.length > 0
        ? "Products retrieved successfully"
        : "No products found";
    productResponse.products = responseProducts;
    productResponse.pagination = finalPagination.pagination;
    productResponse.statusCode = 200;

    return productResponse;
  } catch (err) {
    console.error("Get products error:", err);
    productResponse.message = "Internal server error";
    productResponse.statusCode = 500;
    return productResponse;
  }
};

// Get single product by ID (public - no auth required)
export const getProduct = async (req: NextApiRequest, res: NextApiResponse) => {
  await connectToDatabase();

  const productResponse: Response = {
    success: false,
    message: "",
    product: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    productResponse.message = "Product ID is required";
    productResponse.statusCode = 400;
    return productResponse;
  }

  if (!isValidObjectId(id)) {
    productResponse.message = "Invalid product ID";
    productResponse.statusCode = 400;
    return productResponse;
  }

  try {
    // Only show non-deleted products for public
    const product = await Product.findOne({
      _id: id,
      deletedAt: null,
    }).populate("categoryId", "name");

    if (!product) {
      productResponse.message = "Product not found";
      productResponse.statusCode = 404;
      return productResponse;
    }

    const responseProduct = buildPublicProductResponse(product);

    productResponse.product = responseProduct;
    productResponse.success = true;
    productResponse.message = "Product retrieved successfully";
    productResponse.statusCode = 200;
    return productResponse;
  } catch (err) {
    console.error("Get product error:", err);
    productResponse.message = "Internal server error";
    productResponse.statusCode = 500;
    return productResponse;
  }
};
