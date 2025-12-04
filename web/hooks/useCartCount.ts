/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useSocket } from '@/provider/socketProvider';
import { getCart } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export function useCartCount() {
  const [count, setCount] = useState(0);
  const { socket } = useSocket();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    // Load initial count
    async function loadCount() {
      try {
        const res = await getCart();
        if (res.data?.items) {
          const total = res.data.items.length;
          setCount(total);
        }
      } catch (err) {
        console.error('Load cart count error:', err);
      }
    }

    loadCount();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket || !isAuthenticated) return;

    const handleCartUpdate = (data: any) => {
      if (data.totalItems !== undefined) {
        setCount(data.totalItems);
      } else if (data.items) {
        const total = data.items.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        );
        setCount(total);
      }
    };

    socket.on('cart_updated', handleCartUpdate);

    return () => {
      socket.off('cart_updated', handleCartUpdate);
    };
  }, [socket, isAuthenticated]);

  return count;
}