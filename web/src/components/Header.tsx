"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { name: "Trang chủ", href: "/" },
  { name: "Tour", href: "/tour" },
  { name: "Phụ kiện", href: "/accessories" },
  { name: "Giới thiệu", href: "/about" },
  { name: "Liên hệ", href: "/contact" },
];

export default function Header() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="relative w-full">


      {/* Header Content */}
      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-bold text-black drop-shadow-lg">
          CampAdventure
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive =
              typeof window !== "undefined" &&
              window.location.pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                onMouseEnter={() => setHovered(item.href)}
                onMouseLeave={() => setHovered(null)}
                className={`px-3 py-2 rounded-md font-medium transition-colors ${
                  hovered === item.href || isActive
                    ? "bg-[hsl(var(--primary-light))] text-black"
                    : "hover:bg-[hsl(var(--primary-light))]/50 text-black"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-[hsl(var(--primary-light))]/50 transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="block w-6 h-0.5 mb-1"></span>
          <span className="block w-6 h-0.5 mb-1"></span>
          <span className="block w-6 h-0.5 "></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden relative z-10 bg-[hsl(var(--primary))]/90">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-black hover:bg-[hsl(var(--primary-light))]/50 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
