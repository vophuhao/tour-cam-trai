"use client";

import { useState } from "react";
import Link from "next/link";
import { UserIcon, LogOut} from "lucide-react";
import useAuth from "@/hook/useAuth";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";


export default function Header() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user} = useAuth(); // ✅ Giả sử hook có hàm logout()
  const router = useRouter()  


  const navItems = [
    { name: "Trang chủ", href: "/" },
    { name: "Tour", href: "/tour" },
    { name: "Phụ kiện", href: "/accessories" },
    { name: "Giới thiệu", href: "/about" },
    { name: "Liên hệ", href: "/contact" },
  ];

  const handleLogout = async () => {
     try {
       await logout() // gọi API backend
       localStorage.removeItem("role")
       router.push("/login") 
     } catch (err) {
       console.error("Logout failed:", err)
     }
   }

  return (
    <header className="relative w-full bg-[#141210]">
      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-bold text-[#E8E8E8] drop-shadow-lg">
          CampAdventure
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive =
              typeof window !== "undefined" && window.location.pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHovered(item.href)}
                onMouseLeave={() => setHovered(null)}
                className={`px-3 py-2 rounded-md font-medium transition-colors ${
                  hovered === item.href || isActive
                    ? "bg-[hsl(var(--primary-light))] text-[#E8E8E8]"
                    : "hover:bg-[hsl(var(--primary-light))]/50 text-[#E8E8E8]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Nếu có user thì hiện avatar và nút Đăng xuất */}
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[hsl(var(--primary-light))]/50 text-[#E8E8E8] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-[hsl(var(--primary-light))]/50 text-[#E8E8E8] transition-colors"
            >
              <UserIcon className="w-4 h-4" />
              <span>Đăng nhập</span>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-[hsl(var(--primary-light))]/50 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden relative z-10 bg-[#1c1a18]/90">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-[#E8E8E8] hover:bg-[hsl(var(--primary-light))]/50 transition-colors"
            >
              {item.name}
            </Link>
          ))}

          {/* Mobile version của login/logout */}
          {user ? (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-[#E8E8E8] hover:bg-[hsl(var(--primary-light))]/50 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-[#E8E8E8] hover:bg-[hsl(var(--primary-light))]/50 transition-colors flex items-center gap-2"
            >
              <UserIcon className="w-4 h-4" />
              Đăng nhập
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
