// lib/utils/product.ts
import { IProduct } from "../models/Product";
import { isValidObjectId } from "mongoose";

export interface ProductResponse {
  id: string;
  name: string;
  price: number;
  stock: number;
  img: string;
  description: string;
  categoryId: string;
  categoryName?: string; // Optional, populated from category
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductRequest {
  name: string;
  price: number;
  stock: number;
  description: string;
  categoryId: string;
  img?: string; // Optional in request, will be handled by file upload
}

// Helper function to build product response
export const buildProductResponse = (
  product: IProduct | any
): ProductResponse => {
  return {
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    stock: product.stock,
    img: product.img,
    description: product.description,
    categoryId: product.categoryId?.toString() || product.categoryId,
    categoryName: product.categoryId?.name || undefined, // If populated
    deletedAt: product.deletedAt,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
};

export const validateProductRequest = (
  data: ProductRequest,
  isUpdate: boolean = false
): string[] => {
  const errors: string[] = [];

  // Name validation
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.trim().length === 0) {
      errors.push("Name is required");
    } else if (data.name.length < 2) {
      errors.push("Name must be at least 2 characters long");
    } else if (data.name.length > 200) {
      errors.push("Name must not exceed 200 characters");
    }
  }

  // Price validation
  if (!isUpdate || data.price !== undefined) {
    if (data.price === undefined || data.price === null) {
      if (!isUpdate) errors.push("Price is required");
    } else if (typeof data.price !== "number" || isNaN(data.price)) {
      errors.push("Price must be a valid number");
    } else if (data.price < 0) {
      errors.push("Price cannot be negative");
    } else if (data.price > 999999.99) {
      errors.push("Price cannot exceed 999999.99");
    }
  }

  // Stock validation
  if (!isUpdate || data.stock !== undefined) {
    if (data.stock === undefined || data.stock === null) {
      if (!isUpdate) errors.push("Stock is required");
    } else if (!Number.isInteger(data.stock)) {
      errors.push("Stock must be a whole number");
    } else if (data.stock < 0) {
      errors.push("Stock cannot be negative");
    } else if (data.stock > 999999) {
      errors.push("Stock cannot exceed 999999");
    }
  }

  // Description validation
  if (!isUpdate || data.description !== undefined) {
    if (!data.description || data.description.trim().length === 0) {
      if (!isUpdate) errors.push("Description is required");
    } else if (data.description.length < 10) {
      errors.push("Description must be at least 10 characters long");
    } else if (data.description.length > 2000) {
      errors.push("Description must not exceed 2000 characters");
    }
  }

  // Category ID validation
  if (!isUpdate || data.categoryId !== undefined) {
    if (!data.categoryId) {
      if (!isUpdate) errors.push("Category ID is required");
    } else if (!isValidObjectId(data.categoryId)) {
      errors.push("Invalid category ID");
    }
  }

  return errors;
};

// Image upload configuration
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
  UPLOAD_DIR: "public/uploads/products",
  URL_PREFIX: "/uploads/products",
};

// Validate image file
export const validateImageFile = (file: any): string[] => {
  const errors: string[] = [];

  if (!file) {
    return errors; // Image is optional for updates
  }

  // Check file size
  if (file.size > IMAGE_CONFIG.MAX_SIZE) {
    errors.push(
      `Image size must not exceed ${IMAGE_CONFIG.MAX_SIZE / 1024 / 1024}MB`
    );
  }

  // Check file type
  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.mimetype)) {
    errors.push(
      `Image must be one of: ${IMAGE_CONFIG.ALLOWED_EXTENSIONS.join(", ")}`
    );
  }

  return errors;
};

// Generate unique filename
export const generateImageFilename = (originalName: string): string => {
  const ext = originalName.substring(originalName.lastIndexOf("."));
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `product_${timestamp}_${random}${ext}`;
};

// Build filter for product queries
export interface ProductFilterParams {
  page: string;
  limit: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  includeDeleted?: boolean;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
}

export const buildProductFilter = (params: ProductFilterParams): any => {
  const filter: any = {};

  // Filter out soft-deleted records by default
  if (!params.includeDeleted) {
    filter.deletedAt = null;
  }

  // Search filter
  if (params.search) {
    filter.$or = [
      { name: { $regex: params.search, $options: "i" } },
      { description: { $regex: params.search, $options: "i" } },
    ];
  }

  // Category filter
  if (params.categoryId && isValidObjectId(params.categoryId)) {
    filter.categoryId = params.categoryId;
  }

  // Price range filter
  if (params.minPrice || params.maxPrice) {
    filter.price = {};
    if (params.minPrice) {
      filter.price.$gte = parseFloat(params.minPrice);
    }
    if (params.maxPrice) {
      filter.price.$lte = parseFloat(params.maxPrice);
    }
  }

  // Stock filter
  if (params.inStock === "true") {
    filter.stock = { $gt: 0 };
  } else if (params.inStock === "false") {
    filter.stock = 0;
  }

  return filter;
};

export const buildProductSort = (params: ProductFilterParams): any => {
  const sort: any = {};
  const sortBy = params.sortBy || "name";
  const sortOrder = params.sortOrder === "desc" ? -1 : 1;

  // Validate sortBy field
  const allowedSortFields = [
    "name",
    "price",
    "stock",
    "createdAt",
    "updatedAt",
  ];
  if (allowedSortFields.includes(sortBy)) {
    sort[sortBy] = sortOrder;
  } else {
    sort.name = 1; // Default sort
  }

  return sort;
};
