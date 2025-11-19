/* eslint-disable @next/next/no-img-element */
// ...existing code...
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

type User = { name?: string; avatar?: string };

const navItems = [
  { name: "Trang chủ", href: "/" },
  { name: "Tour", href: "/tour" },
  { name: "Phụ kiện", href: "/product" },
  { name: "Giới thiệu", href: "/about" },
  { name: "Liên hệ", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);

  // compute initial transparent synchronously (safe for SSR)
  const getInitialTransparent = () => {
    // nếu là trang root -> luôn trong suốt, không cần kiểm tra hero
    if (pathname === "/") return true;
    if (typeof document === "undefined") return false;
    const hero = document.getElementById("hero-section");
    if (!hero) return false;
    const rect = hero.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom > rect.height * 0.3;
  };

  const [transparent, setTransparent] = useState<boolean>(getInitialTransparent);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // register observer only on non-root pages (root handled by pathname)
  useEffect(() => {
    let rafId: number | null = null;

    const applyTransparent = (val: boolean) => {
      // schedule state update asynchronously to avoid synchronous setState in effect
      rafId = window.requestAnimationFrame(() => {
        setTransparent(val);
      });
    };

    if (pathname === "/") {
      // ensure state stays true for root (scheduled)
      applyTransparent(true);
      return () => {
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    }

    const hero = document.getElementById("hero-section");
    if (!hero) {
      // schedule false rather than set synchronously
      applyTransparent(false);
      return () => {
        if (rafId) window.cancelAnimationFrame(rafId);
      };
    }

    // initial synchronous read is fine, but update is scheduled via observer callback
    const obs = new IntersectionObserver(([entry]) => {
      // observer callback runs asynchronously; still schedule for consistency
      applyTransparent(entry.isIntersecting);
    }, {
      threshold: 0.3,
    });
    obs.observe(hero);
    return () => {
      obs.disconnect();
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [pathname]);
  // ...existing code...

  // close popup when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch { }
    setMenuOpen(false);
    router.push("/");
  };

  const isTransparentNow = transparent;

  return (
    <header
      className={`w-full transition-all duration-300 ${isTransparentNow
          ? "bg-transparent text-white absolute top-0 left-0 z-50"
          : "bg-white text-gray-800 shadow-lg border-b border-gray-200 relative"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="text-2xl font-bold">CampAdventure</Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition ${isTransparentNow ? "hover:text-green-300" : "hover:text-green-600"}`}
              >
                {item.name}
              </Link>
            ))}

            <div className="relative" ref={menuRef}>
              {user === undefined ? (
                <div className={`px-3 py-2 rounded-md text-sm `}>...</div>
              ) : user === null ? (
                <Link href="/sign-in" className={`px-3 py-2 rounded-md text-sm font-medium ${isTransparentNow ? " text-gray-900" : "bg-green-600 text-white"}`}>Đăng nhập</Link>
              ) : (
                <>
                  <button onClick={() => setMenuOpen((s) => !s)} className="flex items-center gap-2 px-3 py-1 rounded-md text-sm">
                    <img src={"/assets/images/default-avatar.jpg"} alt="avatar" className="w-7 h-7 rounded-full object-cover" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-36 bg-white text-gray-800 rounded-md shadow-lg border border-gray-100 overflow-hidden z-50">
                      <Link href="/order" className="block px-4 py-3 text-sm hover:bg-gray-50">Đơn hàng</Link>
                      <Link href="/cart" className="block px-4 py-3 text-sm hover:bg-gray-50">Giỏ hàng</Link>
                      <div className="border-t border-gray-100" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50">Đăng xuất</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <div className="md:hidden">
              {user === undefined ? null : user === null ? (
                <Link href="/sign-in" className="px-3 py-2 rounded-md text-sm bg-green-600 text-white">Đăng nhập</Link>
              ) : (
                <button onClick={() => setMenuOpen((s) => !s)} className="px-2 py-1 rounded-full shadow">
                  <img src={"/assets/images/default-avatar.png"} alt="avatar" className="w-7 h-7 rounded-full" />
                </button>
              )}
            </div>

            <button className="md:hidden p-2 rounded-md" onClick={() => setMobileOpen((s) => !s)}>
              <div className="w-6 h-[2px] bg-current mb-1" />
              <div className="w-6 h-[2px] bg-current mb-1" />
              <div className="w-6 h-[2px] bg-current" />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white text-gray-800 border-t border-gray-200">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="block px-4 py-3 hover:bg-gray-100" onClick={() => setMobileOpen(false)}>{item.name}</Link>
          ))}

          <div className="border-t border-gray-100" />
          <div className="px-4 py-3">
            {user === undefined ? null : user === null ? (
              <Link href="/sign-in" className="block px-4 py-2 bg-green-600 text-white rounded-md text-center">Đăng nhập</Link>
            ) : (
              <>
                <Link href="/order" className="block px-4 py-2 rounded-md hover:bg-gray-50">Đơn hàng</Link>
                <Link href="/cart" className="block px-4 py-2 rounded-md hover:bg-gray-50">Giỏ hàng</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50">Đăng xuất</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
// ...existing code...