// lib/models/Feedback.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFeedback extends Document {
  _id: string;
  productId: mongoose.Types.ObjectId;
  productName: string;
  customerId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Ensure one feedback per product per customer
FeedbackSchema.index({ productId: 1, customerId: 1 }, { unique: true });

// Index for fetching product feedbacks
FeedbackSchema.index({ productId: 1, createdAt: -1 });

export const Feedback: Model<IFeedback> =
  (mongoose.models.Feedback as Model<IFeedback>) ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
