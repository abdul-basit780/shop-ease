// lib/controllers/optionValue.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { OptionValue } from "../models/OptionValue";
import { OptionType } from "../models/OptionType";
import connectToDatabase from "../db/mongodb";
import { isValidObjectId } from "mongoose";
import {
  buildOptionValueResponse,
  OptionValueResponse,
  OptionValueRequest,
  validateOptionValueRequest,
  validateImageFile,
} from "../utils/option";
import formidable from "formidable";
import ImageKit from "imagekit";
import fs from "fs/promises";

interface Response {
  success: boolean;
  message: string;
  optionValues?: OptionValueResponse[];
  optionValue?: OptionValueResponse;
  statusCode: number | undefined;
}

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
});

const IMAGEKIT_FOLDER = "/option-values";

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

    const results = await imagekit.listFiles({
      path: IMAGEKIT_FOLDER,
      searchQuery: `name="${fileName}"`,
    });

    if (results.length > 0) {
      const file = results[0];
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

  const response: Response = {
    success: false,
    message: "",
    optionValues: [],
    statusCode: 500,
  };

  try {
    const filter: any = { deletedAt: null };

    if (req.query.optionTypeId && isValidObjectId(req.query.optionTypeId)) {
      filter.optionTypeId = req.query.optionTypeId;
    }

    const optionValues = await OptionValue.find(filter)
      .populate("optionTypeId", "name productId")
      .sort({ value: 1 });

    response.success = true;
    response.message = "Option values retrieved successfully";
    response.optionValues = optionValues.map(buildOptionValueResponse);
    response.statusCode = 200;

    return response;
  } catch (err) {
    console.error("Get option values error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};

export const store = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    optionValue: undefined,
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

    const requestData: OptionValueRequest = {
      optionTypeId: Array.isArray(fields.optionTypeId)
        ? fields.optionTypeId[0]
        : fields.optionTypeId,
      value: Array.isArray(fields.value) ? fields.value[0] : fields.value,
      price: parseFloat(
        Array.isArray(fields.price) ? fields.price[0] : fields.price
      ),
      stock: parseInt(
        Array.isArray(fields.stock) ? fields.stock[0] : fields.stock
      ),
    };

    const validationErrors = validateOptionValueRequest(requestData);
    if (validationErrors.length > 0) {
      response.message = validationErrors.join(", ");
      response.statusCode = 400;
      return response;
    }

    if (!isValidObjectId(requestData.optionTypeId)) {
      response.message = "Invalid option type ID";
      response.statusCode = 400;
      return response;
    }

    // Handle image file
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!imageFile) {
      response.message = "Option value image is required";
      response.statusCode = 400;
      return response;
    }

    const imageErrors = validateImageFile(imageFile);
    if (imageErrors.length > 0) {
      await fs.unlink(imageFile.filepath).catch(() => {});
      response.message = imageErrors.join(", ");
      response.statusCode = 400;
      return response;
    }

    // Check if option type exists
    const optionType = await OptionType.findOne({
      _id: requestData.optionTypeId,
      deletedAt: null,
    });

    if (!optionType) {
      await fs.unlink(imageFile.filepath).catch(() => {});
      response.message = "Option type not found";
      response.statusCode = 404;
      return response;
    }

    // Check for duplicates
    const existing = await OptionValue.findOne({
      optionTypeId: requestData.optionTypeId,
      value: requestData.value.toLowerCase().trim(),
      deletedAt: null,
    });

    if (existing) {
      await fs.unlink(imageFile.filepath).catch(() => {});
      response.message = "Option value already exists for this type";
      response.statusCode = 409;
      return response;
    }

    // Upload image to ImageKit
    let imageUrl: string;
    try {
      imageUrl = await uploadToImageKit(imageFile);
    } catch (error) {
      console.error("ImageKit upload error:", error);
      response.message = "Failed to upload image";
      response.statusCode = 500;
      return response;
    }

    const newOptionValue = await OptionValue.create({
      optionTypeId: requestData.optionTypeId,
      value: requestData.value.toLowerCase().trim(),
      img: imageUrl,
      price: requestData.price || 0,
      stock: requestData.stock || 0,
    });

    await newOptionValue.populate("optionTypeId", "name productId");

    response.optionValue = buildOptionValueResponse(newOptionValue);
    response.success = true;
    response.message = "Option value created successfully";
    response.statusCode = 201;
    return response;
  } catch (err) {
    console.error("Create option value error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};

export const show = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    optionValue: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    response.message = "Invalid option value ID";
    response.statusCode = 400;
    return response;
  }

  try {
    const optionValue = await OptionValue.findOne({
      _id: id,
      deletedAt: null,
    }).populate("optionTypeId", "name productId");

    if (!optionValue) {
      response.message = "Option value not found";
      response.statusCode = 404;
      return response;
    }

    response.optionValue = buildOptionValueResponse(optionValue);
    response.success = true;
    response.message = "Option value retrieved successfully";
    response.statusCode = 200;
    return response;
  } catch (err) {
    console.error("Get option value error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};

export const update = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    optionValue: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    response.message = "Invalid option value ID";
    response.statusCode = 400;
    return response;
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

    const requestData: Partial<OptionValueRequest> = {};

    if (fields.optionTypeId) {
      const optionTypeId = Array.isArray(fields.optionTypeId)
        ? fields.optionTypeId[0]
        : fields.optionTypeId;
      if (optionTypeId && optionTypeId.trim()) {
        requestData.optionTypeId = optionTypeId;
      }
    }
    if (fields.value) {
      const value = Array.isArray(fields.value)
        ? fields.value[0]
        : fields.value;
      if (value && value.trim()) {
        requestData.value = value;
      }
    }
    if (fields.price !== undefined) {
      const price = Array.isArray(fields.price)
        ? fields.price[0]
        : fields.price;
      if (price !== undefined && price !== "") {
        requestData.price = parseFloat(price);
      }
    }
    if (fields.stock !== undefined) {
      const stock = Array.isArray(fields.stock)
        ? fields.stock[0]
        : fields.stock;
      if (stock !== undefined && stock !== "") {
        requestData.stock = parseInt(stock);
      }
    }

    // Skip update if no fields were provided
    if (Object.keys(requestData).length === 0 && !files.image) {
      response.message = "No fields to update";
      response.statusCode = 400;
      return response;
    }

    const existing = await OptionValue.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!existing) {
      response.message = "Option value not found";
      response.statusCode = 404;
      return response;
    }

    // Validate if fields are provided
    if (Object.keys(requestData).length > 0) {
      const validationErrors = validateOptionValueRequest(
        requestData as OptionValueRequest,
        true
      );
      if (validationErrors.length > 0) {
        response.message = validationErrors.join(", ");
        response.statusCode = 400;
        return response;
      }
    }

    // Check if option type exists if being updated
    if (requestData.optionTypeId) {
      if (!isValidObjectId(requestData.optionTypeId)) {
        response.message = "Invalid option type ID";
        response.statusCode = 400;
        return response;
      }

      const optionType = await OptionType.findOne({
        _id: requestData.optionTypeId,
        deletedAt: null,
      });

      if (!optionType) {
        response.message = "Option type not found";
        response.statusCode = 404;
        return response;
      }
    }

    // Check for duplicate value
    if (requestData.value) {
      const valueExists = await OptionValue.findOne({
        optionTypeId: requestData.optionTypeId || existing.optionTypeId,
        value: requestData.value.toLowerCase().trim(),
        _id: { $ne: id },
        deletedAt: null,
      });

      if (valueExists) {
        response.message = "Option value already exists for this type";
        response.statusCode = 409;
        return response;
      }
    }

    // Handle image update if provided
    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    let newImageUrl = existing.img;

    if (imageFile) {
      const imageErrors = validateImageFile(imageFile);
      if (imageErrors.length > 0) {
        await fs.unlink(imageFile.filepath).catch(() => {});
        response.message = imageErrors.join(", ");
        response.statusCode = 400;
        return response;
      }

      try {
        newImageUrl = await uploadToImageKit(imageFile);

        deleteFromImageKit(existing.img).catch((err) =>
          console.error("Failed to delete old image:", err)
        );
      } catch (error) {
        console.error("ImageKit upload error:", error);
        response.message = "Failed to upload image";
        response.statusCode = 500;
        return response;
      }
    }

    const updated = await OptionValue.findByIdAndUpdate(
      id,
      {
        optionTypeId: requestData.optionTypeId || existing.optionTypeId,
        value: requestData.value
          ? requestData.value.toLowerCase().trim()
          : existing.value,
        img: newImageUrl,
        price:
          requestData.price !== undefined ? requestData.price : existing.price,
        stock:
          requestData.stock !== undefined ? requestData.stock : existing.stock,
      },
      { new: true, runValidators: true }
    ).populate("optionTypeId", "name productId");

    if (!updated) {
      response.message = "Option value not found";
      response.statusCode = 404;
      return response;
    }

    response.optionValue = buildOptionValueResponse(updated);
    response.success = true;
    response.message = "Option value updated successfully";
    response.statusCode = 200;
    return response;
  } catch (err) {
    console.error("Update option value error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};

export const destroy = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    response.message = "Invalid option value ID";
    response.statusCode = 400;
    return response;
  }

  try {
    const optionValue = await OptionValue.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!optionValue) {
      response.message = "Option value not found";
      response.statusCode = 404;
      return response;
    }

    // Soft delete
    await OptionValue.findByIdAndUpdate(id, { deletedAt: new Date() });

    response.success = true;
    response.message = "Option value deleted successfully";
    response.statusCode = 200;
    return response;
  } catch (err) {
    console.error("Delete option value error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};

export const permanentDestroy = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    response.message = "Invalid option value ID";
    response.statusCode = 400;
    return response;
  }

  try {
    const optionValue = await OptionValue.findById(id);

    if (!optionValue) {
      response.message = "Option value not found";
      response.statusCode = 404;
      return response;
    }

    // Delete the image from ImageKit
    await deleteFromImageKit(optionValue.img);

    // Permanently delete the option value
    await OptionValue.findByIdAndDelete(id);

    response.success = true;
    response.message = "Option value permanently deleted";
    response.statusCode = 200;
    return response;
  } catch (err) {
    console.error("Permanent delete option value error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};
