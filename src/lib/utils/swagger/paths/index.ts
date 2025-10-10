import { authPaths } from "./auth";
import { healthPaths } from "./health";
import { categoryPaths } from "./category";
import { productPaths } from "./product";
import { wishlistPaths } from "./wishlist";

export const paths = {
  ...authPaths,
  ...categoryPaths,
  ...productPaths,
  ...healthPaths,
  ...wishlistPaths,
};