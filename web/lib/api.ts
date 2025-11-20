/* eslint-disable @typescript-eslint/no-explicit-any */

import API from "./api-client";



// ================== USER API ==================
export const getUser = async (): Promise<ApiResponse> => API.get("/users/me");

export const getSuggestedUsers = async (): Promise<ApiResponse> =>
  API.get("/users/suggestions");

export const updateProfile = async (
  data: Partial<{ username: string; bio: string; avatar: string }>
): Promise<ApiResponse> => API.patch("/users/me", data);

export const getUserByUsername = async (
  username: string
): Promise<ApiResponse> => API.get(`/users/${username}`);

export const searchUsers = async (
  query: string,
  page = 1,
  limit = 20
): Promise<ApiResponse> =>
  API.get(
    `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );

// ================== SESSION API ==================
export const getSessions = async (): Promise<ApiResponse> =>
  API.get("/sessions");

export const deleteSession = async (id: string): Promise<ApiResponse> =>
  API.delete(`/sessions/${id}`);


export const uploadMedia = async (formData: FormData): Promise<ApiResponse> =>
  API.post("/media/save", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const analyzeMedia = async (formData: FormData): Promise<ApiResponse> =>
  API.post("/media/analyze", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ================== category API ==================
export const getCategories = async (page = 1, limit = 10, search?: string):
   Promise<PaginatedResponse> =>  API.get("/categories", {
    params: { page, limit, search }})

export const getAllCategories = async ():
   Promise<ApiResponse> =>  API.get("/categories/all")
   
// Lấy 1 category theo id
export const getCategoryById = async (id: string) : Promise<ApiResponse> => 
  API.get(`/categories/get/${id}`);
export const createCategory = async( data: { name: string; isActive: boolean }) 
: Promise<ApiResponse> => API.post("/categories/create", data);
// Cập nhật category
export const updateCategory = async (
  id: string,
  data: { name: string; isActive: boolean }
) : Promise<ApiResponse> => API.post(`/categories/update/${id}`, data);
// Xóa category
export const deleteCategory = async (id: string) : Promise<ApiResponse> => 
  API.post(`/categories/delete/${id}`);

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
}): Promise<ApiResponse> => API.post("/products/create", data);


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
  }
): Promise<ApiResponse> => API.post(`/products/update/${id}`, data);

export const getProduct = async (page = 1, limit = 10, search?: string):
   Promise<PaginatedResponse> =>  API.get("/products", {
    params: { page, limit, search }})

export const getProductBySlug = async (slug: string) : Promise<ApiResponse> => 
  API.get(`/products/slug/${slug}`);

export const getAllProduct = async ():
   Promise<ApiResponse> =>  API.get("/products/all")

export const deleteProduct = async (id: string) : Promise<ApiResponse> => 
  API.post(`/products/delete/${id}`)

export const searchProductsFuzzy = async (
  query: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse> =>
  API.get("/products/search", { params: { key: query, page, limit } });

export const getProductsByCategoryName = async (
  name: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse> =>
  API.get(`/products/category/${name}`, { params: { page, limit } });


export const getProductsByPriceRange = async (
  minPrice: number,
  maxPrice: number,
  category?: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse> =>
  API.get("/products/price-range", { params: { minPrice, maxPrice, category, page, limit } });

// ================== TOUR API ==================

// 🟢 Lấy danh sách tour (phân trang + tìm kiếm)
export const getTours = async (
  page = 1,
  limit = 10,
  search?: string
): Promise<PaginatedResponse<Tour>> =>
  API.get("/tours", { params: { page, limit, search } });

// 🟢 Lấy tất cả tour (không phân trang)
export const getAllTours = async (): Promise<ApiResponse> =>
  API.get("/tours/all");

// 🟢 Lấy tour theo ID
export const getTourById = async (id: string): Promise<ApiResponse> =>
  API.get(`/tours/get/${id}`);

//Lay tour theo slug
export const getTourBySlug = async (slug: string): Promise<ApiResponse> =>
  API.get(`/tour/slug/${slug}`);

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
}): Promise<ApiResponse> => API.post("/tours/create", data);

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
  }
): Promise<ApiResponse> => API.post(`/tours/update/${id}`, data);

// 🔴 Xóa tour
export const deleteTour = async (id: string): Promise<ApiResponse> =>
  API.post(`/tours/delete/${id}`);

// 🟢 Kích hoạt tour
export const activateTour = async (id: string): Promise<ApiResponse> =>
  API.post(`/tours/activate/${id}`);

// 🔴 Vô hiệu hóa tour
export const deactivateTour = async (id: string): Promise<ApiResponse> =>
  API.post(`/tours/deactivate/${id}`);

// 🟣 Lấy top tour bán chạy / được xem nhiều
export const getTopTours = async (
  type: "popular" | "bestseller",
  limit = 5
): Promise<ApiResponse> =>
  API.get(`/tours/top`, { params: { type, limit } });

export const getCart = async (): Promise<ApiResponse> =>
  API.get("/cart");

// ➕ Thêm sản phẩm vào giỏ hàng
export const addToCart = async (payload: AddToCartPayload): Promise<ApiResponse> =>
  API.post("/cart/add", payload);

// 🔄 Cập nhật số lượng sản phẩm trong giỏ hàng
export const updateCartItem = async (payload: UpdateCartPayload): Promise<ApiResponse> =>
  API.put("/cart/update", payload);

// ❌ Xóa 1 sản phẩm khỏi giỏ hàng
export const removeCartItem = async (productId: string): Promise<ApiResponse> =>
  API.delete("/cart/remove", { data: { productId } });

// 🗑 Xóa toàn bộ giỏ hàng
export const clearCart = async (): Promise<ApiResponse<{ message: string }>> =>
  API.delete("/cart/clear");

/* ============================================
 * 📬 Lấy danh sách địa chỉ user
 * ============================================ */
export const getAddresses = async (): Promise<ApiResponse> =>
  API.get("/address");

/* ============================================
 * ➕ Thêm địa chỉ mới
 * ============================================ */
export const addAddress = async (payload: Address): Promise<ApiResponse> =>
  API.post("/address", payload);

/* ============================================
 * ❌ Xóa địa chỉ theo index
 * ============================================ */
export const removeAddress = async (index: number): Promise<ApiResponse> =>
  API.delete(`/address/${index}`);

/* ============================================
 * ⭐ Đặt địa chỉ mặc định theo index
 * ============================================ */
export const setDefaultAddress = async (index: number): Promise<ApiResponse> =>
  API.patch(`/address/${index}/default`);


export const createOrder = async (payload: any) : Promise<ApiResponse> => 
   API.post("/orders", payload);

export const getOrdersByUser = async (): Promise<ApiResponse<Order[]>> => 
  API.get("/orders");

export const updateStatusOrder = async (orderId: string): Promise<ApiResponse> =>
  API.patch(`/orders/${orderId}/status`);


export const getOrderById = async (orderId: string): Promise<ApiResponse<Order>> => 
  API.get(`/orders/${orderId}`);

export const cancelOrder = async (orderId: string): Promise<ApiResponse> =>
  API.post(`/orders/${orderId}/cancel`);

// ================== SUPPORT API ==================

export const createConversation = async (): Promise<ApiResponse> =>
  API.post("/support/createConversation");

export const sendMessage = async (
  conversationId: string,
  senderId: string,     // userId hoặc "admin"  
  content: string
): Promise<ApiResponse> =>
  API.post("/support/sendMessage", { conversationId, senderId, content });

export const getMessages = async (
  conversationId: string,
  limit = 50, 
  skip = 0
): Promise<ApiResponse> =>
  API.get("/support/messages", { params: { conversationId, limit, skip } });