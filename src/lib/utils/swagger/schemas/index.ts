// lib/utils/swagger/schemas/index.ts
import { baseSchemas } from "./base";
import { authSchemas } from "./auth";
import { categorySchemas } from "./category";
import { productSchemas } from "./product";
import { wishlistSchemas } from "./wishlist";
import { customerSchemas } from "./customer";
import { cartSchemas } from "./cart";
import { addressSchemas } from "./address";
import { publicCategorySchemas } from "./publicCategory";
import { publicProductSchemas } from "./publicProduct";
import { profileSchemas } from "./profile";
import { orderSchemas } from "./order";
import { feedbackSchemas } from "./feedback";
import { adminFeedbackSchemas } from "./adminFeedback";
import { adminOrderSchemas } from "./adminOrder";
import { adminDashboardSchemas } from "./adminDashboard";
import { recommendationSchemas } from "./recommendation";
import { navbarSchemas } from "./navbar";
import { optionSchemas } from "./option";
import { contactSchemas } from "./contact";

export const schemas = {
  ...baseSchemas,
  ...categorySchemas,
  ...productSchemas,
  ...authSchemas,
  ...wishlistSchemas,
  ...customerSchemas,
  ...cartSchemas,
  ...addressSchemas,
  ...publicCategorySchemas,
  ...publicProductSchemas,
  ...profileSchemas,
  ...orderSchemas,
  ...feedbackSchemas,
  ...adminFeedbackSchemas,
  ...adminOrderSchemas,
  ...adminDashboardSchemas,
  ...recommendationSchemas,
  ...navbarSchemas,
  ...optionSchemas,
  ...contactSchemas,
};
