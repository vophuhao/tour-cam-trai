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

export const uploadMedia = async (formData: FormData): Promise<ApiResponse> =>
  apiClient.post('/media/save', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const analyzeMedia = async (formData: FormData): Promise<ApiResponse> =>
  apiClient.post('/media/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ================== category API ==================
export const getCategories = async (
  page = 1,
  limit = 10,
  search?: string,
): Promise<ApiResponse> =>
  apiClient.get('/categories', {
    params: { page, limit, search },
  });

export const getAllCategories = async (): Promise<ApiResponse> =>
  apiClient.get('/categories/all');

// Lấy 1 category theo id
export const getCategoryById = async (id: string): Promise<ApiResponse> =>
  apiClient.get(`/categories/get/${id}`);
export const createCategory = async (data: {
  name: string;
  isActive: boolean;
}): Promise<ApiResponse> => apiClient.post('/categories/create', data);
// Cập nhật category
export const updateCategory = async (
  id: string,
  data: { name: string; isActive: boolean },
): Promise<ApiResponse> => apiClient.post(`/categories/update/${id}`, data);
// Xóa category
export const deleteCategory = async (id: string): Promise<ApiResponse> =>
  apiClient.post(`/categories/delete/${id}`);

// ================== product API ==================

export const createProduct = async (data: {
  name: string;
  description?: string;
  price: number;
  deal?: number;
  stock: number;
  images: string[];
  category: string;

  // ✅ Thêm các phần mới
  specifications?: ProductSpecification[];
  variants?: ProductVariant[];
  details?: ProductDetailSection[];
  guide?: string[];
  warnings?: string[];

  isActive: boolean;
}): Promise<ApiResponse> => apiClient.post('/products/create', data);

export const updateProduct = async (
  id: string,
  data: {
    name: string;
    description?: string;
    price: number;
    deal?: number;
    stock: number;
    images: string[];
    category: string;

    // ✅ Thêm các phần mới
    specifications?: ProductSpecification[];
    variants?: ProductVariant[];
    details?: ProductDetailSection[];
    guide?: string[];
    warnings?: string[];

    isActive: boolean;
  },
): Promise<ApiResponse> => apiClient.post(`/products/update/${id}`, data);

export const getProduct = async (
  page = 1,
  limit = 10,
  search?: string,
): Promise<ApiResponse> =>
  apiClient.get('/products', {
    params: { page, limit, search },
  });

export const getProductBySlug = async (slug: string): Promise<ApiResponse> =>
  apiClient.get(`/products/slug/${slug}`);

export const getAllProduct = async (): Promise<ApiResponse> =>
  apiClient.get('/products/all');

export const deleteProduct = async (id: string): Promise<ApiResponse> =>
  apiClient.post(`/products/delete/${id}`);

// ================== TOUR API ==================

// 🟢 Lấy danh sách tour (phân trang + tìm kiếm)
export const getTours = async (
  page = 1,
  limit = 10,
  search?: string,
): Promise<ApiResponse> =>
  apiClient.get('/tours', { params: { page, limit, search } });

// 🟢 Lấy tất cả tour (không phân trang)
export const getAllTours = async (): Promise<ApiResponse> =>
  apiClient.get('/tours/all');

// 🟢 Lấy tour theo ID
export const getTourById = async (id: string): Promise<ApiResponse> =>
  apiClient.get(`/tours/get/${id}`);

//Lay tour theo slug
export const getTourBySlug = async (slug: string): Promise<ApiResponse> =>
  apiClient.get(`/tours/slug/${slug}`);

// 🟢 Tạo mới tour
export const createTour = async (data: {
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
}): Promise<ApiResponse> => apiClient.post('/tours/create', data);

// 🟡 Cập nhật tour
export const updateTour = async (
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
): Promise<ApiResponse> => apiClient.post(`/tours/update/${id}`, data);

// 🔴 Xóa tour
export const deleteTour = async (id: string): Promise<ApiResponse> =>
  apiClient.post(`/tours/delete/${id}`);

// 🟢 Kích hoạt tour
export const activateTour = async (id: string): Promise<ApiResponse> =>
  apiClient.post(`/tours/activate/${id}`);

// 🔴 Vô hiệu hóa tour
export const deactivateTour = async (id: string): Promise<ApiResponse> =>
  apiClient.post(`/tours/deactivate/${id}`);

// 🟣 Lấy top tour bán chạy / được xem nhiều
export const getTopTours = async (
  type: 'popular' | 'bestseller',
  limit = 5,
): Promise<ApiResponse> =>
  apiClient.get(`/tours/top`, { params: { type, limit } });
