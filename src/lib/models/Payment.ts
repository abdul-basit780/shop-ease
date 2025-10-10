import mongoose, { Document, Model, Schema } from "mongoose";
import { PaymentStatus } from "./enums";

export interface IPayment extends Document {
  _id: string;
  paymentId: string | null;
  orderId: mongoose.Types.ObjectId;
  method: string;
  date: Date;
  status: PaymentStatus;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    method: { type: String, required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paymentId: { type: String, default: null },
    amount: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

export const Payment: Model<IPayment> =
  (mongoose.models.Payment as Model<IPayment>) ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
