import mongoose, { Document, Model, Schema } from "mongoose";

export interface IWishlistProduct {
  productId: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  _id: string;
  customerId: mongoose.Types.ObjectId;
  products: IWishlistProduct[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

// Ensure each customer has only one wishlist
WishlistSchema.index({ customerId: 1 }, { unique: true });

// Optimize quick membership checks (customer + product)
WishlistSchema.index({ customerId: 1, "products.productId": 1 });

// Optional: for analytics (e.g., most wishlisted products)
WishlistSchema.index({ "products.productId": 1 });

// Count of products in wishlist
WishlistSchema.virtual("count").get(function () {
  return this.products?.length || 0;
});

WishlistSchema.statics.createIfNotExist = async function (
  customerId: mongoose.Types.ObjectId
) {
  let wishlist = await this.findOne({ customerId });
  if (!wishlist) {
    wishlist = await this.create({ customerId, products: [] });
  }
  return wishlist;
};

WishlistSchema.statics.addProduct = async function (
  customerId: mongoose.Types.ObjectId,
  productId: mongoose.Types.ObjectId
) {
  return this.findOneAndUpdate(
    { customerId },
    { $addToSet: { products: { productId, addedAt: new Date() } } },
    { upsert: true, new: true }
  );
};

WishlistSchema.statics.removeProduct = async function (
  customerId: mongoose.Types.ObjectId,
  productId: mongoose.Types.ObjectId
) {
  return this.findOneAndUpdate(
    { customerId },
    { $pull: { products: { productId } } },
    { new: true }
  );
};

WishlistSchema.statics.clearAll = async function (
  customerId: mongoose.Types.ObjectId
) {
  return this.findOneAndUpdate(
    { customerId },
    { $set: { products: [] } },
    { new: true }
  );
};

export const Wishlist: Model<IWishlist> =
  (mongoose.models.Wishlist as Model<IWishlist>) ||
  mongoose.model<IWishlist>("Wishlist", WishlistSchema);
