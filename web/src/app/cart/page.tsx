// ...existing code...
"use client";

import { useEffect } from "react";
import Cart from "@/components/Cart";
import { useCart, useCartActions } from "@/hook/useCart";
import { useCartStore } from "@/store/cart";

export default function CartPage() {
  const { data, isLoading, error } = useCart();
  const { updateCartItem, removeCartItem } = useCartActions();

  // zustand actions/selectors
    const setItems = useCartStore((s: any) => s.setItems);
    const updateQty = useCartStore((s: any) => s.updateQuantity);
    const removeFromStore = useCartStore((s: any) => s.removeItem);
  
    const items = data?.data?.items || [];
  
    // hydrate zustand store with server items once
    useEffect(() => {
      if (items && items.length) setItems(items);
    }, [items, setItems]);
  
    if (isLoading) return <div className="p-8">Đang tải giỏ hàng...</div>;
    if (error) return <div className="p-8 text-red-600">Lỗi: {error.message}</div>;
  
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    // optimistic local update
    updateQty(productId, quantity);
    // sync with backend (ensure a Promise so .catch is available)
    Promise.resolve(updateCartItem({ productId, quantity })).catch(() => {
      // rollback by re-hydrating store from last server snapshot
      setItems(items);
    });
  };

  const handleRemoveItem = (productId: string) => {
    // optimistic local remove
    removeFromStore(productId);
    // sync with backend
    Promise.resolve(removeCartItem(productId)).catch(() => {
      // rollback
      setItems(items);
    });
  };

  // cast the imported Cart to any to satisfy JSX prop typing
  const CartAny = Cart as any;

  return (
    <CartAny
      items={items}
      onUpdateQuantity={handleUpdateQuantity}
      onRemoveItem={handleRemoveItem}
    />
  );
}
// ...existing code...