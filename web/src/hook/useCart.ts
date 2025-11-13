"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/lib/api";

import { ApiResponse } from "@/types/api";
import type { CartResponse, AddToCartPayload, UpdateCartPayload } from "@/types/cart";

/* ============================================
 * 🔑 Query Keys
 * ============================================ */
export const CART_QUERY_KEYS = {
  cart: ["cart"] as const,
};

/* ============================================
 * 🛒 Lấy giỏ hàng
 * ============================================ */
export const useCart = (): UseQueryResult<ApiResponse<CartResponse>, Error> =>
  useQuery({
    queryKey: CART_QUERY_KEYS.cart,
    queryFn: async () => getCart(),
    staleTime: 2 * 60 * 1000,
  });

/* ============================================
 * ➕ Thêm sản phẩm vào giỏ hàng
 * ============================================ */
export const useAddToCart = (): UseMutationResult<
  ApiResponse<CartResponse>,
  Error,
  AddToCartPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => addToCart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
    },
  });
};

/* ============================================
 * 🔄 Cập nhật số lượng sản phẩm
 * ============================================ */
export const useUpdateCartItem = (): UseMutationResult<
  ApiResponse<CartResponse>,
  Error,
  UpdateCartPayload
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => updateCartItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
    },
  });
};

/* ============================================
 * ❌ Xóa sản phẩm khỏi giỏ hàng
 * ============================================ */
export const useRemoveCartItem = (): UseMutationResult<
  ApiResponse<CartResponse>,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId) => removeCartItem(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
    },
  });
};

/* ============================================
 * 🗑 Xóa toàn bộ giỏ hàng
 * ============================================ */
export const useClearCart = (): UseMutationResult<
  ApiResponse<any>,
  Error,
  void
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEYS.cart });
    },
  });
};

/* ============================================
 * 🧩 Gom toàn bộ cart actions
 * ============================================ */
export const useCartActions = () => {
  const add = useAddToCart();
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const clear = useClearCart();

  return {
    addToCart: add.mutate,
    updateCartItem: update.mutate,
    removeCartItem: remove.mutate,
    clearCart: clear.mutate,

    isLoading:
      add.status === "pending" ||
      update.status === "pending" ||
      remove.status === "pending" ||
      clear.status === "pending",
  };
};
