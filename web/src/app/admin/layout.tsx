"use client";
import AdminSidebar from "@/components/AdminSidebar"
import useAuth from "@/hook/useAuth";
import { useRequireRole } from "@/hook/useRequireRole"
import { navigate } from "@/lib/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem("role")
  const {user} = useAuth()
  if (role != "admin" || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h1 className="text-9xl font-extrabold text-gray-300">404</h1>
        <h2 className="text-3xl font-bold mt-4 text-gray-700">Trang không tồn tại</h2>
        <p className="mt-2 text-gray-500">
          Bạn không có quyền truy cập trang này hoặc trang không tồn tại.
        </p>
        <a
          href="/"
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition"
        >
          Quay về trang chủ
        </a>
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="ml-64 flex-1 bg-gray-50 min-h-screen p-6">
        {children}
      </main>
    </div>
  )
}
