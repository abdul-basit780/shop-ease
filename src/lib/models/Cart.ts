// lib/models/Cart.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICartProduct {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  selectedOptions?: mongoose.Types.ObjectId[];
}

export interface ICart extends Document {
  _id: string;
  customerId: mongoose.Types.ObjectId;
  products: ICartProduct[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartProductSchema = new Schema<ICartProduct>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    selectedOptions: [
      {
        type: Schema.Types.ObjectId,
        ref: "OptionValue",
      },
    ],
  },
  { _id: false }
);

const CartSchema = new Schema<ICart>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: {
      type: [CartProductSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Index for efficient queries
CartSchema.index({ customerId: 1 });

export const Cart: Model<ICart> =
  (mongoose.models.Cart as Model<ICart>) ||
  mongoose.model<ICart>("Cart", CartSchema);
