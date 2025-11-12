// lib/controllers/publicProduct.ts
import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { Product } from "../models/Product";
import { OptionType } from "../models/OptionType";
import { OptionValue } from "../models/OptionValue";
import connectToDatabase from "../db/mongodb";
import { isValidObjectId } from "mongoose";
import { buildPaginationParams, calculatePagination } from "../utils/common";
import {
  buildPublicProductResponse,
  getProductsRatings,
  PublicProductResponse,
  getProductRating,
} from "../utils/product";

interface PublicProductWithOptions extends PublicProductResponse {
  optionTypes?: Array<{
    id: string;
    name: string;
    values: Array<{
      id: string;
      value: string;
      img: string | undefined;
      price: number;
      stock: number;
    }>;
  }>;
}

interface Response {
  success: boolean;
  message: string;
  products?: PublicProductWithOptions[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  product?: PublicProductWithOptions;
  statusCode: number | undefined;
}

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

  const filter: any = { deletedAt: null };

  if (req.query.categoryId) {
    if (!isValidObjectId(req.query.categoryId)) {
      productResponse.message = "Invalid category ID";
      productResponse.statusCode = 400;
      return productResponse;
    }
    filter.categoryId = req.query.categoryId;
  }

  // Stock filter
  if (req.query.inStock === "true") {
    filter.stock = { $gt: 0 };
  } else if (req.query.inStock === "false") {
    filter.stock = 0;
  }

  // Price range filter
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

  if (params.search) {
    filter.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { description: { $regex: params.search, $options: "i" } },
    ];
  }

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

    const finalPagination = calculatePagination(
      params.page,
      params.limit,
      total
    );

    // Fetch ratings for all products
    const productIds = products.map((p) => new mongoose.Types.ObjectId(p._id));
    const ratingsMap = await getProductsRatings(productIds);
  
    // Build response with option types and values
    const responseProducts: PublicProductWithOptions[] = await Promise.all(
      products.map(async (product) => {
        const rating = ratingsMap.get(product._id.toString());
        const baseProduct = buildPublicProductResponse(product, rating);
        // Fetch option types for this product
        const optionTypes = await OptionType.find({
          productId: product._id,
          deletedAt: null,
        }).sort({ name: 1 });

        if (optionTypes.length > 0) {
          // Fetch option values for all option types
          const optionTypeIds = optionTypes.map((ot) => ot._id);
          const optionValues = await OptionValue.find({
            optionTypeId: { $in: optionTypeIds },
            deletedAt: null,
          }).sort({ value: 1 });

          // Group option values by option type
          const optionTypesData = optionTypes.map((ot) => ({
            id: ot._id.toString(),
            name: ot.name,
            values: optionValues
              .filter((ov) => ov.optionTypeId.toString() === ot._id.toString())
              .map((ov) => ({
                id: ov._id.toString(),
                value: ov.value,
                img: ov.img,
                price: ov.price,
                stock: ov.stock,
              })),
          }));

          return {
            ...baseProduct,
            optionTypes: optionTypesData,
          };
        }

        return baseProduct;
      })
    );

    productResponse.success = true;
    productResponse.message =
      responseProducts.length > 0
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
    const product = await Product.findOne({
      _id: id,
      deletedAt: null,
    }).populate("categoryId", "name");

    if (!product) {
      productResponse.message = "Product not found";
      productResponse.statusCode = 404;
      return productResponse;
    }

    // Fetch ratings for this product
    const rating = await getProductRating(product._id);

    const baseProduct = buildPublicProductResponse(product, rating);
    let responseProduct: PublicProductWithOptions = { ...baseProduct };

    // Fetch option types for this product
    const optionTypes = await OptionType.find({
      productId: product._id,
      deletedAt: null,
    }).sort({ name: 1 });

    if (optionTypes.length > 0) {
      // Fetch option values for all option types
      const optionTypeIds = optionTypes.map((ot) => ot._id);
      const optionValues = await OptionValue.find({
        optionTypeId: { $in: optionTypeIds },
        deletedAt: null,
      }).sort({ value: 1 });

      // Group option values by option type
      responseProduct.optionTypes = optionTypes.map((ot) => ({
        id: ot._id.toString(),
        name: ot.name,
        values: optionValues
          .filter((ov) => ov.optionTypeId.toString() === ot._id.toString())
          .map((ov) => ({
            id: ov._id.toString(),
            value: ov.value,
            img: ov.img || undefined,
            price: ov.price,
            stock: ov.stock,
          })),
      }));
    }

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
