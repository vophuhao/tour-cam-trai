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
  bio?: string;
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
  createdAt: string;
  updatedAt: string;
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
  slug?: string;
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
  rating?: {
    average: number;
    count: number;
  };
}

declare interface ProductDetail extends Product {
  slug: string;
  rating: {
    average: number;
    count: number;
  };
  count: number;
}

declare interface Campsite {
  _id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  host: {
    _id: string;
    name?: string; // Optional since backend may not return it
    email: string;
    avatar?: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates:
      | {
          // GeoJSON format (new)
          type: 'Point';
          coordinates: [number, number]; // [lng, lat]
        }
      | {
          // Legacy format (old)
          lat: number;
          lng: number;
        };
    accessInstructions?: string;
  };
  propertyType:
    | 'tent'
    | 'rv'
    | 'cabin'
    | 'glamping'
    | 'treehouse'
    | 'yurt'
    | 'other';
  capacity: {
    maxGuests: number;
    maxVehicles?: number;
    maxPets?: number;
  };
  pricing: {
    basePrice: number;
    weekendPrice?: number;
    cleaningFee?: number;
    petFee?: number;
    extraGuestFee?: number;
    currency: string;
  };
  amenities: Array<{
    _id: string;
    name: string;
    icon?: string;
  }>;
  activities: Array<{
    _id: string;
    name: string;
    icon?: string;
  }>;
  rules: {
    checkInTime: string;
    checkOutTime: string;
    minNights: number;
    maxNights?: number;
    allowPets: boolean;
    allowChildren: boolean;
    allowSmoking: boolean;
    customRules?: string[];
  };
  images: string[];
  videos?: string[];
  isInstantBook: boolean;
  isActive: boolean;
  rating?: {
    average: number;
    count: number;
  };
  views: number;
  createdAt: string;
  updatedAt: string;
}

declare interface SearchCampsiteParams {
  search?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  propertyType?: string;
  minGuests?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  activities?: string[];
  allowPets?: boolean;
  isInstantBook?: boolean;
  checkIn?: string;
  checkOut?: string;
  sort?: string;
  page?: number;
  limit?: number;
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

declare interface PaginatedResponse<T = unknown> {
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

declare interface OrderItem {
  product: string;
  name: string;
  totalPrice: number;
  quantity: number;
  image?: string;
  _id?: string;
}

declare interface OrderAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  province: string;
  district?: string;
}

declare interface Order {
  _id: string;
  user: string | { username: string; email: string };
  code?: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  product: Product;
  paymentMethod: 'cod' | 'card';
  shippingMethod: 'standard' | 'express';
  itemsTotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
  promoCode?: string;
  hasRated: boolean;
  orderNote?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus:
    | 'pending'
    | 'processing'
    | 'confirmed'
    | 'shipping'
    | 'delivered'
    | 'cancel_request'
    | 'completed'
    | 'cancelled';
  payOSOrderCode?: number;
  payOSCheckoutUrl?: string;
  createdAt: string;
  updatedAt: string;
}

declare interface Location {
  _id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

declare interface Amenity {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  category: 'basic' | 'comfort' | 'safety' | 'outdoor' | 'special';
  isActive: boolean;
}

declare interface Reviews {
  _id: string;
  campsite: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
  };
  guest: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  ratings: {
    overall: number;
    cleanliness: number;
    accuracy: number;
    location: number;
    value: number;
    communication: number;
  };
  title?: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  hostResponse?: {
    comment: string;
    createdAt: string;
  };
}

declare interface Booking {
  _id: string;
  campsite: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
  };
  guest: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  host: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  checkInDate: string;
  checkOutDate: string;
  guestsCount: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  updatedAt: string;
}
// Amenity model - Tiện ích có tại campsite

declare interface Rating {
  _id: string;
  user: {
    _id: string;
    username: string;
    avatarUrl?: string;
  };
  product: string;
  rating: number;
  order: string;
  review?: string;
  files?: string[];
  adminReply?: {
    message: string;
    repliedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

declare interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
