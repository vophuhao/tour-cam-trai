/**
 * Central exports for all models.
 * This provides a clean import interface for services
 */
export { default as SessionModel, type SessionDocument } from "./session.model";

export { default as UserModel, type UserDocument } from "./user.model";

export { default as CategoryModel, type CategoryDocument } from "./category.model";

export { default as ProductModel, type ProductDocument } from "./product.model";

export { default as TourModel, type TourDocument } from "./tour.model";

// Hipcamp-style models
export { PropertyModel, type PropertyDocument } from "./property.model";
export { SiteModel, type SiteDocument } from "./site.model";
export { CampsiteModel, type CampsiteDocument } from "./campsite.model";
export { BookingModel, type BookingDocument } from "./booking.model";
export { ReviewModel, type ReviewDocument } from "./review.model";
export {
  AmenityModel,
  ActivityModel,
  type AmenityDocument,
  type ActivityDocument,
} from "./amenity.model";
export {
  AvailabilityModel,
  FavoriteModel,
  type AvailabilityDocument,
  type FavoriteDocument,
} from "./availability.model";
