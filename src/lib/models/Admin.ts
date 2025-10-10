// admin.model.ts
import mongoose, { Schema, Model } from "mongoose";
import { User } from "./User";
import type { IUser } from "./User";

export interface IAdmin extends IUser {
  lastLogin?: Date;
  loginAttempts?: number;
}

const AdminSchema = new Schema<IAdmin>({
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
});

export const Admin: Model<IAdmin> =
  (mongoose.models.Admin as Model<IAdmin>) ||
  (() => {
    if (User.discriminators && User.discriminators["admin"]) {
      return User.discriminators["admin"] as Model<IAdmin>;
    }
    return User.discriminator<IAdmin>("admin", AdminSchema);
  })();