import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFeedback extends Document {
  _id: string;
  productId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
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
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

export const Feedback: Model<IFeedback> =
  (mongoose.models.Feedback as Model<IFeedback>) ||
  mongoose.model<IFeedback>("Feedback", FeedbackSchema);
