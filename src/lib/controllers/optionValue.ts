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
} from "../utils/option";

interface Response {
  success: boolean;
  message: string;
  optionValues?: OptionValueResponse[];
  optionValue?: OptionValueResponse;
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
    optionValues: [],
    statusCode: 500,
  };

  try {
    const filter: any = { deletedAt: null };

    // Filter by optionTypeId if provided
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

  const requestData: OptionValueRequest = req.body;

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

  try {
    // Check if option type exists
    const optionType = await OptionType.findOne({
      _id: requestData.optionTypeId,
      deletedAt: null,
    });

    if (!optionType) {
      response.message = "Option type not found";
      response.statusCode = 404;
      return response;
    }

    // Check for duplicates (same value for same type)
    const existing = await OptionValue.findOne({
      optionTypeId: requestData.optionTypeId,
      value: requestData.value.toLowerCase().trim(),
      deletedAt: null,
    });

    if (existing) {
      response.message = "Option value already exists for this type";
      response.statusCode = 409;
      return response;
    }

    const newOptionValue = await OptionValue.create({
      optionTypeId: requestData.optionTypeId,
      value: requestData.value.toLowerCase().trim(),
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

  const requestData: OptionValueRequest = req.body;

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

  try {
    const existing = await OptionValue.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!existing) {
      response.message = "Option value not found";
      response.statusCode = 404;
      return response;
    }

    // Check if option type exists
    const optionType = await OptionType.findOne({
      _id: requestData.optionTypeId,
      deletedAt: null,
    });

    if (!optionType) {
      response.message = "Option type not found";
      response.statusCode = 404;
      return response;
    }

    // Check for duplicate value
    const valueExists = await OptionValue.findOne({
      optionTypeId: requestData.optionTypeId,
      value: requestData.value.toLowerCase().trim(),
      _id: { $ne: id },
      deletedAt: null,
    });

    if (valueExists) {
      response.message = "Option value already exists for this type";
      response.statusCode = 409;
      return response;
    }

    const updated = await OptionValue.findByIdAndUpdate(
      id,
      {
        optionTypeId: requestData.optionTypeId,
        value: requestData.value.toLowerCase().trim(),
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
