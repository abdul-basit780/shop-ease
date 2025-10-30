// lib/controllers/customer.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import connectToDatabase from "../db/mongodb";
import {
  buildMongoFilter,
  buildMongoSort,
  buildPaginationParams,
  calculatePagination,
} from "../utils/common";
import { buildCustomerResponse, CustomerResponse } from "../utils/customer";
import { Customer } from "../models/Customer";
import { isValidObjectId } from "mongoose";

interface Response {
  success: boolean;
  message: string;
  customers?: CustomerResponse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  customer?: CustomerResponse;
  statusCode: number | undefined;
}

interface UpdateCustomerStatusRequest {
  isActive: boolean;
}

export const index = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const customerResponse: Response = {
    success: false,
    message: "",
    customers: [],
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
    0 // Will be updated after count
  );

  // Build filter and sort objects (will exclude soft-deleted by default)
  const filter = buildMongoFilter(params);

  // Support filtering by active status
  if (req.query.isActive !== undefined) {
    if (req.query.isActive === "true" || req.query.isActive === "false") {
      filter.isActive = req.query.isActive === "true";
    }
  }

  const sort = buildMongoSort(params);

  try {
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort(sort).skip(skip).limit(limitNum).exec(),
      Customer.countDocuments(filter),
    ]);

    // Recalculate pagination with actual total
    const finalPagination = calculatePagination(
      params.page,
      params.limit,
      total
    );

    const responseCustomers = customers.map(buildCustomerResponse);

    customerResponse.success = true;
    customerResponse.message = "Customers retrieved successfully";
    customerResponse.customers = responseCustomers;
    customerResponse.pagination = finalPagination.pagination;
    customerResponse.statusCode = 200;

    return customerResponse;
  } catch (err) {
    console.error("Get customers error:", err);
    customerResponse.message = "Internal server error";
    customerResponse.statusCode = 500;
    return customerResponse;
  }
};

export const show = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  await connectToDatabase();

  const customerResponse: Response = {
    success: false,
    message: "",
    customer: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!id) {
    return customerResponse;
  }

  if (!isValidObjectId(id)) {
    customerResponse.message = "Invalid customer ID";
    customerResponse.statusCode = 400;
    return customerResponse;
  }

  try {
    const customer = await Customer.findById(id).exec();

    if (!customer) {
      customerResponse.message = "Customer not found";
      customerResponse.statusCode = 404;
      return customerResponse;
    }

    customerResponse.success = true;
    customerResponse.message = "Customer retrieved successfully";
    customerResponse.customer = buildCustomerResponse(customer);
    customerResponse.statusCode = 200;

    return customerResponse;
  } catch (err) {
    console.error("Get customer error:", err);
    customerResponse.message = "Internal server error";
    customerResponse.statusCode = 500;
    return customerResponse;
  }
};

export const updateStatus = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const customerResponse: Response = {
    success: false,
    message: "",
    customer: undefined,
    statusCode: 500,
  };

  const { id } = req.query;

  if (!id) {
    return customerResponse;
  }

  if (!isValidObjectId(id)) {
    customerResponse.message = "Invalid customer ID";
    customerResponse.statusCode = 400;
    return customerResponse;
  }

  const { isActive }: UpdateCustomerStatusRequest = req.body;

  const errors: string[] = [];

  // Validate required fields
  if (typeof isActive !== "boolean") {
    errors.push("isActive field is required and must be a boolean");
  }

  if (errors.length > 0) {
    customerResponse.message = errors.join(", ");
    customerResponse.statusCode = 400;
    return customerResponse;
  }

  try {
    // Find the customer
    const customer = await Customer.findById(id);
    if (!customer) {
      customerResponse.message = "Customer not found";
      customerResponse.statusCode = 404;
      return customerResponse;
    }

    // Check if status is already the same
    if (customer.isActive === isActive) {
      customerResponse.message = "Customer already has the requested status";
      customerResponse.statusCode = 409;
      return customerResponse;
    }

    // Update customer status
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      customerResponse.message = "Failed to update customer status";
      customerResponse.statusCode = 500;
      return customerResponse;
    }

    customerResponse.success = true;
    customerResponse.message = "Customer status updated successfully";
    customerResponse.customer = buildCustomerResponse(updatedCustomer);
    customerResponse.statusCode = 200;

    return customerResponse;
  } catch (err) {
    console.error("Update customer status error:", err);
    customerResponse.message = "Internal server error";
    customerResponse.statusCode = 500;
    return customerResponse;
  }
};
