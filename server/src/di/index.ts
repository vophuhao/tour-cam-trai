import {
  AddressService,
  AuthService,
  CartService,
  CategoryService,
  OrderService,
  ProductService,
  TourService,
  VerificationService,
  // Hipcamp-style services
  CampsiteService,
  BookingService,
  ReviewService,
  AmenityService,
  ActivityService,
  PropertyService,
  SiteService,
} from "@/services";
import { Container } from "./container";
import { TOKENS } from "./tokens";
import RatingService from "@/services/rating.service";
import DirectMessageService from "@/services/directMessage.service";

export const container = new Container();

// Register services
container.register(TOKENS.TourService, () => new TourService(), { singleton: true });
container.register(TOKENS.CategoryService, () => new CategoryService(), { singleton: true });
container.register(TOKENS.ProductService, () => new ProductService(), { singleton: true });
container.register(TOKENS.AddressService, () => new AddressService(), { singleton: true });
container.register(TOKENS.OrderService, () => new OrderService(), { singleton: true });
container.register(TOKENS.CartService, () => new CartService(), { singleton: true });
container.register(TOKENS.RatingService, () => new RatingService(), { singleton: true });
container.register(TOKENS.DirectMessageService, () => new DirectMessageService(), {
  singleton: true,
});
container.register(TOKENS.VerificationService, () => new VerificationService(), {
  singleton: true,
});
container.register(
  TOKENS.AuthService,
  () => new AuthService(container.resolve(TOKENS.VerificationService)),
  { singleton: true }
);

// Register Hipcamp-style services
container.register(TOKENS.CampsiteService, () => new CampsiteService(), { singleton: true });
container.register(TOKENS.BookingService, () => new BookingService(), { singleton: true });
container.register(TOKENS.ReviewService, () => new ReviewService(), { singleton: true });
container.register(TOKENS.AmenityService, () => new AmenityService(), { singleton: true });
container.register(TOKENS.ActivityService, () => new ActivityService(), { singleton: true });
container.register(TOKENS.PropertyService, () => new PropertyService(), { singleton: true });
container.register(TOKENS.SiteService, () => new SiteService(), { singleton: true });

export type { Container } from "./container";
export { TOKENS } from "./tokens";
