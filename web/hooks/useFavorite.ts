'use client';

import {
  addPropertyToFavorites,
  addSiteToFavorites,
  getUserFavorites,
  isPropertyFavorited,
  isSiteFavorited,
  removePropertyFromFavorites,
  removeSiteFromFavorites,
  updateFavoriteNotes,
} from '@/lib/client-actions';
import { useAuthStore } from '@/store/auth.store';
import { useFavoriteStore } from '@/store/favorite.store';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { toast } from 'sonner';

// ==================== Favorite Hooks ====================

/**
 * Hook to fetch and initialize user's favorites
 */
export function useFavorites(type: 'property' | 'site' | 'all' = 'all') {
  const { isAuthenticated } = useAuthStore();
  const { initializeFavorites } = useFavoriteStore();

  const query = useQuery({
    queryKey: ['favorites', type],
    queryFn: async () => {
      const response = await getUserFavorites({ type, limit: 100 });
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Initialize store when data is loaded
  useEffect(() => {
    if (query.data) {
      initializeFavorites(query.data);
    }
  }, [query.data, initializeFavorites]);

  return query;
}

/**
 * Hook to toggle property favorite status
 */
export function useTogglePropertyFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const {
    isPropertyFavorited: isInStore,
    addPropertyFavorite,
    removePropertyFavorite,
  } = useFavoriteStore();

  const addMutation = useMutation({
    mutationFn: async ({
      propertyId,
      notes,
    }: {
      propertyId: string;
      notes?: string;
    }) => {
      const response = await addPropertyToFavorites(propertyId, notes);
      return response.data;
    },
    onSuccess: data => {
      if (data?.property) {
        addPropertyFavorite(data.property._id);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
      // Invalidate favorites query
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể thêm vào danh sách yêu thích';
      toast.error(errorMessage);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      await removePropertyFromFavorites(propertyId);
    },
    onSuccess: (_, propertyId) => {
      removePropertyFavorite(propertyId);
      toast.success('Đã xóa khỏi danh sách yêu thích');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể xóa khỏi danh sách yêu thích';
      toast.error(errorMessage);
    },
  });

  const toggle = useCallback(
    (propertyId: string, notes?: string) => {
      if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập để lưu yêu thích');
        return;
      }

      const isFavorited = isInStore(propertyId);

      if (isFavorited) {
        removeMutation.mutate(propertyId);
      } else {
        addMutation.mutate({ propertyId, notes });
      }
    },
    [isAuthenticated, isInStore, addMutation, removeMutation],
  );

  return {
    toggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
    isInStore,
  };
}

/**
 * Hook to toggle site favorite status
 */
export function useToggleSiteFavorite() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const {
    isSiteFavorited: isInStore,
    addSiteFavorite,
    removeSiteFavorite,
  } = useFavoriteStore();

  const addMutation = useMutation({
    mutationFn: async ({
      siteId,
      notes,
    }: {
      siteId: string;
      notes?: string;
    }) => {
      const response = await addSiteToFavorites(siteId, notes);
      return response.data;
    },
    onSuccess: data => {
      if (data?.site) {
        addSiteFavorite(data.site._id);
        toast.success('Đã thêm vào danh sách yêu thích');
      }
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể thêm vào danh sách yêu thích';
      toast.error(errorMessage);
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (siteId: string) => {
      await removeSiteFromFavorites(siteId);
    },
    onSuccess: (_, siteId) => {
      removeSiteFavorite(siteId);
      toast.success('Đã xóa khỏi danh sách yêu thích');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Không thể xóa khỏi danh sách yêu thích';
      toast.error(errorMessage);
    },
  });

  const toggle = useCallback(
    (siteId: string, notes?: string) => {
      if (!isAuthenticated) {
        toast.error('Vui lòng đăng nhập để lưu yêu thích');
        return;
      }

      const isFavorited = isInStore(siteId);

      if (isFavorited) {
        removeMutation.mutate(siteId);
      } else {
        addMutation.mutate({ siteId, notes });
      }
    },
    [isAuthenticated, isInStore, addMutation, removeMutation],
  );

  return {
    toggle,
    isLoading: addMutation.isPending || removeMutation.isPending,
    isInStore,
  };
}

/**
 * Hook to update favorite notes
 */
export function useUpdateFavoriteNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      favoriteId,
      notes,
    }: {
      favoriteId: string;
      notes?: string;
    }) => {
      const response = await updateFavoriteNotes(favoriteId, notes);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Đã cập nhật ghi chú');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể cập nhật ghi chú';
      toast.error(errorMessage);
    },
  });
}

/**
 * Hook to check if property is favorited (server check)
 */
export function useIsPropertyFavorited(propertyId: string | null) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['favorite-check', 'property', propertyId],
    queryFn: async () => {
      if (!propertyId) return { isFavorited: false };
      const response = await isPropertyFavorited(propertyId);
      return response.data;
    },
    enabled: isAuthenticated && !!propertyId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to check if site is favorited (server check)
 */
export function useIsSiteFavorited(siteId: string | null) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['favorite-check', 'site', siteId],
    queryFn: async () => {
      if (!siteId) return { isFavorited: false };
      const response = await isSiteFavorited(siteId);
      return response.data;
    },
    enabled: isAuthenticated && !!siteId,
    staleTime: 1000 * 60, // 1 minute
  });
}
