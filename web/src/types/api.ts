export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  timestamp: string;
  data?: T;
}

export interface PaginatedResponse<T = any>{
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

export interface UserResponse<T = any> {
  role: string | null;
  data: T;
  message?: string;
  status?: number;
}