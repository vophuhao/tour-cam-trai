"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";

import {
  getAddresses,
  addAddress as apiAddAddress,
  removeAddress as apiRemoveAddress,
  setDefaultAddress as apiSetDefaultAddress,
} from "@/lib/api";

import type { ApiResponse } from "@/types/api";
import type { AddAddressPayload } from "@/types/address";

/* ============================================
 * 🔑 Query Keys
 * ============================================ */
export const ADDRESS_QUERY_KEYS = {
  addresses: ["addresses"] as const,
};

/* ============================================
 * 🏠 Lấy danh sách địa chỉ
 * ============================================ */
export const useAddresses = (): UseQueryResult<ApiResponse, Error> =>
  useQuery({
    queryKey: ADDRESS_QUERY_KEYS.addresses,
    queryFn: async () => getAddresses(),
    staleTime: 2 * 60 * 1000,
  });

/* ============================================
 * ➕ Thêm địa chỉ mới
 * ============================================ */
export const useAddAddress = (): UseMutationResult<
  ApiResponse,
  Error,
  AddAddressPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => apiAddAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEYS.addresses });
    },
  });
};

/* ============================================
 * ❌ Xóa địa chỉ
 * ============================================ */
export const useRemoveAddress = (): UseMutationResult<
  ApiResponse,
  Error,
  number // index của địa chỉ
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index) => apiRemoveAddress(index),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEYS.addresses });
    },
  });
};

/* ============================================
 * ⭐ Đặt địa chỉ mặc định
 * ============================================ */
export const useSetDefaultAddress = (): UseMutationResult<
  ApiResponse,
  Error,
  number // index của địa chỉ
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (index) => apiSetDefaultAddress(index),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESS_QUERY_KEYS.addresses });
    },
  });
};

/* ============================================
 * 🧩 Gom toàn bộ address actions
 * ============================================ */
export const useAddressActions = () => {
  const add = useAddAddress();
  const remove = useRemoveAddress();
  const setDefault = useSetDefaultAddress();

  return {
    addAddress: add.mutate,
    removeAddress: remove.mutate,
    setDefaultAddress: setDefault.mutate,

    isLoading:
      add.status === "pending" ||
      remove.status === "pending" ||
      setDefault.status === "pending",
  };
};
