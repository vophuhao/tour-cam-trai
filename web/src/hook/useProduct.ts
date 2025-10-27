"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  getProduct,
  getAllProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api";
import { ApiResponse } from "@/lib/api";
import {
  Product,
  ProductSpecification,
  ProductVariant,
  ProductDetailSection,
  Category,
} from "@/types/product";

/* ===========================
 * 🗝️ Query keys
 * =========================== */
export const PRODUCT_QUERY_KEYS = {
  list: (page: number) => ["products", "list", page] as const,
  all: ["products", "all"] as const,
  detail: (id: string) => ["products", "detail", id] as const,
  slug: (slug: string) => ["products", "slug", slug] as const,
};

/* ===========================
 * 🟢 Lấy danh sách sản phẩm (phân trang + tìm kiếm)
 * =========================== */
export const useProducts = (
  page = 1,
  limit = 10,
  search = ""
): UseQueryResult<ApiResponse<Product[]>, Error> =>
  useQuery({
    queryKey: PRODUCT_QUERY_KEYS.list(page),
    queryFn: async () => getProduct(page, limit, search),
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
  });

/* ===========================
 * 🟢 Lấy tất cả sản phẩm (không phân trang)
 * =========================== */
export const useAllProducts = (): UseQueryResult<ApiResponse<Product[]>, Error> =>
  useQuery({
    queryKey: PRODUCT_QUERY_KEYS.all,
    queryFn: async () => getAllProduct(),
    staleTime: 5 * 60 * 1000,
  });

/* ===========================
 * 🟢 Lấy chi tiết sản phẩm theo slug
 * =========================== */
export const useProductBySlug = (
  slug?: string,
  options: Record<string, any> = {}
): UseQueryResult<ApiResponse<Product>, Error> =>
  useQuery({
    queryKey: slug ? PRODUCT_QUERY_KEYS.slug(slug) : ["products", "slug"],
    queryFn: async () => getProductBySlug(slug!),
    enabled: !!slug,
    ...options,
  });

/* ===========================
 * 🟡 Tạo sản phẩm
 * =========================== */
export const useCreateProduct = (): UseMutationResult<
  ApiResponse<any>,
  Error,
  Omit<Product, "_id" | "createdAt" | "updatedAt">
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => createProduct(data as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
};

/* ===========================
 * 🟡 Cập nhật sản phẩm
 * =========================== */
export const useUpdateProduct = (): UseMutationResult<
  ApiResponse<any>,
  Error,
  { id: string; data: Partial<Product> }
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => updateProduct(id, data as any),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
};

/* ===========================
 * 🔴 Xóa sản phẩm
 * =========================== */
export const useDeleteProduct = (): UseMutationResult<ApiResponse<any>, Error, string> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "list"] });
    },
  });
};

/* ===========================
 * 🧩 Gom tất cả hành động
 * =========================== */
export const useProductActions = () => {
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const remove = useDeleteProduct();

  return {
    createProduct: create.mutate,
    updateProduct: update.mutate,
    deleteProduct: remove.mutate,
    isLoading:
      create.status === "pending" ||
      update.status === "pending" ||
      remove.status === "pending",
  };
};
