import API from "../config/apiClient";

// Kiểu response chung (nếu backend trả JSON chuẩn { data, message, ... })
export interface ApiResponse<T = any> {
  role: string | null;
  data: T;
  message?: string;
  status?: number;
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
}): Promise<ApiResponse> => API.post("/auth/login", data);

export const googleLogin = async (data: {
  email: string
  name: string,
  picture: string,
  googleId: string,

}): Promise<ApiResponse> => API.post("/auth/login/google", data);

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

