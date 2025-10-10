import mongoose, { Document, Schema, Model } from "mongoose";
import { UserRole } from "./enums";

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true },
  },
  {
    discriminatorKey: "role",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  (() => {
    if (mongoose.models.User) {
      return mongoose.models.User as Model<IUser>;
    }
    return mongoose.model<IUser>("User", UserSchema);
  })();
