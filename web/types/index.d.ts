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
}

declare interface ProductDetail extends Product {
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
  price: number;
  quantity: number;
  image?: string;
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
  user: string | { name: string; email: string };
  Code?: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  paymentMethod: 'cod' | 'card';
  shippingMethod: 'standard' | 'express';
  itemsTotal: number;
  shippingFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
  promoCode?: string;
  orderNote?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus:
    | 'pending'
    | 'processing'
    | 'confirmed'
    | 'shipping'
    | 'completed'
    | 'cancelled';
  payOSOrderCode?: number;
  payOSCheckoutUrl?: string;
  createdAt: string;
  updatedAt: string;
}
