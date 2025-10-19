// lib/models/Category.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  name: string;
  description: string;
  parentId: string | null; // Reference to parent category
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Add indexes for better query performance
CategorySchema.index({ deletedAt: 1 });
CategorySchema.index({ name: 1, deletedAt: 1 });
CategorySchema.index({ parentId: 1, deletedAt: 1 });

export const Category: Model<ICategory> =
  (mongoose.models.Category as Model<ICategory>) ||
  mongoose.model<ICategory>("Category", CategorySchema);
