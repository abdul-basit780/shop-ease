// lib/utils/feedback.ts

// Feedback messages
export const FEEDBACK_MESSAGES = {
  CREATED: "Feedback created successfully",
  UPDATED: "Feedback updated successfully",
  DELETED: "Feedback deleted successfully",
  RETRIEVED: "Feedbacks retrieved successfully",
  NOT_FOUND: "Feedback not found",
  ALREADY_REVIEWED: "You have already reviewed this product",
  PRODUCT_NOT_PURCHASED: "You can only review products you have purchased",
  ORDER_NOT_FOUND: "Order not found or not completed",
  INVALID_PRODUCT_ID: "Invalid product ID",
  INVALID_ORDER_ID: "Invalid order ID",
  INVALID_FEEDBACK_ID: "Invalid feedback ID",
  CREATE_FAILED: "Failed to create feedback",
  UPDATE_FAILED: "Failed to update feedback",
  DELETE_FAILED: "Failed to delete feedback",
  FETCH_FAILED: "Failed to fetch feedbacks",
};

export const validateCreateFeedback = (data: any) => {
  const errors: string[] = [];

  if (!data.productId || typeof data.productId !== "string") {
    errors.push("Product ID is required and must be a valid string");
  }

  if (!data.orderId || typeof data.orderId !== "string") {
    errors.push("Order ID is required and must be a valid string");
  }

  if (!data.rating || typeof data.rating !== "number") {
    errors.push("Rating is required and must be a number");
  } else if (data.rating < 1 || data.rating > 5) {
    errors.push("Rating must be between 1 and 5");
  }

  if (!data.comment || typeof data.comment !== "string") {
    errors.push("Comment is required and must be a string");
  } else if (data.comment.trim().length < 10) {
    errors.push("Comment must be at least 10 characters long");
  } else if (data.comment.trim().length > 1000) {
    errors.push("Comment must not exceed 1000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUpdateFeedback = (data: any) => {
  const errors: string[] = [];

  if (data.rating !== undefined) {
    if (typeof data.rating !== "number") {
      errors.push("Rating must be a number");
    } else if (data.rating < 1 || data.rating > 5) {
      errors.push("Rating must be between 1 and 5");
    }
  }

  if (data.comment !== undefined) {
    if (typeof data.comment !== "string") {
      errors.push("Comment must be a string");
    } else if (data.comment.trim().length < 10) {
      errors.push("Comment must be at least 10 characters long");
    } else if (data.comment.trim().length > 1000) {
      errors.push("Comment must not exceed 1000 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Build feedback-specific filter
export const buildFeedbackFilter = (
  params: any,
  productId?: string,
  customerId?: string
) => {
  const filter: any = {};

  if (productId) {
    filter.productId = productId;
  }

  if (customerId) {
    filter.customerId = customerId;
  }

  return filter;
};

// Build feedback-specific sort
export const buildFeedbackSort = (params: any): Record<string, 1 | -1> => {
  const sortBy = params.sortBy || "createdAt";
  const sortOrder = params.sortOrder === "asc" ? 1 : -1;

  // Validate sortBy field
  const validSortFields = ["createdAt", "rating", "updatedAt"];
  if (!validSortFields.includes(sortBy)) {
    return { createdAt: -1 as const }; // Default sort
  }

  return { [sortBy]: sortOrder };
};
