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
	CampsiteService: Symbol("CampsiteService"),
  BookingService: Symbol("BookingService"),
 LocationService: Symbol("LocationService"),
  RatingService: Symbol("RatingService"), ReviewService: Symbol("ReviewService"),
  AmenityService: Symbol("AmenityService"),
  ActivityService: Symbol("ActivityService"),
  DirectMessageService: Symbol("DirectMessageService"),
} as const;
  

export type TokenMap = typeof TOKENS;
