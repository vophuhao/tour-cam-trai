/**
 * Central exports for all models.
 * This provides a clean import interface for services
 */
export { default as SessionModel, type SessionDocument } from "./session.model";

export { default as UserModel, type UserDocument } from "./user.model";

export { default as CategoryModel, type CategoryDocument } from "./category.model";

export { default as ProductModel, type ProductDocument } from "./product.model";

export { OrderModel, type OrderDocument } from "./order.model";

// Hipcamp-style models
export { AmenityModel, type AmenityDocument } from "./amenity.model";
export {
  AvailabilityModel,
  FavoriteModel,
  PropertyAvailabilityModel,
  type AvailabilityDocument,
  type FavoriteDocument,
  type PropertyAvailabilityDocument,
} from "./availability.model";
export { BookingModel, type BookingDocument } from "./booking.model";
export { PropertyModel, type PropertyDocument } from "./property.model";
export { ReviewModel, type ReviewDocument } from "./review.model";
export { SiteModel, type SiteDocument } from "./site.model";
