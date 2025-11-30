export const TOKENS = {
  TourService: Symbol("TourService"),
  CategoryService: Symbol("CategoryService"),
  ProductService: Symbol("ProductService"),
  AuthService: Symbol("AuthService"),
  VerificationService: Symbol("VerificationService"),
  UserService: Symbol("UserService"),
  AddressService: Symbol("AddressService"),
  OrderService: Symbol("OrderService"),
  CartService: Symbol("CartService"),
  SupportChatService: Symbol("SupportChatService"),
  LocationService: Symbol("LocationService"),
  RatingService: Symbol("RatingService"),
} as const;

export type TokenMap = typeof TOKENS;
