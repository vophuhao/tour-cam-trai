"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f0e0d] text-gray-300 border-t border-gray-700 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Cột 1 - Logo và mô tả */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">TravelHub</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Khám phá thế giới theo cách riêng của bạn — cùng những tour độc đáo
            và sản phẩm du lịch chất lượng cao.
          </p>
          <div className="flex gap-4 mt-5">
            <Link href="#" className="hover:text-blue-500 transition">
              <Facebook size={20} />
            </Link>
            <Link href="#" className="hover:text-pink-500 transition">
              <Instagram size={20} />
            </Link>
            <Link href="#" className="hover:text-sky-400 transition">
              <Twitter size={20} />
            </Link>
            <Link href="#" className="hover:text-red-500 transition">
              <Youtube size={20} />
            </Link>
          </div>
        </div>

        {/* Cột 2 - Liên kết nhanh */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Liên kết nhanh
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-yellow-400 transition">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/tours" className="hover:text-yellow-400 transition">
                Tour du lịch
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-yellow-400 transition">
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-yellow-400 transition">
                Liên hệ
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3 - Thông tin hỗ trợ */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Hỗ trợ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/faq" className="hover:text-yellow-400 transition">
                Câu hỏi thường gặp
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-yellow-400 transition">
                Điều khoản & Chính sách
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-yellow-400 transition">
                Chính sách bảo mật
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 4 - Liên hệ */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Liên hệ</h3>
          <ul className="text-sm space-y-2">
            <li>
              <span className="text-gray-400">📍</span> 123 Nguyễn Văn Linh, Đà Nẵng
            </li>
            <li>
              <span className="text-gray-400">📞</span> +84 987 654 321
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-gray-400" />
              <a
                href="mailto:support@travelhub.vn"
                className="hover:text-yellow-400 transition"
              >
                support@travelhub.vn
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Dòng bản quyền */}
      <div className="border-t border-gray-700 py-5 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} <span className="text-white font-semibold">TravelHub</span>. 
        All rights reserved.
      </div>
    </footer>
  );
}
