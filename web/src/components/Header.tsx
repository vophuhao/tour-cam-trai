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
    <header className="bg-[hsl(var(--primary))] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold">
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
                    ? "bg-[hsl(var(--primary-light))]"
                    : "hover:bg-[hsl(var(--primary-light))]/50"
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
          {/* Hamburger icon */}
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-[hsl(var(--primary))]/95">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 text-white hover:bg-[hsl(var(--primary-light))]/50 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
