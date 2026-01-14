/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from 'react';
import { useSocket } from '@/provider/socketProvider';
import { getCart } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export function useCartCount() {
  const [count, setCount] = useState(0);
  const { socket } = useSocket();
  const { isAuthenticated } = useAuthStore();

  const loadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCount(0);
      return;
    }

    try {
      const res = await getCart();
      if (res.data?.items) {
        const total = res.data.items.reduce(
          (sum: number, item: any) => sum + (item.quantity || 1),
          0
        );
        setCount(total);
      }
    } catch (err) {
      console.error('Load cart count error:', err);
    }
  }, [isAuthenticated]);

  // Initial load
  useEffect(() => {
    loadCount();
  }, [loadCount]);

  // Socket events
  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleCartUpdate = (data: any) => {
      if (data.totalItems !== undefined) {
        setCount(data.totalItems);
      } else if (data.items) {
        const total = data.items.reduce(
          (sum: number, item: any) => sum + (item.quantity || 1),
          0
        );
        setCount(total);
      } else {
        loadCount();
      }
    };

    socket.on('cart_updated', handleCartUpdate);
    socket.on('cart_added', loadCount);
    socket.on('cart_removed', loadCount);

    return () => {
      socket.off('cart_updated', handleCartUpdate);
      socket.off('cart_added', loadCount);
      socket.off('cart_removed', loadCount);
    };
  }, [socket, isAuthenticated, loadCount]);

  // Window custom events
  useEffect(() => {
    if (!isAuthenticated) return;

    window.addEventListener('cart:updated', loadCount);
    window.addEventListener('cart:added', loadCount);
    window.addEventListener('cart:removed', loadCount);

    return () => {
      window.removeEventListener('cart:updated', loadCount);
      window.removeEventListener('cart:added', loadCount);
      window.removeEventListener('cart:removed', loadCount);
    };
  }, [isAuthenticated, loadCount]);

  return count;
}