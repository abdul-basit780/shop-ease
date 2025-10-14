import mongoose, { Document, Schema, Model } from "mongoose";
import { OrderStatus } from "./enums";

export interface IOrder extends Document {
  _id: string;
  customerId: mongoose.Types.ObjectId;
  datetime: Date;
  status: OrderStatus;
  totalAmount: number;
  products: Array<{ productId: mongoose.Types.ObjectId; quantity: number, price: number, name: string, img: string }>;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    datetime: { type: Date, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    products: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true, min: 1 },
          price: { type: Number, required: true, min: 0 },
          name: { type: String, required: true },
          img: { type: String, required: true },
        },
      ],
      default: [],
    },
    address: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

OrderSchema.index({ customerId: 1 });
OrderSchema.index({ datetime: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ totalAmount: -1 });

export const Order: Model<IOrder> =
  (mongoose.models.Order as Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);
