import apiClient from './api-client';

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
export const getUser = async (): Promise<ApiResponse> => apiClient.get('/user');

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
  apiClient.get(
    `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
  );

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
  campsite: string;
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




export async function getMyCampsitesReview(): Promise<ApiResponse<Reviews[]>> {
  return apiClient.get('/reviews/my');
}

export async function addHostResponse(reviewId: string, comment: string): Promise<ApiResponse> {
  return apiClient.post(`/reviews/${reviewId}/response`, { comment });
}