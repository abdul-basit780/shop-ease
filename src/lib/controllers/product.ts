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
  buildProductFilter,
  buildProductSort,
  ProductFilterParams,
} from "../utils/product";
import formidable from "formidable";
import ImageKit from "imagekit";
import fs from "fs/promises";

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

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

const IMAGEKIT_FOLDER = "/products";

// Helper function to upload image to ImageKit
const uploadToImageKit = async (file: formidable.File): Promise<string> => {
  try {
    const fileBuffer = await fs.readFile(file.filepath);

    const result = await imagekit.upload({
      file: fileBuffer,
      fileName: file.originalFilename || file.newFilename,
      folder: IMAGEKIT_FOLDER,
      useUniqueFileName: true,
    });

    // Clean up temp file
    await fs.unlink(file.filepath).catch(() => {});

    return result.url;
  } catch (error) {
    await fs.unlink(file.filepath).catch(() => {});
    throw error;
  }
};

// Helper function to delete image from ImageKit
const deleteFromImageKit = async (imageUrl: string) => {
  if (!imageUrl) return;

  try {
    const urlParts = imageUrl.split("/");
    const fileIdWithExt = urlParts[urlParts.length - 1];
    const fileName = fileIdWithExt.split("?")[0];

    const files = await imagekit.listFiles({
      path: IMAGEKIT_FOLDER,
      searchQuery: `name="${fileName}"`,
    });

    if (files.length > 0) {
      const file = files[0];
      // Check if it's a file (not a folder) and has fileId
      if ("fileId" in file && file.fileId) {
        await imagekit.deleteFile(file.fileId);
      }
    }
  } catch (error) {
    console.error("Error deleting image from ImageKit:", error);
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

  const filter = buildProductFilter(params);
  const sort = buildProductSort(params);

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
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

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

    const validationErrors = validateProductRequest(requestData);
    if (validationErrors.length > 0) {
      productResponse.message = validationErrors.join(", ");
      productResponse.statusCode = 400;
      return productResponse;
    }

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!imageFile) {
      productResponse.message = "Product image is required";
      productResponse.statusCode = 400;
      return productResponse;
    }

    const imageErrors = validateImageFile(imageFile);
    if (imageErrors.length > 0) {
      await fs.unlink(imageFile.filepath).catch(() => {});
      productResponse.message = imageErrors.join(", ");
      productResponse.statusCode = 400;
      return productResponse;
    }

    const category = await Category.findOne({
      _id: requestData.categoryId,
      deletedAt: null,
    });

    if (!category) {
      await fs.unlink(imageFile.filepath).catch(() => {});
      productResponse.message = "Category not found or has been deleted";
      productResponse.statusCode = 404;
      return productResponse;
    }

    const existingProduct = await Product.findOne({
      name: requestData.name.toLowerCase().trim(),
      categoryId: requestData.categoryId,
      deletedAt: null,
    });

    if (existingProduct) {
      await fs.unlink(imageFile.filepath).catch(() => {});
      productResponse.message =
        "Product with this name already exists in the category";
      productResponse.statusCode = 409;
      return productResponse;
    }

    let imageUrl: string;
    try {
      imageUrl = await uploadToImageKit(imageFile);
    } catch (error) {
      console.error("ImageKit upload error:", error);
      productResponse.message = "Failed to upload image";
      productResponse.statusCode = 500;
      return productResponse;
    }

    const newProduct = await Product.create({
      ...requestData,
      img: imageUrl,
    });

    await newProduct.populate("categoryId", "name");

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
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

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

    const validationErrors = validateProductRequest(
      requestData as ProductRequest,
      true
    );
    if (validationErrors.length > 0) {
      productResponse.message = validationErrors.join(", ");
      productResponse.statusCode = 400;
      return productResponse;
    }

    // Skip update if no fields were provided
    if (Object.keys(requestData).length === 0 && !files.image) {
      productResponse.message = "No fields to update";
      productResponse.statusCode = 400;
      return productResponse;
    }

    const existingProduct = await Product.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!existingProduct) {
      productResponse.message = "Product not found";
      productResponse.statusCode = 404;
      return productResponse;
    }

    if (requestData.categoryId === "") {
      productResponse.message = "Category ID cannot be empty string";
      productResponse.statusCode = 400;
      return productResponse;
    }

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

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    let newImageUrl = existingProduct.img;

    if (imageFile) {
      const imageErrors = validateImageFile(imageFile);
      if (imageErrors.length > 0) {
        await fs.unlink(imageFile.filepath).catch(() => {});
        productResponse.message = imageErrors.join(", ");
        productResponse.statusCode = 400;
        return productResponse;
      }

      try {
        newImageUrl = await uploadToImageKit(imageFile);

        deleteFromImageKit(existingProduct.img).catch((err) =>
          console.error("Failed to delete old image:", err)
        );
      } catch (error) {
        console.error("ImageKit upload error:", error);
        productResponse.message = "Failed to upload image";
        productResponse.statusCode = 500;
        return productResponse;
      }
    }

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
    )

    updatedProduct?.populate("categoryId", "name");

    if (!updatedProduct) {
      productResponse.message = "Product not found";
      productResponse.statusCode = 404;
      return productResponse;
    }

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

    await Product.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

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

    product.deletedAt = null;
    await product.save();

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

    await deleteFromImageKit(product.img);

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
