import { authPaths } from "./auth";
import { healthPaths } from "./health";
import { categoryPaths } from "./category";
import { productPaths } from "./product";
import { wishlistPaths } from "./wishlist";
import { customerPaths } from "./customer";
import { cartPaths } from "./cart";
import { addressPaths } from "./address";
import { publicCategoryPaths } from "./publicCategory";
import { publicProductPaths } from "./publicProduct";
import { profilePaths } from "./profile";
import { orderPaths } from "./order";
import { feedbackPaths } from "./feedback";
import { adminFeedbackPaths } from "./adminFeedback";
import { adminOrderPaths } from "./adminOrder";
import { adminDashboardPaths } from "./adminDashboard";
import { recommendationPaths } from "./recommendation";
import { publicRecommendationPaths } from "./publicRecommendation";
import { navbarPaths } from "./navbar";
import { optionPaths } from "./option";
import { contactPaths } from "./contact";

export const paths = {
  ...authPaths,
  ...categoryPaths,
  ...productPaths,
  ...healthPaths,
  ...wishlistPaths,
  ...customerPaths,
  ...cartPaths,
  ...addressPaths,
  ...publicCategoryPaths,
  ...publicProductPaths,
  ...profilePaths,
  ...orderPaths,
  ...feedbackPaths,
  ...adminFeedbackPaths,
  ...adminOrderPaths,
  ...adminDashboardPaths,
  ...recommendationPaths,
  ...publicRecommendationPaths,
  ...navbarPaths,
  ...optionPaths,
  ...contactPaths,
};
