// lib/controllers/product.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { Product } from "../models/Product";
import { Category } from "../models/Category";
import connectToDatabase from "../db/mongodb";
import { isValidObjectId } from "mongoose";
import { buildPaginationParams, calculatePagination } from "../utils/common";
import {
  buildProductResponse,
  ProductResponse,
  ProductRequest,
  validateProductRequest,
  validateImageFile,
  generateImageFilename,
  IMAGE_CONFIG,
  buildProductFilter,
  buildProductSort,
  ProductFilterParams,
} from "../utils/product";
import fs from "fs/promises";
import path from "path";
import formidable from "formidable";

interface Response {
  success: boolean;
  message: string;
  products?: ProductResponse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  product?: ProductResponse;
  statusCode: number | undefined;
}

// Helper function to ensure upload directory exists
const ensureUploadDir = async () => {
  const uploadDir = path.join(process.cwd(), IMAGE_CONFIG.UPLOAD_DIR);
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Helper function to delete image file
const deleteImageFile = async (imagePath: string) => {
  if (!imagePath) return;

  try {
    // Extract filename from URL path
    const filename = imagePath.replace(IMAGE_CONFIG.URL_PREFIX + "/", "");
    const fullPath = path.join(
      process.cwd(),
      IMAGE_CONFIG.UPLOAD_DIR,
      filename
    );
    await fs.unlink(fullPath);
  } catch (error) {
    console.error("Error deleting image file:", error);
  }
};

export const index = async (
  req: AuthenticatedRequest,
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

  const params: ProductFilterParams = {
    ...buildPaginationParams(req.query),
    categoryId: req.query.categoryId as string,
    minPrice: req.query.minPrice as string,
    maxPrice: req.query.maxPrice as string,
    inStock: req.query.inStock as string,
  };

  const { pageNum, limitNum, skip, pagination } = calculatePagination(
    params.page,
    params.limit,
    0
  );

  // Build filter and sort objects
  const filter = buildProductFilter(params);
  const sort = buildProductSort(params);

  try {
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categoryId", "name") // Populate category name
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

    const responseProducts = products.map(buildProductResponse);

    productResponse.success = true;
    productResponse.message = "Products retrieved successfully";
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

export const store = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const productResponse: Response = {
    success: false,
    message: "",
    product: undefined,
    statusCode: 500,
  };

  try {
    // Parse form data with formidable
    const uploadDir = await ensureUploadDir();

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: IMAGE_CONFIG.MAX_SIZE,
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Parse fields (formidable returns arrays)
    const requestData: ProductRequest = {
      name: Array.isArray(fields.name) ? fields.name[0] : fields.name,
      price: parseFloat(
        Array.isArray(fields.price) ? fields.price[0] : fields.price
      ),
      stock: parseInt(
        Array.isArray(fields.stock) ? fields.stock[0] : fields.stock
      ),
      description: Array.isArray(fields.description)
        ? fields.description[0]
        : fields.description,
      categoryId: Array.isArray(fields.categoryId)
        ? fields.categoryId[0]
        : fields.categoryId,
    };

    // Validate request data
    const validationErrors = validateProductRequest(requestData);
    if (validationErrors.length > 0) {
      productResponse.message = validationErrors.join(", ");
      productResponse.statusCode = 400;
      return productResponse;
    }

    // Handle image file
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!imageFile) {
      productResponse.message = "Product image is required";
      productResponse.statusCode = 400;
      return productResponse;
    }

    // Validate image
    const imageErrors = validateImageFile(imageFile);
    if (imageErrors.length > 0) {
      // Delete uploaded file
      await fs.unlink(imageFile.filepath);
      productResponse.message = imageErrors.join(", ");
      productResponse.statusCode = 400;
      return productResponse;
    }

    // Check if category exists and is not deleted
    const category = await Category.findOne({
      _id: requestData.categoryId,
      deletedAt: null,
    });

    if (!category) {
      await fs.unlink(imageFile.filepath);
      productResponse.message = "Category not found or has been deleted";
      productResponse.statusCode = 404;
      return productResponse;
    }

    // Check for duplicate product name in the same category
    const existingProduct = await Product.findOne({
      name: requestData.name.toLowerCase().trim(),
      categoryId: requestData.categoryId,
      deletedAt: null,
    });

    if (existingProduct) {
      await fs.unlink(imageFile.filepath);
      productResponse.message =
        "Product with this name already exists in the category";
      productResponse.statusCode = 409;
      return productResponse;
    }

    // Generate new filename and move file
    const newFilename = generateImageFilename(
      imageFile.originalFilename || imageFile.newFilename
    );
    const newPath = path.join(uploadDir, newFilename);
    await fs.rename(imageFile.filepath, newPath);

    // Create product with image URL
    const newProduct = await Product.create({
      ...requestData,
      img: `${IMAGE_CONFIG.URL_PREFIX}/${newFilename}`,
    });

    // Populate category for response
    await newProduct.populate("categoryId", "name");

    // Build response
    const responseProduct = buildProductResponse(newProduct);
    productResponse.product = responseProduct;
    productResponse.success = true;
    productResponse.message = "Product created successfully";
    productResponse.statusCode = 201;
    return productResponse;
  } catch (err) {
    console.error("Create product error:", err);
    productResponse.message = "Internal server error";
    productResponse.statusCode = 500;
    return productResponse;
  }
};

export const show = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await connectToDatabase();

  const productResponse: Response = {
    success: false,
    message: "",
    product: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

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

    const responseProduct = buildProductResponse(product);
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

export const update = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const productResponse: Response = {
    success: false,
    message: "",
    product: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    productResponse.message = "Invalid product ID";
    productResponse.statusCode = 400;
    return productResponse;
  }

  try {
    // Parse form data
    const uploadDir = await ensureUploadDir();

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: IMAGE_CONFIG.MAX_SIZE,
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Parse fields
    const requestData: Partial<ProductRequest> = {};

    if (fields.name) {
      requestData.name = Array.isArray(fields.name)
        ? fields.name[0]
        : fields.name;
    }
    if (fields.price) {
      requestData.price = parseFloat(
        Array.isArray(fields.price) ? fields.price[0] : fields.price
      );
    }
    if (fields.stock) {
      requestData.stock = parseInt(
        Array.isArray(fields.stock) ? fields.stock[0] : fields.stock
      );
    }
    if (fields.description) {
      requestData.description = Array.isArray(fields.description)
        ? fields.description[0]
        : fields.description;
    }
    if (fields.categoryId) {
      requestData.categoryId = Array.isArray(fields.categoryId)
        ? fields.categoryId[0]
        : fields.categoryId;
    }

    // Validate request data
    const validationErrors = validateProductRequest(
      requestData as ProductRequest,
      true
    );
    if (validationErrors.length > 0) {
      productResponse.message = validationErrors.join(", ");
      productResponse.statusCode = 400;
      return productResponse;
    }

    // Find existing product
    const existingProduct = await Product.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!existingProduct) {
      productResponse.message = "Product not found";
      productResponse.statusCode = 404;
      return productResponse;
    }

    // Check category if being updated
    if (requestData.categoryId) {
      const category = await Category.findOne({
        _id: requestData.categoryId,
        deletedAt: null,
      });

      if (!category) {
        productResponse.message = "Category not found or has been deleted";
        productResponse.statusCode = 404;
        return productResponse;
      }
    }

    // Check for duplicate name if being updated
    if (
      requestData.name &&
      requestData.name.toLowerCase().trim() !== existingProduct.name
    ) {
      const nameExists = await Product.findOne({
        name: requestData.name.toLowerCase().trim(),
        categoryId: requestData.categoryId || existingProduct.categoryId,
        _id: { $ne: id },
        deletedAt: null,
      });

      if (nameExists) {
        productResponse.message =
          "Product with this name already exists in the category";
        productResponse.statusCode = 409;
        return productResponse;
      }
    }

    // Handle image update if provided
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    let newImageUrl = existingProduct.img;

    if (imageFile) {
      // Validate new image
      const imageErrors = validateImageFile(imageFile);
      if (imageErrors.length > 0) {
        await fs.unlink(imageFile.filepath);
        productResponse.message = imageErrors.join(", ");
        productResponse.statusCode = 400;
        return productResponse;
      }

      // Generate new filename and move file
      const newFilename = generateImageFilename(
        imageFile.originalFilename || imageFile.newFilename
      );
      const newPath = path.join(uploadDir, newFilename);
      await fs.rename(imageFile.filepath, newPath);

      // Delete old image
      await deleteImageFile(existingProduct.img);

      // Update image URL
      newImageUrl = `${IMAGE_CONFIG.URL_PREFIX}/${newFilename}`;
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...requestData,
        img: newImageUrl,
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("categoryId", "name");

    if (!updatedProduct) {
      productResponse.message = "Product not found";
      productResponse.statusCode = 404;
      return productResponse;
    }

    // Build response
    const responseProduct = buildProductResponse(updatedProduct);
    productResponse.product = responseProduct;
    productResponse.success = true;
    productResponse.message = "Product updated successfully";
    productResponse.statusCode = 200;
    return productResponse;
  } catch (err) {
    console.error("Update product error:", err);
    productResponse.message = "Internal server error";
    productResponse.statusCode = 500;
    return productResponse;
  }
};

export const destroy = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const productResponse: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    productResponse.message = "Invalid product ID";
    productResponse.statusCode = 400;
    return productResponse;
  }

  try {
    const product = await Product.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!product) {
      productResponse.message = "Product not found";
      productResponse.statusCode = 404;
      return productResponse;
    }

    // Soft delete: Set deletedAt timestamp
    await Product.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    // Note: We keep the image file for potential restoration

    productResponse.success = true;
    productResponse.message = "Product deleted successfully";
    productResponse.statusCode = 200;
    return productResponse;
  } catch (err) {
    console.error("Delete product error:", err);
    productResponse.message = "Internal server error";
    productResponse.statusCode = 500;
    return productResponse;
  }
};

export const restore = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const productResponse: Response = {
    success: false,
    message: "",
    product: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    productResponse.message = "Invalid product ID";
    productResponse.statusCode = 400;
    return productResponse;
  }

  try {
    const product = await Product.findOne({
      _id: id,
      deletedAt: { $ne: null },
    });

    if (!product) {
      productResponse.message = "Deleted product not found";
      productResponse.statusCode = 404;
      return productResponse;
    }

    // Check if a product with the same name exists in the category
    const existingProduct = await Product.findOne({
      name: product.name,
      categoryId: product.categoryId,
      deletedAt: null,
      _id: { $ne: id },
    });

    if (existingProduct) {
      productResponse.message =
        "Cannot restore: A product with this name already exists in the category";
      productResponse.statusCode = 409;
      return productResponse;
    }

    // Restore the product
    product.deletedAt = null;
    await product.save();

    // Populate category for response
    await product.populate("categoryId", "name");

    const responseProduct = buildProductResponse(product);
    productResponse.product = responseProduct;
    productResponse.success = true;
    productResponse.message = "Product restored successfully";
    productResponse.statusCode = 200;
    return productResponse;
  } catch (err) {
    console.error("Restore product error:", err);
    productResponse.message = "Internal server error";
    productResponse.statusCode = 500;
    return productResponse;
  }
};

export const permanentDestroy = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const productResponse: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    productResponse.message = "Invalid product ID";
    productResponse.statusCode = 400;
    return productResponse;
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      productResponse.message = "Product not found";
      productResponse.statusCode = 404;
      return productResponse;
    }

    // Delete the image file
    await deleteImageFile(product.img);

    // Permanently delete the product
    await Product.findByIdAndDelete(id);

    productResponse.success = true;
    productResponse.message = "Product permanently deleted";
    productResponse.statusCode = 200;
    return productResponse;
  } catch (err) {
    console.error("Permanent delete product error:", err);
    productResponse.message = "Internal server error";
    productResponse.statusCode = 500;
    return productResponse;
  }
};
