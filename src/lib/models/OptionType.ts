// lib/models/OptionType.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOptionType extends Document {
  _id: string;
  productId: mongoose.Types.ObjectId;
  name: string;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OptionTypeSchema = new Schema<IOptionType>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Indexes
OptionTypeSchema.index({ deletedAt: 1 });
OptionTypeSchema.index({ productId: 1, deletedAt: 1 });
// Same option type name can exist for different products
OptionTypeSchema.index(
  { productId: 1, name: 1, deletedAt: 1 },
  { unique: true }
);

export const OptionType: Model<IOptionType> =
  (mongoose.models.OptionType as Model<IOptionType>) ||
  mongoose.model<IOptionType>("OptionType", OptionTypeSchema);
