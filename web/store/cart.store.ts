import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartState = {
  items: CartItem[];
  selectedIds: string[]; // store as array for persistence
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  selectItem: (id: string) => void; // NEW: select only one item
  clearSelected: () => void;
  clearAll: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedIds: [],
      setItems: (items: CartItem[]) => {
        // keep selection when possible (only for ids that still exist)
        const existingIds = items.map((it) => it.product._id);
        const newSelected = get().selectedIds.filter((id: string) => existingIds.includes(id));
        set({ items, selectedIds: newSelected.length ? newSelected : existingIds });
      },
      addItem: (item: CartItem) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.product._id === item.product._id);
          if (idx >= 0) {
            const items = state.items.slice();
            items[idx] = { ...items[idx], quantity: items[idx].quantity + item.quantity };
            return { items };
          }
          return { items: [...state.items, item], selectedIds: [...state.selectedIds, item.product._id] };
        }),
      removeItem: (id: string) =>
        set((state) => ({
          items: state.items.filter((i) => i.product._id !== id),
          selectedIds: state.selectedIds.filter((sid: string) => sid !== id),
        })),
      updateQuantity: (id: string, qty: number) =>
        set((state) => ({
          items: state.items.map((i) => (i.product._id === id ? { ...i, quantity: qty } : i)),
        })),
      toggleSelect: (id: string) =>
        set((state) => {
          const exists = state.selectedIds.includes(id);
          return {
            selectedIds: exists ? state.selectedIds.filter((s: string) => s !== id) : [...state.selectedIds, id],
          };
        }),
      toggleSelectAll: () =>
        set((state) => {
          const allIds = state.items.map((it) => it.product._id);
          const selectedAll = state.selectedIds.length === allIds.length;
          return { selectedIds: selectedAll ? [] : allIds };
        }),
      // NEW: Select only one specific item (for "Buy Now" flow)
      selectItem: (id: string) =>
        set((state) => {
          const itemExists = state.items.some((i) => i.product._id === id);
          return {
            selectedIds: itemExists ? [id] : state.selectedIds,
          };
        }),
      clearSelected: () => set({ selectedIds: [] }),
      clearAll: () => set({ items: [], selectedIds: [] }),
    }),
    {
      name: "cart-storage", // key in localStorage
      partialize: (state) => ({ items: state.items, selectedIds: state.selectedIds }),
    }
  )
);