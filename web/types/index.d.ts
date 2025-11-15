declare interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  timestamp: string;
  data?: T;
}

declare interface ErrorResponse extends ApiResponse<never> {
  code?: AppErrorCode;
  errors?: string[];
  details?: Record<string, unknown>;
  stack?: string;
}

declare interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

declare interface User {
  _id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  role: string;
  isVerified: boolean;
  provider: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

declare interface Category {
  _id: string;
  name: string;
  isActive?: boolean;
}

declare interface ProductVariant {
  size: string;
  expandedSize: string;
  foldedSize: string;
  loadCapacity: string;
  weight: string;
}

declare interface ProductSpecification {
  label: string;
  value: string;
}

declare interface ProductDetailItem {
  label: string;
}

declare interface ProductDetailSection {
  title: string;
  items: ProductDetailItem[];
}

declare interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  deal: number;
  stock: number;
  images: string[];
  category: { name: string; _id: string };
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  details?: ProductDetailSection[];
  guide?: string[];
  warnings?: string[];
  isActive: boolean;
}

declare interface ProductDetail extends Product {
  rating: {
    average: number;
    count: number;
  };
  count: number;
}

declare interface Tour {
  _id?: string;
  code?: string;
  name: string;
  slug?: string;
  description: string;
  durationDays: number;
  durationNights: number;
  stayType: string;
  transportation: string;
  departurePoint: string;
  departureFrequency?: string;
  targetAudience?: string;

  itinerary: {
    day: number;
    title: string;
    activities: {
      timeFrom?: string;
      timeTo?: string;
      description: string;
    }[];
  }[];

  priceOptions: {
    name: string;
    price: number;
    minPeople?: number;
    maxPeople?: number;
  }[];

  servicesIncluded: {
    title: string;
    details: { value: string }[];
  }[];
  servicesExcluded: {
    title: string;
    details: { value: string }[];
  }[];
  notes: {
    title: string;
    details: { value: string }[];
  }[];

  images: string[];
  isActive: boolean;

  rating?: {
    average: number;
    count: number;
  };

  viewsCount?: number;
  soldCount?: number;
  createdAt?: string;
  updatedAt?: string;
}


declare interface PaginatedResponse<T = unknown>{
  success: boolean;
  message: string;
  timestamp: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

