// lib/controllers/wishlist.ts
import { NextApiResponse } from "next";
import { AuthenticatedRequest } from "../middleware/auth";
import { Wishlist } from "../models/Wishlist";
import { Product } from "../models/Product";
import { OptionType } from "../models/OptionType";
import { OptionValue } from "../models/OptionValue";
import connectToDatabase from "../db/mongodb";
import mongoose from "mongoose";
import {
  buildWishlistResponse,
  validateProductId,
  isProductInWishlist,
  WISHLIST_MESSAGES,
  WishlistResponse,
  AddToWishlistRequest,
  RemoveFromWishlistRequest,
} from "../utils/wishlist";

interface Response {
  success: boolean;
  message: string;
  wishlist?: WishlistResponse;
  statusCode: number | undefined;
}

// Helper function to enrich wishlist response with option types
const enrichWishlistWithOptions = async (fullResponse: WishlistResponse): Promise<WishlistResponse> => {
  const productIds = fullResponse.products.map((p) => new mongoose.Types.ObjectId(p.productId));
  
  if (productIds.length > 0) {
    const optionTypes = await OptionType.find({
      productId: { $in: productIds },
      deletedAt: null,
    }).sort({ name: 1 });

    if (optionTypes.length > 0) {
      // Fetch option values for all option types
      const optionTypeIds = optionTypes.map((ot) => ot._id);
      const optionValues = await OptionValue.find({
        optionTypeId: { $in: optionTypeIds },
        deletedAt: null,
      }).sort({ value: 1 });

      // Group option values by option type and attach to products
      fullResponse.products = fullResponse.products.map((product) => {
        const productOptionTypes = optionTypes.filter(
          (ot) => ot.productId.toString() === product.productId
        );

        if (productOptionTypes.length > 0) {
          product.optionTypes = productOptionTypes.map((ot) => ({
            id: ot._id.toString(),
            name: ot.name,
            values: optionValues
              .filter((ov) => ov.optionTypeId.toString() === ot._id.toString())
              .map((ov) => ({
                id: ov._id.toString(),
                value: ov.value,
                img: ov.img,
                price: ov.price,
                stock: ov.stock,
              })),
          }));
        }

        return product;
      });
    }
  }

  return fullResponse;
};

// Get customer's wishlist with populated products
export const getWishlist = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const wishlistResponse: Response = {
    success: false,
    message: "",
    wishlist: undefined,
    statusCode: 500,
  };

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Create wishlist if it doesn't exist
    let wishlist = await Wishlist.findOne({ customerId })
      .populate({
        path: "products.productId",
        populate: {
          path: "categoryId",
          select: "name",
        },
      })
      .exec();

    if (!wishlist) {
      wishlist = await Wishlist.create({
        customerId,
        products: [],
      });
    }

    // Build full response with product details
    const fullResponse = buildWishlistResponse(wishlist);

    // Enrich with option types
    const enrichedResponse = await enrichWishlistWithOptions(fullResponse);

    wishlistResponse.wishlist = enrichedResponse;
    wishlistResponse.success = true;
    wishlistResponse.message =
      enrichedResponse.count > 0
        ? WISHLIST_MESSAGES.RETRIEVED
        : WISHLIST_MESSAGES.WISHLIST_EMPTY;
    wishlistResponse.statusCode = 200;

    return wishlistResponse;
  } catch (err) {
    console.error("Get wishlist error:", err);
    wishlistResponse.message = "Internal server error";
    wishlistResponse.statusCode = 500;
    return wishlistResponse;
  }
};

// Add single product to wishlist
export const addProduct = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const wishlistResponse: Response = {
    success: false,
    message: "",
    wishlist: undefined,
    statusCode: 500,
  };

  const { productId }: AddToWishlistRequest = req.body;

  // Validate product ID
  const validationErrors = validateProductId(productId);
  if (validationErrors.length > 0) {
    wishlistResponse.message = validationErrors.join(", ");
    wishlistResponse.statusCode = 400;
    return wishlistResponse;
  }

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Check if product exists and is not deleted
    const product = await Product.findOne({
      _id: productId,
      deletedAt: null,
    });

    if (!product) {
      wishlistResponse.message = WISHLIST_MESSAGES.PRODUCT_NOT_FOUND;
      wishlistResponse.statusCode = 404;
      return wishlistResponse;
    }

    // Check if product is already in wishlist
    let wishlist = await Wishlist.findOne({ customerId });

    if (wishlist && isProductInWishlist(wishlist, productId)) {
      wishlistResponse.message = WISHLIST_MESSAGES.PRODUCT_ALREADY_EXISTS;
      wishlistResponse.statusCode = 409;
      return wishlistResponse;
    }

    // Add product to wishlist
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { customerId },
      {
        $addToSet: {
          products: {
            productId: new mongoose.Types.ObjectId(productId),
            addedAt: new Date(),
          },
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).populate({
      path: "products.productId",
      populate: {
        path: "categoryId",
        select: "name",
      },
    });

    const fullResponse = buildWishlistResponse(updatedWishlist);

    // Enrich with option types
    const enrichedResponse = await enrichWishlistWithOptions(fullResponse);

    wishlistResponse.wishlist = enrichedResponse;
    wishlistResponse.success = true;
    wishlistResponse.message = WISHLIST_MESSAGES.PRODUCT_ADDED;
    wishlistResponse.statusCode = 200;

    return wishlistResponse;
  } catch (err) {
    console.error("Add to wishlist error:", err);
    wishlistResponse.message = "Internal server error";
    wishlistResponse.statusCode = 500;
    return wishlistResponse;
  }
};

// Remove single product from wishlist
export const removeProduct = async (
  req: AuthenticatedRequest,
  res: NextApiResponse
) => {
  await connectToDatabase();

  const wishlistResponse: Response = {
    success: false,
    message: "",
    wishlist: undefined,
    statusCode: 500,
  };

  const { productId }: RemoveFromWishlistRequest = req.body;

  // Validate product ID
  const validationErrors = validateProductId(productId);
  if (validationErrors.length > 0) {
    wishlistResponse.message = validationErrors.join(", ");
    wishlistResponse.statusCode = 400;
    return wishlistResponse;
  }

  try {
    const customerId = new mongoose.Types.ObjectId(req.user.userId);

    // Check if product is in wishlist
    const wishlist = await Wishlist.findOne({ customerId });

    if (!wishlist || !isProductInWishlist(wishlist, productId)) {
      wishlistResponse.message = WISHLIST_MESSAGES.PRODUCT_NOT_IN_WISHLIST;
      wishlistResponse.statusCode = 404;
      return wishlistResponse;
    }

    // Remove product from wishlist
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { customerId },
      {
        $pull: {
          products: {
            productId: new mongoose.Types.ObjectId(productId),
          },
        },
      },
      { new: true }
    ).populate({
      path: "products.productId",
      populate: {
        path: "categoryId",
        select: "name",
      },
    });

    const fullResponse = buildWishlistResponse(updatedWishlist!);

    // Enrich with option types
    const enrichedResponse = await enrichWishlistWithOptions(fullResponse);

    wishlistResponse.wishlist = enrichedResponse;
    wishlistResponse.success = true;
    wishlistResponse.message = WISHLIST_MESSAGES.PRODUCT_REMOVED;
    wishlistResponse.statusCode = 200;

    return wishlistResponse;
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    wishlistResponse.message = "Internal server error";
    wishlistResponse.statusCode = 500;
    return wishlistResponse;
  }
};
