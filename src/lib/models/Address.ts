import mongoose, { Schema, Model } from "mongoose";

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  customerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
});

// Virtual for full address
AddressSchema.virtual("full").get(function () {
  return `${this.street}, ${this.city}, ${this.state} ${this.zipCode}`;
});

AddressSchema.index({ customerId: 1 });

export const Address: Model<IAddress> =
  (mongoose.models.Address as Model<IAddress>) ||
  (() => {
    if (mongoose.models.Address) {
      return mongoose.models.Address as Model<IAddress>;
    }
    return mongoose.model<IAddress>("Address", AddressSchema);
  })();
