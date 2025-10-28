import { get } from 'http';
"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  getTours,
  getTourById,
  getTopTours,
  createTour,
  updateTour,
  deleteTour,
  activateTour,
  deactivateTour,
  getTourBySlug,
} from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/types/api";

import { Tour } from "@/types/tour";


/* ===========================
 * 🗝️ Query keys (cache key)
 * =========================== */
export const TOUR_QUERY_KEYS = {
  list: (page: number) => ["tours", "list", page] as const,
  tour: (id: string) => ["tours", "detail", id] as const,
  top: (type: string) => ["tours", "top", type] as const,
};

/* ===========================
 * 🟢 Lấy danh sách tour
 * =========================== */
export const useTours = (
  page = 1,
  limit = 10,
  search = ""
): UseQueryResult<PaginatedResponse<Tour[]>, Error> =>
  useQuery({
    queryKey: TOUR_QUERY_KEYS.list(page),
    queryFn: async () => getTours(page, limit, search),
    placeholderData: (prev) => prev, // thay cho keepPreviousData
    staleTime: 2 * 60 * 1000,
  });

/* ===========================
 * 🟢 Lấy chi tiết tour
 * =========================== */
export const useSingleTour = (
  id?: string,
  options: Record<string, any> = {}
): UseQueryResult<ApiResponse<Tour>, Error> =>
  useQuery({
    queryKey: id ? TOUR_QUERY_KEYS.tour(id) : ["tours", "detail"],
    queryFn: async () => getTourById(id!),
    enabled: !!id,
    ...options,
  });

/* ===========================
 * 🟣 Lấy top tour (bán chạy / phổ biến)
 * =========================== */
export const useTopTours = (
  type: "bestseller" | "popular" = "bestseller",
  limit = 5
): UseQueryResult<ApiResponse<Tour[]>, Error> =>
  useQuery({
    queryKey: TOUR_QUERY_KEYS.top(type),
    queryFn: async () => getTopTours(type, limit),
    staleTime: 5 * 60 * 1000,
  });

/* ===========================
 * 🟡 Tạo tour mới
 * =========================== */
export const useCreateTour = (): UseMutationResult<
  ApiResponse<any>,
  Error,
  Omit<Tour, "_id" | "createdAt" | "updatedAt">
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => createTour(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours", "list"] });
    },
  });
};

/* ===========================
 * 🟡 Cập nhật tour
 * =========================== */
export const useUpdateTour = (): UseMutationResult<
  ApiResponse<any>,
  Error,
  { id: string; data: Partial<Tour> }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => updateTour(id, data as any),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: TOUR_QUERY_KEYS.tour(id) });
      queryClient.invalidateQueries({ queryKey: ["tours", "list"] });
    },
  });
};

/* ===========================
 * 🔴 Xóa tour
 * =========================== */
export const useDeleteTour = (): UseMutationResult<ApiResponse<any>, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => deleteTour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours", "list"] });
    },
  });
};

/* ===========================
 * 🟢 Kích hoạt tour
 * =========================== */
export const useActivateTour = (): UseMutationResult<ApiResponse<any>, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => activateTour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours", "list"] });
    },
  });
};

/* ===========================
 * 🔴 Vô hiệu hóa tour
 * =========================== */
export const useDeactivateTour = (): UseMutationResult<ApiResponse<any>, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => deactivateTour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tours", "list"] });
    },
  });
};

export const useGetTourBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["tours", "slug", slug],
    queryFn: async () => getTourBySlug(slug),
    enabled: !!slug,
  });
};

/* ===========================
 * 🧩 Gom các hành động vào 1 hook
 * =========================== */
export const useTourActions = () => {
  const create = useCreateTour();
  const update = useUpdateTour();
  const remove = useDeleteTour();
  const activate = useActivateTour();
  const deactivate = useDeactivateTour();


  return {
    createTour: create.mutate,
    updateTour: update.mutate,
    deleteTour: remove.mutate,
    activateTour: activate.mutate,
    deactivateTour: deactivate.mutate,
    isLoading:
      create.status === "pending" ||
      update.status === "pending" ||
      remove.status === "pending" ||
      activate.status === "pending" ||
      deactivate.status === "pending",
  };
};
