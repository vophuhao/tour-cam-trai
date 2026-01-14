'use server';

import apiClient from '../api-client';

// Helper function to handle API calls and errors
async function handlePostApiCall<T>(
  endpoint: string,
  data?: Record<string, unknown>,
): Promise<ApiResponse<T> | ErrorResponse> {
  try {
    return (await apiClient.post(endpoint, data)) as ApiResponse<T>;
  } catch (error) {
    return error as ErrorResponse;
  }
}

export async function register(data: {
  email: string;
  username?: string;
  password: string;
  confirmPassword?: string;
}) {
  return handlePostApiCall<User>('/auth/register', data);
}

export async function sendEmailVerification(data: { email: string }) {
  return handlePostApiCall('/auth/verify/send', data);
}

export async function sendPasswordReset(data: { email: string }) {
  return handlePostApiCall('/auth/password/send', data);
}

export async function verifyVerificationCode(data: {
  email: string;
  code: string;
}) {
  return handlePostApiCall('/auth/verify', data);
}

export async function verifyPasswordResetCode(data: {
  email: string;
  code: string;
}) {
  return handlePostApiCall('/auth/password/verify', data);
}

export async function resetPassword(data: { email: string; password: string }) {
  return handlePostApiCall('/auth/password/reset', data);
}
