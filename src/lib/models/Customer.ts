import mongoose, { Schema, Model } from "mongoose";
import { User } from "./User";
import { Gender } from "./enums";
import type { IUser } from "./User";

export interface ICustomer extends IUser {
  dob: Date;
  phone: string;
  gender: Gender;
  occupation?: string;
  isActive: boolean;
  isVerified: boolean;
  totalOrders?: number;
}

const CustomerSchema = new Schema<ICustomer>({
  dob: { type: Date, required: true },
  phone: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  gender: { type: String, enum: Object.values(Gender), required: true },
  occupation: { type: String },
  isVerified: { type: Boolean, default: false },
  totalOrders: { type: Number, default: 0 },
});

// Indexes for better performance
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ isVerified: 1 });
CustomerSchema.index({ isActive: 1 });
CustomerSchema.index({ createdAt: -1 });

// Virtual for age calculation
CustomerSchema.virtual("age").get(function () {
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

// Virtual for block status
CustomerSchema.virtual("isBlocked").get(function () {
  return !this.isActive;
});

// Virtual for current status
CustomerSchema.virtual("currentStatus").get(function () {
  if (!this.isActive) {
    return "blocked";
  }
  if (this.isVerified) {
    return "verified";
  }
  return "active";
});

// Static method to get customer statistics
CustomerSchema.statics.getcustomerStats = async function () {
  const [total, active, blocked, verified] = await Promise.all([
    this.countDocuments({}),
    this.countDocuments({ isActive: true }),
    this.countDocuments({ isActive: false }),
    this.countDocuments({ isVerified: true }),
  ]);

  return {
    total,
    active,
    blocked,
    verified,
    unverified: total - verified,
  };
};

export const Customer: Model<ICustomer> =
  (mongoose.models.customer as Model<ICustomer>) ||
  (() => {
    if (User.discriminators && User.discriminators["customer"]) {
      return User.discriminators["customer"] as Model<ICustomer>;
    }
    return User.discriminator<ICustomer>("customer", CustomerSchema);
  })();
