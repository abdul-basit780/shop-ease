// lib/controllers/adminFeedback.ts
import { NextApiResponse } from "next";
import mongoose from "mongoose";
import { Feedback } from "@/lib/models/Feedback";
import { AuthenticatedRequest } from "@/lib/middleware/auth";
import { FEEDBACK_MESSAGES, buildFeedbackSort } from "@/lib/utils/feedback";
import { buildPaginationParams, calculatePagination } from "@/lib/utils/common";
import connectToDatabase from "@/lib/db/mongodb";

interface AdminFeedbackResponse {
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

// Build admin-specific filter with more options
const buildAdminFeedbackFilter = (params: any) => {
  const filter: any = {};

  // Filter by product
  if (params.productId && mongoose.Types.ObjectId.isValid(params.productId)) {
    filter.productId = params.productId;
  }

  // Filter by customer
  if (params.customerId && mongoose.Types.ObjectId.isValid(params.customerId)) {
    filter.customerId = params.customerId;
  }

  // Filter by rating
  if (params.rating) {
    const rating = parseInt(params.rating);
    if (rating >= 1 && rating <= 5) {
      filter.rating = rating;
    }
  }

  // Filter by rating range
  if (params.minRating) {
    const minRating = parseInt(params.minRating);
    if (minRating >= 1 && minRating <= 5) {
      filter.rating = { ...filter.rating, $gte: minRating };
    }
  }
  if (params.maxRating) {
    const maxRating = parseInt(params.maxRating);
    if (maxRating >= 1 && maxRating <= 5) {
      filter.rating = { ...filter.rating, $lte: maxRating };
    }
  }

  // Filter by date range
  if (params.startDate || params.endDate) {
    filter.createdAt = {};
    if (params.startDate) {
      filter.createdAt.$gte = new Date(params.startDate);
    }
    if (params.endDate) {
      filter.createdAt.$lte = new Date(params.endDate);
    }
  }

  // Search in comments
  if (params.search) {
    filter.comment = { $regex: params.search, $options: "i" };
  }

  return filter;
};

// List all feedbacks (Admin)
export const adminIndex = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<AdminFeedbackResponse> => {
  await connectToDatabase();

  const feedbackResponse: AdminFeedbackResponse = {
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
    const params = buildPaginationParams(req.query);
    const { pageNum, limitNum, skip, pagination } = calculatePagination(
      params.page,
      params.limit,
      0
    );

    const filter = buildAdminFeedbackFilter(req.query);
    const sort = buildFeedbackSort(params);

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .populate("customerId", "name email")
        .populate("productId", "name images")
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .exec(),
      Feedback.countDocuments(filter),
    ]);

    const finalPagination = calculatePagination(
      params.page,
      params.limit,
      total
    );

    // Calculate statistics
    const stats = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingCounts: { $push: "$rating" },
        },
      },
    ]);

    const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (stats[0]?.ratingCounts) {
      stats[0].ratingCounts.forEach((rating: number) => {
        ratingBreakdown[rating as keyof typeof ratingBreakdown]++;
      });
    }

    feedbackResponse.success = true;
    feedbackResponse.message = FEEDBACK_MESSAGES.RETRIEVED;
    feedbackResponse.data = feedbacks;
    feedbackResponse.stats = {
      averageRating: stats[0]?.avgRating
        ? Math.round(stats[0].avgRating * 10) / 10
        : 0,
      totalReviews: stats[0]?.totalReviews || 0,
      ratingBreakdown,
    };
    feedbackResponse.pagination = finalPagination.pagination;
    feedbackResponse.statusCode = 200;

    return feedbackResponse;
  } catch (error: any) {
    console.error("Admin get feedbacks error:", error);
    feedbackResponse.message = FEEDBACK_MESSAGES.FETCH_FAILED;
    feedbackResponse.statusCode = 500;
    return feedbackResponse;
  }
};

// Get single feedback (Admin)
export const adminShow = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<AdminFeedbackResponse> => {
  await connectToDatabase();

  const feedbackResponse: AdminFeedbackResponse = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      feedbackResponse.message = FEEDBACK_MESSAGES.INVALID_FEEDBACK_ID;
      feedbackResponse.statusCode = 400;
      return feedbackResponse;
    }

    const feedback = await Feedback.findById(id)
      .populate("customerId", "name email phone")
      .populate("productId", "name images price")
      .populate("orderId");

    if (!feedback) {
      feedbackResponse.message = FEEDBACK_MESSAGES.NOT_FOUND;
      feedbackResponse.statusCode = 404;
      return feedbackResponse;
    }

    feedbackResponse.success = true;
    feedbackResponse.message = FEEDBACK_MESSAGES.RETRIEVED;
    feedbackResponse.data = feedback;
    feedbackResponse.statusCode = 200;

    return feedbackResponse;
  } catch (error: any) {
    console.error("Admin get feedback error:", error);
    feedbackResponse.message = FEEDBACK_MESSAGES.FETCH_FAILED;
    feedbackResponse.statusCode = 500;
    return feedbackResponse;
  }
};

// Delete feedback (Admin)
export const adminDestroy = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
): Promise<AdminFeedbackResponse> => {
  await connectToDatabase();

  const feedbackResponse: AdminFeedbackResponse = {
    success: false,
    message: "",
    statusCode: 500,
  };

  try {
    const { id } = req.query;

    if (!id || typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      feedbackResponse.message = FEEDBACK_MESSAGES.INVALID_FEEDBACK_ID;
      feedbackResponse.statusCode = 400;
      return feedbackResponse;
    }

    const feedback = await Feedback.findByIdAndDelete(id);

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
    console.error("Admin delete feedback error:", error);
    feedbackResponse.message = FEEDBACK_MESSAGES.DELETE_FAILED;
    feedbackResponse.statusCode = 500;
    return feedbackResponse;
  }
};
