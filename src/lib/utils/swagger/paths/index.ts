import { authPaths } from "./auth";
import { healthPaths } from "./health";
import { categoryPaths } from "./category";
import { productPaths } from "./product";

export const paths = {
  ...authPaths,
  ...categoryPaths,
  ...productPaths,
  ...healthPaths,
};