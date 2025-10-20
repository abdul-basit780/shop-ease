// lib/models/Product.ts (Simplified)
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IProduct extends Document {
  _id: string;
  name: string;
  price: number; // Base price
  stock: number; // Product stock (used when no options selected)
  img: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true }, // Base price
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    img: { type: String, required: true },
    description: { type: String, required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

ProductSchema.index({ deletedAt: 1 });
ProductSchema.index({ name: 1, deletedAt: 1 });
ProductSchema.index({ categoryId: 1, deletedAt: 1 });
ProductSchema.index({ stock: 1 });

export const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);
