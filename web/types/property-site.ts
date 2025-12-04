// ==================== PROPERTY-SITE ARCHITECTURE TYPES ====================

/**
 * Property Types
 * Represents land/facility where camping sites are located
 */

export type PropertyType =
  | 'private_land'
  | 'campground'
  | 'ranch'
  | 'farm'
  | 'retreat_center';

export type LodgingType =
  | 'bring_your_own'
  | 'structure_provided'
  | 'vehicle_provided';

export interface SharedAmenities {
  toilets?: {
    type: 'none' | 'portable' | 'flush' | 'vault' | 'composting';
    count: number;
    isShared: boolean;
  };
  showers?: {
    type: 'none' | 'outdoor' | 'indoor' | 'hot' | 'cold';
    count: number;
    isShared: boolean;
  };
  potableWater?: boolean;
  waterSource?: 'tap' | 'well' | 'stream' | 'none';
  parkingType?: 'drive_in' | 'walk_in' | 'nearby';
  parkingSpaces?: number;
  commonAreas?: string[];
  laundry?: boolean;
  wifi?: boolean;
  cellService?: 'excellent' | 'good' | 'limited' | 'none';
  electricityAvailable?: boolean;
}

export interface PropertyRule {
  category: 'pets' | 'noise' | 'fire' | 'vehicle' | 'general';
  description: string;
  isRequired: boolean;
}

export interface PropertyPolicies {
  checkInTime: string; // "14:00"
  checkOutTime: string; // "11:00"
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  houseRules?: string[];
}

export interface PropertyStats {
  totalSites: number;
  activeSites: number;
  totalBookings: number;
  totalReviews: number;
  averageRating: number;
  viewCount: number;
}

export interface PropertyRating {
  average: number;
  count: number;
  breakdown: {
    location: number;
    communication: number;
    value: number;
  };
}

// User type reference
interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

// Activity type reference
interface Activity {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  category: string;
}

export interface Property {
  _id: string;
  host: string | User;
  name: string;
  slug: string;
  tagline: string;
  description: string;

  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
    accessInstructions?: string;
  };

  propertyType: PropertyType;
  lodgingType: LodgingType;

  landSize?: {
    value: number;
    unit: 'acres' | 'hectares' | 'square_meters';
  };
  minPrice?: number; // Minimum price from sites

  sharedAmenities: SharedAmenities;
  activities: string[] | Activity[];

  rules: PropertyRule[];

  // Policies (backend structure)
  cancellationPolicy?: {
    type: 'flexible' | 'moderate' | 'strict';
    description?: string;
    refundRules?: Array<{
      daysBeforeCheckIn: number;
      refundPercentage: number;
    }>;
  };
  petPolicy?: {
    allowed: boolean;
    maxPets?: number;
    fee?: number;
    rules?: string;
  };
  childrenPolicy?: {
    allowed: boolean;
    ageRestrictions?: string;
  };

  photos: Array<{
    url: string;
    caption?: string;
    isCover: boolean;
    order: number;
    uploadedAt?: string;
  }>;

  stats: PropertyStats;
  rating?: PropertyRating;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Site Types
 * Represents individual camping spots within a property
 */

export type AccommodationType =
  | 'tent'
  | 'rv'
  | 'cabin'
  | 'yurt'
  | 'treehouse'
  | 'glamping'
  | 'vehicle';

export type SiteType =
  | 'designated'
  | 'undesignated'
  | 'dispersed'
  | 'walk_in'
  | 'group';

export interface SiteCapacity {
  maxGuests: number;
  maxAdults?: number;
  maxChildren?: number;
  maxPets?: number;
  maxVehicles?: number;
  maxTents?: number;
  maxRVs?: number;
  rvMaxLength?: number; // feet
}

export interface SitePricing {
  basePrice: number;
  currency: string;
  weekendPrice?: number;
  weeklyDiscount?: number; // percentage
  monthlyDiscount?: number;
  additionalGuestFee?: number;
  petFee?: number;
  vehicleFee?: number;
  cleaningFee?: number;
  depositAmount?: number;
  seasonalPricing?: Array<{
    name: string;
    startDate: string;
    endDate: string;
    price: number;
  }>;
}

export interface SiteAmenities {
  electrical?: {
    available: boolean;
    amperage?: number; // 15, 30, 50
    outlets?: number;
  };
  water?: {
    hookup: boolean;
    nearby: boolean;
    distance?: number; // feet
  };
  sewer?: {
    hookup: boolean;
    dumpStation: boolean;
    distance?: number;
  };
  firePit: boolean;
  fireRing: boolean;
  firewood?:
    | 'provided'
    | 'available_for_purchase'
    | 'bring_your_own'
    | 'not_allowed';
  furniture?: string[]; // ["picnic_table", "chairs", "hammock"]
  picnicTable: boolean;
}

export interface SiteBookingSettings {
  minimumNights: number;
  maximumNights?: number;
  checkInTime: string;
  checkOutTime: string;
  instantBook: boolean;
  advanceNotice: number; // hours
  preparationTime?: number; // days between bookings
  allowSameDayBooking: boolean;
}

export interface SiteRating {
  average: number;
  count: number;
  breakdown: {
    cleanliness: number;
    accuracy: number;
    amenities: number;
  };
}

export interface Site {
  _id: string;
  property: string | Property;
  name: string;
  slug: string;
  description?: string;

  accommodationType: AccommodationType;
  siteType: SiteType;
  lodgingProvided: 'bring_your_own' | 'structure_provided' | 'vehicle_provided';

  // Site-specific Location (matches backend siteLocation field)
  siteLocation?: {
    coordinates?: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat] - GeoJSON format
    };
    mapPinLabel?: string;
    relativeDescription?: string;
  };

  capacity: SiteCapacity;
  pricing: SitePricing;
  amenities: SiteAmenities;
  bookingSettings: SiteBookingSettings;

  photos?: Array<{
    url: string;
    caption?: string;
    isCover: boolean;
    order: number;
    uploadedAt?: string;
  }>;
  included?: string[]; // For glamping: items/amenities included

  images: string[]; // Legacy field

  stats?: {
    totalBookings: number;
    totalReviews: number;
    averageRating: number;
    viewCount: number;
  };
  rating?: SiteRating;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Grouped Sites (for undesignated)
  groupedSiteInfo?: {
    isGrouped: boolean;
    groupId?: string;
    totalSitesInGroup?: number;
  };
}

/**
 * Updated Booking Type
 * Now references both Property and Site
 */

export interface Booking {
  _id: string;
  property: string | Property;
  site: string | Site;
  guest: string | User;
  host: string | User;

  checkIn: string;
  checkOut: string;
  nights: number;

  numberOfGuests: number;
  numberOfPets?: number;
  numberOfVehicles?: number;

  pricing: {
    basePrice: number;
    totalNights: number;
    subtotal: number;
    cleaningFee?: number;
    petFee?: number;
    vehicleFee?: number;
    serviceFee: number;
    tax: number;
    total: number;
  };

  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment?: {
    method: string;
    status: 'pending' | 'paid' | 'refunded';
    transactionId?: string;
  };

  specialRequests?: string;
  guestNotes?: string;
  hostNotes?: string;

  reviewed?: boolean;
  review?: string | Review;

  createdAt: string;
  updatedAt: string;
}

/**
 * Updated Review Type
 * Now has split ratings for Property and Site
 */

export interface PropertyRatings {
  location: number; // 1-5: How good is the property location
  communication: number; // 1-5: How responsive is the host
  value: number; // 1-5: Is it worth the price
}

export interface SiteRatings {
  cleanliness: number; // 1-5: How clean is the site
  accuracy: number; // 1-5: Does it match the description
}

export interface Review {
  _id: string;
  booking: string | Booking;
  property: string | Property;
  site: string | Site;
  user: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
  };

  propertyRatings: PropertyRatings;
  siteRatings: SiteRatings;
  ratings: {
    overall: number; // Calculated average of all 5 ratings
  };

  comment: string;

  images?: string[];

  hostResponse?: {
    text: string;
    createdAt: string;
  };

  isPublished: boolean;

  helpfulCount: number;

  createdAt: string;
  updatedAt: string;
}

/**
 * Search & Filter Types
 */

export interface PropertySearchFilters {
  query?: string;
  propertyType?: PropertyType[];
  lodgingType?: LodgingType[];
  campingStyle?: string[]; // tent, rv, glamping - filters sites
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  pets?: number;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radius?: number; // miles
  amenities?: string[]; // Amenity IDs
  activities?: string[]; // Activity IDs
  // Shared amenity boolean filters (property-level)
  hasToilets?: boolean;
  hasShowers?: boolean;
  hasParking?: boolean;
  hasWifi?: boolean;
  hasElectricity?: boolean;
  hasWater?: boolean;
  instantBook?: boolean;
  minRating?: number;
  sort?: string; // e.g., "minPrice-asc", "minPrice-desc", "rating", "newest"
}

export interface SiteSearchFilters {
  query?: string;
  propertyId?: string;
  accommodationType?: AccommodationType[];
  siteType?: SiteType[];
  minPrice?: number;
  maxPrice?: number;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  pets?: number;
  vehicles?: number;
  amenities?: string[];
  instantBook?: boolean;
  minRating?: number;
  sortBy?:
    | 'newest'
    | 'oldest'
    | 'price-low'
    | 'price-high'
    | 'rating'
    | 'name'
    | 'capacity';
}

/**
 * API Response Types
 */

export interface PropertyListResponse {
  properties: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SiteListResponse {
  sites: Site[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PropertyWithSites extends Property {
  sites: Site[];
}

export interface PricingCalculation {
  basePrice: number;
  nights: number;
  subtotal: number;
  fees: {
    cleaning?: number;
    pet?: number;
    vehicle?: number;
    additionalGuest?: number;
  };
  serviceFee: number;
  tax: number;
  total: number;
  breakdown: Array<{
    date: string;
    price: number;
    isWeekend: boolean;
  }>;
}

export interface AvailabilityCheck {
  available: boolean;
  unavailableDates?: string[];
  reasons?: Array<{
    date: string;
    reason: 'booked' | 'blocked' | 'maintenance';
  }>;
}
