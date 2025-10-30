export const TOKENS = {
  TourService: Symbol("TourService"),
  CategoryService: Symbol("CategoryService"),
  ProductService: Symbol("ProductService"),
  AuthService: Symbol("AuthService"),
  VerificationService: Symbol("VerificationService"),
  CommentService: Symbol("CommentService"),
  UserService: Symbol("UserService"),
} as const;

export type TokenMap = typeof TOKENS;
