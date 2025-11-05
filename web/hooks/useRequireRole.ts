'use client';
import { getUser } from '@/lib/client-actions';
import { RootState } from '@/store';
import { setUser } from '@/store/slices/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const useRequireRole = (requiredRole: 'admin' | 'user') => {
  const router = useRouter();
  const dispatch = useDispatch();
  const role = useSelector((state: RootState) => state.auth.role);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await getUser(); // gọi server
        const userRole = res.data.role;
        if (!userRole || userRole !== requiredRole) {
          router.push('/home'); // role sai
          return;
        }
        dispatch(setUser(res.data)); // lưu tạm
        setIsChecking(false);
      } catch {
        router.push('/login'); // token hết hạn hoặc không hợp lệ
      }
    };

    if (!role) checkRole();
    else if (role !== requiredRole) router.push('/home');
    else setIsChecking(false);
  }, [role, requiredRole, router, dispatch]);

  return { isChecking };
};
