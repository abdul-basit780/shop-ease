// lib/models/Category.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  name: string;
  description: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Add index for better query performance on deletedAt
CategorySchema.index({ deletedAt: 1 });
CategorySchema.index({ name: 1, deletedAt: 1 });

export const Category: Model<ICategory> =
  (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>("Category", CategorySchema);
