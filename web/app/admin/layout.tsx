'use client';

import AdminSidebar from '@/components/admin/admin-sidebar';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const role = user?.role;

  if (role != 'admin' || !user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <h1 className="text-9xl font-extrabold text-gray-300">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-700">
          Trang không tồn tại
        </h2>
        <p className="mt-2 text-gray-500">
          Bạn không có quyền truy cập trang này hoặc trang không tồn tại.
        </p>
        <Link
          href="/"
          className="mt-6 rounded bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="ml-45 min-h-screen flex-1 bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
}
