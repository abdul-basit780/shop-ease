// lib/utils/swagger/schemas/index.ts
import { baseSchemas } from "./base";
import { authSchemas } from "./auth";
import { categorySchemas } from "./category";
import { productSchemas } from "./product";
import { wishlistSchemas } from "./wishlist";

export const schemas = {
  ...baseSchemas,
  ...categorySchemas,
  ...productSchemas,
  ...authSchemas,
  ...wishlistSchemas,
};
