"use client";
import AdminSidebar from "@/components/AdminSidebar"
import { useRequireRole } from "@/hook/useRequireRole"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isChecking } = useRequireRole("admin")

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Đang kiểm tra quyền truy cập...</p>
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
