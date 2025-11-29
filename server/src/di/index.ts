import {
  AddressService,
  AuthService,
  CartService,
  CategoryService,
  CommentService,
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
} from "@/services";
import { Container } from "./container";
import { TOKENS } from "./tokens";

export const container = new Container();

// Register services
container.register(TOKENS.TourService, () => new TourService(), { singleton: true });
container.register(TOKENS.CategoryService, () => new CategoryService(), { singleton: true });
container.register(TOKENS.ProductService, () => new ProductService(), { singleton: true });
container.register(TOKENS.CommentService, () => new CommentService(), { singleton: true });
container.register(TOKENS.AddressService, () => new AddressService(), { singleton: true });
container.register(TOKENS.OrderService, () => new OrderService(), { singleton: true });
container.register(TOKENS.CartService, () => new CartService(), { singleton: true });
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

export type { Container } from "./container";
export { TOKENS } from "./tokens";
