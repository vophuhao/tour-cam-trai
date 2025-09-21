
import API from "../config/apiClient";

// Kiểu response chung (nếu backend trả JSON chuẩn { data, message, ... })
export interface UserResponse<T = any> {
  role: string | null;
  data: T;
  message?: string;
  status?: number;
}
// Định nghĩa chung, giống ResponseUtil.success ở backend
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  timestamp: string;
  data?: T;
}


// ================== AUTH API ==================
export const register = async (data: {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}): Promise<ApiResponse> => API.post("/auth/register", data);

export const login = async (data: {
  email: string;
  password: string;
}): Promise<UserResponse> => API.post("/auth/login", data);

export const googleLogin = async (data: {
  email: string
  name: string,
  picture: string,
  googleId: string,

}): Promise<UserResponse> => API.post("/auth/login/google", data);

export const logout = async (): Promise<ApiResponse> => API.get("/auth/logout");

export const refreshToken = async (): Promise<ApiResponse> =>
  API.get("/auth/refresh");

export const sendEmailVerification = async (
  email: string
): Promise<ApiResponse> => API.post("/auth/email/verification", { email });

export const verifyEmail = async (
  verificationCode: string
): Promise<ApiResponse> => API.get(`/auth/email/verify/${verificationCode}`);

export const sendPasswordResetEmail = async (
  email: string
): Promise<ApiResponse> => API.post("/auth/password/forgot", { email });

export const resetPassword = async (params: {
  verificationCode: string;
  password: string;
}): Promise<ApiResponse> => API.post("/auth/password/reset", params);

// ================== USER API ==================
export const getUser = async (): Promise<ApiResponse> => API.get("/user");

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
   Promise<ApiResponse> =>  API.get("/category", {
    params: { page, limit, search }})

export const getAllCategories = async ():
   Promise<ApiResponse> =>  API.get("/category/all")
   
// Lấy 1 category theo id
export const getCategoryById = async (id: string) : Promise<ApiResponse> => 
  API.get(`/category/get/${id}`);
export const createCategory = async( data: { name: string; isActive: boolean }) 
: Promise<ApiResponse> => API.post("/category/create", data);
// Cập nhật category
export const updateCategory = async (
  id: string,
  data: { name: string; isActive: boolean }
) : Promise<ApiResponse> => API.post(`/category/update/${id}`, data);
// Xóa category
export const deleteCategory = async (id: string) : Promise<ApiResponse> => 
  API.post(`/category/delete/${id}`);

// ================== product API ==================

export const createProduct = async( data: {  
  name: string;
  description?: string;
  price: number;
  deal: number;
  images : string[]
  stock: number;
  category: string;
  isActive: boolean; }) 
: Promise<ApiResponse> => API.post("/product/create", data);


export const updateProduct = async( id: string, data: {  
  name: string;
  description?: string;
  price: number;
  deal?: number;
  images : string[]
  stock: number;
  category: string;
  isActive: boolean; }) 
: Promise<ApiResponse> => API.post(`/product/update/${id}`, data);

export const getProduct = async (page = 1, limit = 10, search?: string):
   Promise<ApiResponse> =>  API.get("/product", {
    params: { page, limit, search }})

export const getAllProduct = async ():
   Promise<ApiResponse> =>  API.get("/product/all")

export const deleteProduct = async (id: string) : Promise<ApiResponse> => 
  API.post(`/product/delete/${id}`)


