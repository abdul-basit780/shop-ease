// lib/controllers/optionType.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { OptionType } from "../models/OptionType";
import { Product } from "../models/Product";
import connectToDatabase from "../db/mongodb";
import { isValidObjectId } from "mongoose";
import {
  buildOptionTypeResponse,
  OptionTypeResponse,
  OptionTypeRequest,
  validateOptionTypeRequest,
} from "../utils/option";

interface Response {
  success: boolean;
  message: string;
  optionTypes?: OptionTypeResponse[];
  optionType?: OptionTypeResponse;
  statusCode: number | undefined;
}

export const index = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const response: Response = {
    success: false,
    message: "",
    optionTypes: [],
    statusCode: 500,
  };

  try {
    const filter: any = { deletedAt: null };

    // Filter by productId if provided
    if (req.query.productId && isValidObjectId(req.query.productId)) {
      filter.productId = req.query.productId;
    }

    const optionTypes = await OptionType.find(filter)
      .populate("productId", "name")
      .sort({ name: 1 });

    response.success = true;
    response.message = "Option types retrieved successfully";
    response.optionTypes = optionTypes.map(buildOptionTypeResponse);
    response.statusCode = 200;

    return response;
  } catch (err) {
    console.error("Get option types error:", err);
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
    optionType: undefined,
    statusCode: 500,
  };

  const requestData: OptionTypeRequest = req.body;

  const validationErrors = validateOptionTypeRequest(requestData);
  if (validationErrors.length > 0) {
    response.message = validationErrors.join(", ");
    response.statusCode = 400;
    return response;
  }

  if (!isValidObjectId(requestData.productId)) {
    response.message = "Invalid product ID";
    response.statusCode = 400;
    return response;
  }

  try {
    // Check if product exists
    const product = await Product.findOne({
      _id: requestData.productId,
      deletedAt: null,
    });

    if (!product) {
      response.message = "Product not found";
      response.statusCode = 404;
      return response;
    }

    // Check for duplicate option type name for this product
    const existing = await OptionType.findOne({
      productId: requestData.productId,
      name: requestData.name.toLowerCase().trim(),
      deletedAt: null,
    });

    if (existing) {
      response.message =
        "Option type with this name already exists for this product";
      response.statusCode = 409;
      return response;
    }

    const newOptionType = await OptionType.create({
      productId: requestData.productId,
      name: requestData.name.toLowerCase().trim(),
    });

    await newOptionType.populate("productId", "name");

    response.optionType = buildOptionTypeResponse(newOptionType);
    response.success = true;
    response.message = "Option type created successfully";
    response.statusCode = 201;
    return response;
  } catch (err) {
    console.error("Create option type error:", err);
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
    optionType: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    response.message = "Invalid option type ID";
    response.statusCode = 400;
    return response;
  }

  try {
    const optionType = await OptionType.findOne({
      _id: id,
      deletedAt: null,
    }).populate("productId", "name");

    if (!optionType) {
      response.message = "Option type not found";
      response.statusCode = 404;
      return response;
    }

    response.optionType = buildOptionTypeResponse(optionType);
    response.success = true;
    response.message = "Option type retrieved successfully";
    response.statusCode = 200;
    return response;
  } catch (err) {
    console.error("Get option type error:", err);
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
    optionType: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!isValidObjectId(id)) {
    response.message = "Invalid option type ID";
    response.statusCode = 400;
    return response;
  }

  const requestData: OptionTypeRequest = req.body;

  const validationErrors = validateOptionTypeRequest(requestData);
  if (validationErrors.length > 0) {
    response.message = validationErrors.join(", ");
    response.statusCode = 400;
    return response;
  }

  if (!isValidObjectId(requestData.productId)) {
    response.message = "Invalid product ID";
    response.statusCode = 400;
    return response;
  }

  try {
    const existing = await OptionType.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!existing) {
      response.message = "Option type not found";
      response.statusCode = 404;
      return response;
    }

    // Check if product exists
    const product = await Product.findOne({
      _id: requestData.productId,
      deletedAt: null,
    });

    if (!product) {
      response.message = "Product not found";
      response.statusCode = 404;
      return response;
    }

    // Check for duplicate name for this product
    const nameExists = await OptionType.findOne({
      productId: requestData.productId,
      name: requestData.name.toLowerCase().trim(),
      _id: { $ne: id },
      deletedAt: null,
    });

    if (nameExists) {
      response.message = "Option type name already exists for this product";
      response.statusCode = 409;
      return response;
    }

    const updated = await OptionType.findByIdAndUpdate(
      id,
      {
        productId: requestData.productId,
        name: requestData.name.toLowerCase().trim(),
      },
      { new: true, runValidators: true }
    ).populate("productId", "name");

    if (!updated) {
      response.message = "Option type not found";
      response.statusCode = 404;
      return response;
    }

    response.optionType = buildOptionTypeResponse(updated);
    response.success = true;
    response.message = "Option type updated successfully";
    response.statusCode = 200;
    return response;
  } catch (err) {
    console.error("Update option type error:", err);
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
    response.message = "Invalid option type ID";
    response.statusCode = 400;
    return response;
  }

  try {
    const optionType = await OptionType.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!optionType) {
      response.message = "Option type not found";
      response.statusCode = 404;
      return response;
    }

    // Soft delete
    await OptionType.findByIdAndUpdate(id, { deletedAt: new Date() });

    response.success = true;
    response.message = "Option type deleted successfully";
    response.statusCode = 200;
    return response;
  } catch (err) {
    console.error("Delete option type error:", err);
    response.message = "Internal server error";
    response.statusCode = 500;
    return response;
  }
};
