/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from './api-client';

// ==================== PROPERTY-SITE API ====================
// Re-export all Property-Site API functions for centralized access
export * from './property-site-api';

export async function login(data: {
  email: string;
  password: string;
}): Promise<ApiResponse<User> | ErrorResponse> {
  try {
    const response = (await apiClient.post(
      '/auth/login',
      data,
    )) as ApiResponse<User>;
    return response;
  } catch (error) {
    return error as ErrorResponse;
  }
}

export async function googleLogin(data: {
  email: string;
  name: string;
  picture: string;
  googleId: string;
}): Promise<ApiResponse<User> | ErrorResponse> {
  try {
    const response = (await apiClient.post(
      '/auth/login/google',
      data,
    )) as ApiResponse<User>;
    return response;
  } catch (error) {
    return error as ErrorResponse;
  }
}

export async function logout(): Promise<ApiResponse> {
  return apiClient.post('/auth/logout');
}

export async function refreshToken(): Promise<ApiResponse> {
  return apiClient.get('/auth/refresh');
}

// ================== USER API ==================
export const getAllUsers = async (): Promise<ApiResponse> =>
  apiClient.get('/users');

export const updateProfile = async (
  data: Partial<{ username: string; bio: string; avatar: string }>,
): Promise<ApiResponse> => apiClient.patch('/users/me', data);

export const getUserByUsername = async (
  username: string,
): Promise<ApiResponse> => apiClient.get(`/users/${username}`);

export const searchUsers = async (
  query: string,
  page = 1,
  limit = 20,
): Promise<ApiResponse> =>
  apiClient.get(`/users/search?q=${encodeURIComponent(query)}`);

export async function uploadMedia(formData: FormData): Promise<ApiResponse> {
  return apiClient.post('/media/save', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// ================== category API ==================
export async function getCategories(
  page = 1,
  limit = 10,
  search?: string,
): Promise<PaginatedResponse<Category>> {
  return apiClient.get('/categories', {
    params: { page, limit, search },
  });
}

export async function getAllCategories(): Promise<ApiResponse<Category[]>> {
  return apiClient.get('/categories/all');
}

export async function getCategoryById(id: string): Promise<ApiResponse> {
  return apiClient.get(`/categories/${id}`);
}

export async function createCategory(data: {
  name: string;
  isActive: boolean;
}): Promise<ApiResponse> {
  return apiClient.post('/categories', data);
}

export async function updateCategory(
  id: string,
  data: { name: string; isActive: boolean },
): Promise<ApiResponse> {
  return apiClient.put(`/categories/${id}`, data);
}

export async function deleteCategory(id: string): Promise<ApiResponse> {
  return apiClient.delete(`/categories/${id}`);
}

// ================== product API ==================
export async function createProduct(data: {
  name: string;
  description?: string;
  price: number;
  deal?: number;
  stock: number;
  images: string[];
  category: string;
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  details?: ProductDetailSection[];
  guide?: string[];
  warnings?: string[];
  isActive: boolean;
}): Promise<ApiResponse> {
  return apiClient.post('/products', data);
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    description?: string;
    price: number;
    deal?: number;
    stock: number;
    images: string[];
    category: string;
    specifications?: ProductSpecification[];
    variants?: ProductVariant[];
    details?: ProductDetailSection[];
    guide?: string[];
    warnings?: string[];
    isActive: boolean;
  },
): Promise<ApiResponse> {
  return apiClient.put(`/products/${id}`, data);
}

export async function getProduct(
  page = 1,
  limit = 10,
  search?: string,
): Promise<ApiResponse<Product[]>> {
  return apiClient.get('/products', {
    params: { page, limit, search },
  });
}

export async function getProductBySlug(slug: string): Promise<ApiResponse> {
  return apiClient.get(`/products/slug/${slug}`);
}

export async function getAllProduct(): Promise<ApiResponse<Product[]>> {
  return apiClient.get('/products/all');
}

export async function deleteProduct(id: string): Promise<ApiResponse> {
  return apiClient.delete(`/products/${id}`);
}

export async function getProductsByCategoryName(
  categoryName: string,
  page = 1,
  limit = 10,
): Promise<ApiResponse<Product[]>> {
  return apiClient.get(
    `/products/category/${encodeURIComponent(categoryName)}`,
    {
      params: { page, limit },
    },
  );
}

// ================== REVIEW API ==================
export async function getCampsiteReviews(
  campsiteId: string,
  page: number = 1,
  limit: number = 10,
): Promise<PaginatedResponse<any>> {
  return apiClient.get(`/campsites/${campsiteId}/reviews`, {
    params: { page, limit },
  });
}

export async function getCampsiteReviewStats(campsiteId: string): Promise<
  ApiResponse<{
    totalReviews: number;
    averageRating: number;
    breakdown: Record<string, number>;
    distribution: Record<number, number>;
  }>
> {
  return apiClient.get(`/campsites/${campsiteId}/reviews/stats`);
}

// ================== TOUR API ==================
export async function getTours(
  page = 1,
  limit = 10,
  search?: string,
): Promise<PaginatedResponse<Tour>> {
  return apiClient.get('/tours', { params: { page, limit, search } });
}

export async function getAllTours(): Promise<ApiResponse<Tour[]>> {
  return apiClient.get('/tours/all');
}

export async function getTourById(id: string): Promise<ApiResponse<Tour>> {
  return apiClient.get(`/tours/${id}`);
}

export async function getTourBySlug(slug: string): Promise<ApiResponse<Tour>> {
  return apiClient.get(`/tours/slug/${slug}`);
}

export async function createTour(data: {
  code?: string;
  name: string;
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
}): Promise<ApiResponse<Tour>> {
  return apiClient.post('/tours', data);
}

export async function updateTour(
  id: string,
  data: {
    name: string;
    description?: string;
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
  },
): Promise<ApiResponse<Tour>> {
  return apiClient.put(`/tours/${id}`, data);
}

export async function deleteTour(id: string): Promise<ApiResponse> {
  return apiClient.delete(`/tours/${id}`);
}

export async function activateTour(id: string): Promise<ApiResponse> {
  return apiClient.patch(`/tours/activate/${id}`);
}

export async function deactivateTour(id: string): Promise<ApiResponse> {
  return apiClient.patch(`/tours/deactivate/${id}`);
}

// ================== CAMPSITE API ==================
export async function searchCampsites(
  params?: SearchCampsiteParams,
): Promise<PaginatedResponse<Campsite>> {
  const queryString = new URLSearchParams(
    Object.entries(params || {}).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = String(value);
          }
        }
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();

  return apiClient.get(`/campsites${queryString ? `?${queryString}` : ''}`);
}

export async function getCampsite(
  idOrSlug: string,
): Promise<ApiResponse<Campsite>> {
  return apiClient.get(`/campsites/${idOrSlug}`);
}

export async function createCampsite(
  data: any,
): Promise<ApiResponse<Campsite>> {
  return apiClient.post('/campsites', data);
}

export async function updateCampsite(
  id: string,
  data: any,
): Promise<ApiResponse<Campsite>> {
  return apiClient.patch(`/campsites/${id}`, data);
}

export async function deleteCampsite(id: string): Promise<ApiResponse> {
  return apiClient.delete(`/campsites/${id}`);
}

export async function getMyCampsites(): Promise<ApiResponse<Campsite[]>> {
  return apiClient.get('/campsites/my/list');
}

export async function checkCampsiteAvailability(
  id: string,
  checkIn: string,
  checkOut: string,
): Promise<ApiResponse<{ isAvailable: boolean }>> {
  return apiClient.get(
    `/campsites/${id}/availability?checkIn=${checkIn}&checkOut=${checkOut}`,
  );
}

// ================== ORDER API ==================
export async function getAllOrders(): Promise<ApiResponse<Order[]>> {
  return apiClient.get('/orders');
}

// ================== BOOKING API ==================
export async function createBooking(data: {
  // NEW: Property-Site architecture (site is required)
  site: string;
  property: string;

  // LEGACY: Old campsite (backward compatible)
  campsite?: string;

  // Shared fields
  checkIn: string;
  checkOut: string;
  numberOfGuests: number;
  numberOfPets?: number;
  numberOfVehicles?: number;
  guestMessage?: string;
  paymentMethod: 'card' | 'bank_transfer' | 'momo' | 'zalopay';
}): Promise<ApiResponse> {
  return apiClient.post('/bookings', data);
}

export async function getBooking(id: string): Promise<ApiResponse> {
  return apiClient.get(`/bookings/${id}`);
}

export async function getBookingByCode(code: string): Promise<ApiResponse> {
  return apiClient.post(`/bookings/${code}/code`);
}

export async function getUserBookings(params?: {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
  role?: 'guest' | 'host';
  page?: number;
  limit?: number;
}): Promise<ApiResponse> {
  return apiClient.get('/bookings', { params });
}

export async function getAllAmenities(): Promise<ApiResponse<Amenity[]>> {
  return apiClient.get('/amenities');
}

export async function getAllActivities(): Promise<ApiResponse<Activity[]>> {
  return apiClient.get('/activities');
}

export async function getMyBookings(): Promise<ApiResponse<Booking[]>> {
  return apiClient.get('/bookings/my/list');
}

// ================== AVAILABILITY API ==================
export async function getBlockedDates(
  siteId: string,
  startDate: string,
  endDate: string,
): Promise<
  ApiResponse<{
    blockedDates: string[];
    totalBlocked: number;
  }>
> {
  return apiClient.get(`/sites/${siteId}/blocked-dates`, {
    params: { startDate, endDate },
  });
}

export async function getSiteAvailability(
  siteId: string,
  checkIn?: string,
  checkOut?: string,
): Promise<
  ApiResponse<{
    isAvailable: boolean;
    reason?: string;
    blockedDates?: string[];
  }>
> {
  const params = checkIn && checkOut ? { checkIn, checkOut } : {};
  return apiClient.get(`/sites/${siteId}/availability`, { params });
}

export async function getMyCampsitesReview(): Promise<ApiResponse<Reviews[]>> {
  return apiClient.get('/reviews/my');
}

// ================== REVIEW API (Property-Site) ==================
export async function createReview(data: {
  booking: string;
  property: string;
  site: string;
  propertyRatings: {
    location: number;
    communication: number;
    value: number;
  };
  siteRatings: {
    cleanliness: number;
    accuracy: number;
  };
  comment: string;
}): Promise<ApiResponse> {
  return apiClient.post('/reviews', data);
}

export async function getPropertyReviews(
  propertyId: string,
  page = 1,
  limit = 10,
): Promise<ApiResponse> {
  return apiClient.get(`/properties/${propertyId}/reviews`, {
    params: { page, limit },
  });
}

export async function getSiteReviews(
  siteId: string,
  page = 1,
  limit = 10,
): Promise<ApiResponse> {
  return apiClient.get(`/sites/${siteId}/reviews`, {
    params: { page, limit },
  });
}

export async function addHostResponse(
  reviewId: string,
  comment: string,
): Promise<ApiResponse> {
  return apiClient.post(`/reviews/${reviewId}/response`, { comment });
}

/**
 * Lấy hoặc tạo cuộc trò chuyện với 1 user khác
 */
export async function getOrCreateConversation(
  userId: string,
): Promise<ApiResponse> {
  return apiClient.post(`/messages/conversations`, { userId });
}

/**
 * Lấy danh sách conversation của user hiện tại
 */
export async function getUserConversations(): Promise<ApiResponse> {
  return apiClient.get(`/messages/conversations`);
}
/**
 * Xoá 1 conversation
 */
export async function deleteConversation(
  conversationId: string,
): Promise<ApiResponse> {
  return apiClient.delete(`/messages/${conversationId}`);
}

/**
 * Lưu trữ (archive) 1 conversation
 */
export async function archiveConversation(
  conversationId: string,
): Promise<ApiResponse> {
  return apiClient.put(`/messages/${conversationId}/archive`);
}

// =============================
// Messages
// =============================

/**
 * Gửi tin nhắn trong 1 conversation
 */
export async function sendMessageUser(
  conversationId: string,
  payload: any,
): Promise<ApiResponse> {
  return apiClient.post(`/messages/${conversationId}`, { payload });
}

/**
 * Lấy message trong 1 conversation
 */
export async function getMessages(
  conversationId: string,
): Promise<ApiResponse> {
  return apiClient.get(`/messages/${conversationId}`);
}

/**
 * Đánh dấu toàn bộ tin nhắn trong 1 conversation là đã đọc
 */
export async function markAsRead(conversationId: string): Promise<ApiResponse> {
  return apiClient.put(`/messages/${conversationId}/read`);
}

// =============================
// Unread global count
// =============================

/**
 * Lấy tổng số tin nhắn chưa đọc
 */
export async function getUnreadCount(): Promise<
  ApiResponse<{ count: number }>
> {
  return apiClient.get(`/messages/unread-count`);
}

export async function getRatingsByProductId(
  productId: string,
): Promise<ApiResponse> {
  return apiClient.get(`/rating/product/${productId}`);
}

export async function getAllRatings(): Promise<ApiResponse> {
  return apiClient.get(`/rating/all`);
}

export async function adminReplyToRating(
  id: string,
  message: string,
): Promise<ApiResponse> {
  return apiClient.post(`/rating/admin/reply/${id}`, { message });
}

export async function becomeHost(data: any): Promise<ApiResponse> {
  return apiClient.post(`/users/become-host`, data);
}

export async function getAllHostRequests(): Promise<ApiResponse> {
  return apiClient.get(`/users/become-host`);
}

export async function updateHostRequestStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
): Promise<ApiResponse> {
  return apiClient.post(`/users/update-status-host/${id}`, { status });
}

export async function getAllApprovedHosts(): Promise<ApiResponse> {
  return apiClient.get(`/users/hosts`);
}

export const getDashboardStats = async (type: string) => {
  return apiClient.get(`/dashboard/${type}`);
};
