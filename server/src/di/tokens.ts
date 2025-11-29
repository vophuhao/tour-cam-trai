export const TOKENS = {
  TourService: Symbol("TourService"),
  CategoryService: Symbol("CategoryService"),
  ProductService: Symbol("ProductService"),
  AuthService: Symbol("AuthService"),
  VerificationService: Symbol("VerificationService"),
  CommentService: Symbol("CommentService"),
  UserService: Symbol("UserService"),
  AddressService: Symbol("AddressService"),
  OrderService: Symbol("OrderService"),
  CartService: Symbol("CartService"),
  // Hipcamp-style services
  CampsiteService: Symbol("CampsiteService"),
  BookingService: Symbol("BookingService"),
  ReviewService: Symbol("ReviewService"),
  AmenityService: Symbol("AmenityService"),
  ActivityService: Symbol("ActivityService"),
} as const;

export type TokenMap = typeof TOKENS;
