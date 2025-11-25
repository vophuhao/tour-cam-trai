'use client';

import {
  activateTour,
  createTour,
  deactivateTour,
  deleteTour,
  getTourById,
  getTourBySlug,
  getTours,
  updateTour,
} from '@/lib/client-actions';
import {
  useMutation,
  UseMutationResult,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

export interface Tour {
  _id: string;
  code?: string;
  name: string;
  slug?: string;
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
  rating?: { average: number; count: number };
  viewsCount?: number;
  soldCount?: number;
  createdAt: string;
  updatedAt: string;
}

/* ===========================
 * 🗝️ Query keys (cache key)
 * =========================== */
export const TOUR_QUERY_KEYS = {
  list: (page: number) => ['tours', 'list', page] as const,
  tour: (id: string) => ['tours', 'detail', id] as const,
  top: (type: string) => ['tours', 'top', type] as const,
};

/* ===========================
 * 🟢 Lấy danh sách tour
 * =========================== */
export const useTours = (
  page = 1,
  limit = 10,
  search = '',
): UseQueryResult<ApiResponse<Tour[]>, Error> =>
  useQuery({
    queryKey: TOUR_QUERY_KEYS.list(page),
    queryFn: async () => getTours(page, limit, search),
    placeholderData: prev => prev, // thay cho keepPreviousData
    staleTime: 2 * 60 * 1000,
  });

/* ===========================
 * 🟢 Lấy chi tiết tour
 * =========================== */
export const useSingleTour = (
  id?: string,
  options: Record<string, any> = {},
): UseQueryResult<ApiResponse<Tour>, Error> =>
  useQuery({
    queryKey: id ? TOUR_QUERY_KEYS.tour(id) : ['tours', 'detail'],
    queryFn: async () => getTourById(id!),
    enabled: !!id,
    ...options,
  });

/* ===========================
 * 🟣 Lấy top tour (bán chạy / phổ biến)
 * =========================== */
export const useTopTours = (
  type: 'bestseller' | 'popular' = 'bestseller',
  limit = 5,
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
  Omit<Tour, '_id' | 'createdAt' | 'updatedAt'>
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async data => createTour(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours', 'list'] });
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
      queryClient.invalidateQueries({ queryKey: ['tours', 'list'] });
    },
  });
};

/* ===========================
 * 🔴 Xóa tour
 * =========================== */
export const useDeleteTour = (): UseMutationResult<
  ApiResponse<any>,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async id => deleteTour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours', 'list'] });
    },
  });
};

/* ===========================
 * 🟢 Kích hoạt tour
 * =========================== */
export const useActivateTour = (): UseMutationResult<
  ApiResponse<any>,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async id => activateTour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours', 'list'] });
    },
  });
};

/* ===========================
 * 🔴 Vô hiệu hóa tour
 * =========================== */
export const useDeactivateTour = (): UseMutationResult<
  ApiResponse<any>,
  Error,
  string
> => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async id => deactivateTour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours', 'list'] });
    },
  });
};

export const useGetTourBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['tours', 'slug', slug],
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
      create.status === 'pending' ||
      update.status === 'pending' ||
      remove.status === 'pending' ||
      activate.status === 'pending' ||
      deactivate.status === 'pending',
  };
};
