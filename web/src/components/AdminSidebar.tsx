"use client"

import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Home, Users, Package, BarChart, Settings, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

import { logout } from "@/lib/api"  // <-- API logout ở backend

type MenuItem = {
  name: string
  href?: string   // với logout mình không cần href
  icon: React.ComponentType<{ className?: string }>
  action?: () => void
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)

  const handleLogout = async () => {
    try {
      await logout() // gọi API backend
      localStorage.removeItem("role")
      router.push("/login") // chuyển về trang login
    } catch (err) {
      console.error("Logout failed:", err)
    }
  }

  const menuItems: MenuItem[] = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Category", href: "/admin/category", icon: Package },
    { name: "Đăng xuất", icon: LogOut, action: handleLogout }, // xử lý riêng
  ]

  return (
    <aside className="fixed left-0 top-5 h-screen w-64 flex flex-col shadow-lg">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 ">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 ">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          const isHovered = hovered === item.href

          return item.action ? (
            // Nếu có action (logout) -> dùng button
            <button
              key={item.name}
              onClick={item.action}
              onMouseEnter={() => setHovered(item.name)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-4 rounded-lg text-sm font-medium transition-colors text-left",
                hovered === item.name
                  ? "bg-[#4279F1] text-white"
                  : "hover:bg-gray-200"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </button>

          ) : (
            <Link
              key={item.name}
              href={item.href!}
              onMouseEnter={() => setHovered(item.href!)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                "flex items-center gap-3 px-4 py-4 rounded-lg text-sm font-medium transition-colors",
                hovered === item.href
                  ? "bg-[#4279F1] text-white"
                  : !hovered && isActive
                    ? "bg-[#4279F1] text-white"
                    : "hover:bg-gray-200"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>



    </aside>
  )
}
