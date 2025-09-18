import type { Request } from 'express';
import type mongoose from 'mongoose';

// Base API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Request Types
export interface AuthenticatedRequest extends Request {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  userAgent?: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
  confirmPassword: string;
}

export interface TokenPayload {
  userId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenData {
  userId: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  refreshToken: string;
  userAgent?: string;
}

// User Types
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  verified: boolean;
  provider: 'local' | 'google' | 'google+local';
  followersCount: number;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserData {
  username?: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
}

// Email Types
export interface EmailVerificationData {
  email: string;
  code: string;
  type: 'email_verification' | 'password_reset';
  expiresAt: Date;
}

// Google Auth Types
export interface GoogleUserData {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}

// Environment Types
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  RESEND_API_KEY?: string;
  CLIENT_URL: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredOnly<T, K extends keyof T> = Partial<T> & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Database Types
export type MongoId = mongoose.Types.ObjectId | string;
export type MongoDocument<T> = mongoose.Document<unknown, {}, T> & T;
