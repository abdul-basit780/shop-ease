import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICart extends Document {
  _id: string;
  customerId: mongoose.Types.ObjectId;
  products: Array<{ productId: mongoose.Types.ObjectId; quantity: number }>;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: {
      type: [
        {
          productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      default: [],
    },
    totalAmount: { type: Number, required: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

export const Cart: Model<ICart> =
  (mongoose.models.Cart as Model<ICart>) ||
  mongoose.model<ICart>("Cart", CartSchema);
