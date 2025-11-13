export const TOKENS = {
  TourService: Symbol("TourService"),
  CategoryService: Symbol("CategoryService"),
  ProductService: Symbol("ProductService"),
  AuthService: Symbol("AuthService"),
  VerificationService: Symbol("VerificationService"),
  CommentService: Symbol("CommentService"),
  UserService: Symbol("UserService"),
  CartService: Symbol("CartService"),
  AddressService: Symbol("AddressService"),
  OrderService: Symbol("OrderService"),
 
} as const;

export type TokenMap = typeof TOKENS;
