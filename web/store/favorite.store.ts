import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  _id: string;
  user: string;
  property?: {
    _id: string;
    name: string;
    slug: string;
    photos: Array<{
      url: string;
      caption?: string;
      isCover: boolean;
      order: number;
    }>;
    pricing?: {
      minPrice?: number;
      maxPrice?: number;
      currency: string;
    };
    stats: {
      averageRating: number;
      totalReviews: number;
    };
    location: {
      city: string;
      state: string;
      country: string;
    };
    propertyType: string;
  };
  site?: {
    _id: string;
    name: string;
    slug: string;
    photos: string[];
    pricing: {
      basePrice: number;
      currency: string;
    };
    propertyRef: string;
    siteType: string;
    capacity: {
      maxGuests: number;
    };
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FavoriteState {
  // Favorites list (property IDs only for quick lookup)
  propertyFavorites: Set<string>;
  siteFavorites: Set<string>;

  // Actions
  addPropertyFavorite: (propertyId: string) => void;
  removePropertyFavorite: (propertyId: string) => void;
  addSiteFavorite: (siteId: string) => void;
  removeSiteFavorite: (siteId: string) => void;
  isPropertyFavorited: (propertyId: string) => boolean;
  isSiteFavorited: (siteId: string) => boolean;
  clearFavorites: () => void;
  initializeFavorites: (favorites: FavoriteItem[]) => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      propertyFavorites: new Set<string>(),
      siteFavorites: new Set<string>(),

      addPropertyFavorite: (propertyId: string) =>
        set(state => ({
          propertyFavorites: new Set(state.propertyFavorites).add(propertyId),
        })),

      removePropertyFavorite: (propertyId: string) =>
        set(state => {
          const newSet = new Set(state.propertyFavorites);
          newSet.delete(propertyId);
          return { propertyFavorites: newSet };
        }),

      addSiteFavorite: (siteId: string) =>
        set(state => ({
          siteFavorites: new Set(state.siteFavorites).add(siteId),
        })),

      removeSiteFavorite: (siteId: string) =>
        set(state => {
          const newSet = new Set(state.siteFavorites);
          newSet.delete(siteId);
          return { siteFavorites: newSet };
        }),

      isPropertyFavorited: (propertyId: string) =>
        get().propertyFavorites.has(propertyId),

      isSiteFavorited: (siteId: string) => get().siteFavorites.has(siteId),

      clearFavorites: () =>
        set({
          propertyFavorites: new Set<string>(),
          siteFavorites: new Set<string>(),
        }),

      initializeFavorites: (favorites: FavoriteItem[]) => {
        const propertyIds = new Set<string>();
        const siteIds = new Set<string>();

        favorites.forEach(fav => {
          if (fav.property) {
            propertyIds.add(fav.property._id);
          }
          if (fav.site) {
            siteIds.add(fav.site._id);
          }
        });

        set({
          propertyFavorites: propertyIds,
          siteFavorites: siteIds,
        });
      },
    }),
    {
      name: 'favorite-storage',
      // Custom storage to handle Set serialization
      storage: {
        getItem: name => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          return {
            state: {
              ...data.state,
              propertyFavorites: new Set(data.state.propertyFavorites || []),
              siteFavorites: new Set(data.state.siteFavorites || []),
            },
          };
        },
        setItem: (name, value) => {
          const data = {
            state: {
              propertyFavorites: Array.from(value.state.propertyFavorites),
              siteFavorites: Array.from(value.state.siteFavorites),
            },
          };
          localStorage.setItem(name, JSON.stringify(data));
        },
        removeItem: name => localStorage.removeItem(name),
      },
    },
  ),
);
