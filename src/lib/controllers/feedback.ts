// lib/controllers/feedback.ts
import { NextApiResponse } from "next";
import mongoose from "mongoose";
import { Feedback } from "@/lib/models/Feedback";
import { Order } from "@/lib/models/Order";
import { OrderStatus } from "@/lib/models/enums";
import { AuthenticatedRequest } from "@/lib/middleware/auth";
import {
  validateCreateFeedback,
  validateUpdateFeedback,
  FEEDBACK_MESSAGES,
  buildFeedbackFilter,
  buildFeedbackSort,
} from "@/lib/utils/feedback";
import { buildPaginationParams, calculatePagination } from "@/lib/utils/common";
import connectToDatabase from "@/lib/db/mongodb";

interface FeedbackResponse {
  success: boolean;
  message: string;
  data?: any;
  stats?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  statusCode: number;
}

// Create feedback (Customer only)
export const createFeedback = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<FeedbackResponse> => {
  await connectToDatabase();

  const feedbackResponse: FeedbackResponse = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.userId;

    // Validate input
    const validation = validateCreateFeedback(req.body);
    if (!validation.isValid) {
      feedbackResponse.message = validation.errors.join(", ");
      feedbackResponse.statusCode = 400;
      return feedbackResponse;
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      feedbackResponse.message = FEEDBACK_MESSAGES.INVALID_PRODUCT_ID;
      feedbackResponse.statusCode = 400;
      return feedbackResponse;
    }

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      feedbackResponse.message = FEEDBACK_MESSAGES.INVALID_ORDER_ID;
      feedbackResponse.statusCode = 400;
      return feedbackResponse;
    }

    // Verify order exists and belongs to customer
    const order = await Order.findOne({
      _id: orderId,
      customerId: userId,
      status: OrderStatus.COMPLETED,
    });

    if (!order) {
      feedbackResponse.message = FEEDBACK_MESSAGES.ORDER_NOT_FOUND;
      feedbackResponse.statusCode = 403;
      return feedbackResponse;
    }

    // Verify product is in the order
    const orderProduct = order.products.find(
      (product: any) => product.productId.toString() === productId
    );

    if (!orderProduct) {
      feedbackResponse.message = FEEDBACK_MESSAGES.PRODUCT_NOT_PURCHASED;
      feedbackResponse.statusCode = 403;
      return feedbackResponse;
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({
      productId,
      customerId: userId,
    });

    if (existingFeedback) {
      feedbackResponse.message = FEEDBACK_MESSAGES.ALREADY_REVIEWED;
      feedbackResponse.statusCode = 409;
      return feedbackResponse;
    }

    // Create feedback
    const feedback = await Feedback.create({
      productId,
      productName: orderProduct.name,
      customerId: userId,
      orderId,
      rating,
      comment: comment.trim(),
    });

    await feedback.populate("customerId", "name email");

    feedbackResponse.success = true;
    feedbackResponse.message = FEEDBACK_MESSAGES.CREATED;
    feedbackResponse.data = feedback;
    feedbackResponse.statusCode = 201;

    return feedbackResponse;
  } catch (error: any) {
    console.error("Create feedback error:", error);
    feedbackResponse.message = FEEDBACK_MESSAGES.CREATE_FAILED;
    feedbackResponse.statusCode = 500;
    return feedbackResponse;
  }
};

// Get customer's own feedbacks
export const getMyFeedbacks = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<FeedbackResponse> => {
  await connectToDatabase();

  const feedbackResponse: FeedbackResponse = {
    success: false,
    message: "",
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

  try {
    const userId = req.user.userId;

    const params = buildPaginationParams(req.query);
    const { pageNum, limitNum, skip, pagination } = calculatePagination(
      params.page,
      params.limit,
      0 // Will be updated after count
    );

    // Build filter and sort
    const filter = buildFeedbackFilter(params, undefined, userId);
    const sort = buildFeedbackSort(params);

    // Fetch feedbacks and total count
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .populate("productId", "name images")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Feedback.countDocuments(filter),
    ]);

    // Recalculate pagination with actual total
    const finalPagination = calculatePagination(
      params.page,
      params.limit,
      total
    );

    feedbackResponse.success = true;
    feedbackResponse.message = FEEDBACK_MESSAGES.RETRIEVED;
    feedbackResponse.data = feedbacks;
    feedbackResponse.pagination = finalPagination.pagination;
    feedbackResponse.statusCode = 200;

    return feedbackResponse;
  } catch (error: any) {
    console.error("Get my feedbacks error:", error);
    feedbackResponse.message = FEEDBACK_MESSAGES.FETCH_FAILED;
    feedbackResponse.statusCode = 500;
    return feedbackResponse;
  }
};

// Update customer's own feedback
export const updateMyFeedback = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<FeedbackResponse> => {
  await connectToDatabase();

  const feedbackResponse: FeedbackResponse = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    const userId = req.user.userId;
    const feedbackId = req.query.id as string;
    const { rating, comment } = req.body;

    // Validate input
    const validation = validateUpdateFeedback(req.body);
    if (!validation.isValid) {
      feedbackResponse.message = validation.errors.join(", ");
      feedbackResponse.statusCode = 400;
      return feedbackResponse;
    }

    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
      feedbackResponse.message = FEEDBACK_MESSAGES.INVALID_FEEDBACK_ID;
      feedbackResponse.statusCode = 400;
      return feedbackResponse;
    }

    // Find feedback
    const feedback = await Feedback.findOne({
      _id: feedbackId,
      customerId: userId,
    });

    if (!feedback) {
      feedbackResponse.message = FEEDBACK_MESSAGES.NOT_FOUND;
      feedbackResponse.statusCode = 404;
      return feedbackResponse;
    }

    // Update fields
    if (rating !== undefined) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment.trim();

    await feedback.save();
    await feedback.populate("customerId", "name email");

    feedbackResponse.success = true;
    feedbackResponse.message = FEEDBACK_MESSAGES.UPDATED;
    feedbackResponse.data = feedback;
    feedbackResponse.statusCode = 200;

    return feedbackResponse;
  } catch (error: any) {
    console.error("Update feedback error:", error);
    feedbackResponse.message = FEEDBACK_MESSAGES.UPDATE_FAILED;
    feedbackResponse.statusCode = 500;
    return feedbackResponse;
  }
};

// Delete customer's own feedback
export const deleteMyFeedback = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<FeedbackResponse> => {
  await connectToDatabase();

  const feedbackResponse: FeedbackResponse = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    const userId = req.user.userId;
    const feedbackId = req.query.id as string;

    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
      feedbackResponse.message = FEEDBACK_MESSAGES.INVALID_FEEDBACK_ID;
      feedbackResponse.statusCode = 400;
      return feedbackResponse;
    }

    const feedback = await Feedback.findOneAndDelete({
      _id: feedbackId,
      customerId: userId,
    });

    if (!feedback) {
      feedbackResponse.message = FEEDBACK_MESSAGES.NOT_FOUND;
      feedbackResponse.statusCode = 404;
      return feedbackResponse;
    }

    feedbackResponse.success = true;
    feedbackResponse.message = FEEDBACK_MESSAGES.DELETED;
    feedbackResponse.statusCode = 200;

    return feedbackResponse;
  } catch (error: any) {
    console.error("Delete feedback error:", error);
    feedbackResponse.message = FEEDBACK_MESSAGES.DELETE_FAILED;
    feedbackResponse.statusCode = 500;
    return feedbackResponse;
  }
};

// Get feedbacks for a specific product (Public)
export const getProductFeedbacks = async (
  req: any,
  res: NextApiResponse
): Promise<FeedbackResponse> => {
  await connectToDatabase();

  const feedbackResponse: FeedbackResponse = {
    success: false,
    message: "",
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

  try {
    const productId = req.query.id as string;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      feedbackResponse.message = FEEDBACK_MESSAGES.INVALID_PRODUCT_ID;
      feedbackResponse.statusCode = 400;
      return feedbackResponse;
    }

    const params = buildPaginationParams(req.query);
    const { pageNum, limitNum, skip, pagination } = calculatePagination(
      params.page,
      params.limit,
      0 // Will be updated after count
    );

    // Build filter and sort
    const filter = buildFeedbackFilter(params, productId);
    const sort = buildFeedbackSort(params);

    // Fetch feedbacks and total count
    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .populate("customerId", "name")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Feedback.countDocuments(filter),
    ]);

    // Recalculate pagination with actual total
    const finalPagination = calculatePagination(
      params.page,
      params.limit,
      total
    );

    // Calculate average rating and breakdown
    const ratingStats = await Feedback.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingCounts: {
            $push: "$rating",
          },
        },
      },
    ]);

    const stats = ratingStats[0] || {
      avgRating: 0,
      totalReviews: 0,
    };

    // Count ratings by star
    const ratingBreakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (stats.ratingCounts) {
      stats.ratingCounts.forEach((rating: number) => {
        ratingBreakdown[rating as keyof typeof ratingBreakdown]++;
      });
    }

    feedbackResponse.success = true;
    feedbackResponse.message = FEEDBACK_MESSAGES.RETRIEVED;
    feedbackResponse.data = feedbacks;
    feedbackResponse.stats = {
      averageRating: Math.round(stats.avgRating * 10) / 10,
      totalReviews: stats.totalReviews,
      ratingBreakdown,
    };
    feedbackResponse.pagination = finalPagination.pagination;
    feedbackResponse.statusCode = 200;

    return feedbackResponse;
  } catch (error: any) {
    console.error("Get product feedbacks error:", error);
    feedbackResponse.message = FEEDBACK_MESSAGES.FETCH_FAILED;
    feedbackResponse.statusCode = 500;
    return feedbackResponse;
  }
};
