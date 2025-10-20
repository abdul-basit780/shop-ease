// lib/models/OptionValue.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOptionValue extends Document {
  _id: string;
  optionTypeId: mongoose.Types.ObjectId;
  value: string;
  price: number;
  stock: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OptionValueSchema = new Schema<IOptionValue>(
  {
    optionTypeId: {
      type: Schema.Types.ObjectId,
      ref: "OptionType",
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Unique combination: same value can't exist twice for same option type
OptionValueSchema.index(
  { optionTypeId: 1, value: 1, deletedAt: 1 },
  { unique: true }
);
OptionValueSchema.index({ deletedAt: 1 });
OptionValueSchema.index({ stock: 1 });

export const OptionValue: Model<IOptionValue> =
  (mongoose.models.OptionValue as Model<IOptionValue>) ||
  mongoose.model<IOptionValue>("OptionValue", OptionValueSchema);
