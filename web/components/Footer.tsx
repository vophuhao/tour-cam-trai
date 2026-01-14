'use client';

import {
  CheckCircle2,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Tent,
  Twitter,
  Youtube,
} from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden py-12 text-white">
      {/* Background Image với overlay mờ */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/footer-image-1.avif"
          alt="Camping in nature"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/80" />
      </div>

      {/* Nội dung footer */}
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <Tent className="h-6 w-6 text-emerald-400" />
              Campo
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-300">
              Đồng hành cùng bạn khám phá vẻ đẹp thiên nhiên Việt Nam với những
              tour cắm trại chất lượng cao và thiết bị chuyên nghiệp.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-emerald-500"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-emerald-500"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-emerald-500"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-emerald-500"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-bold">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a
                  href="/tour"
                  className="transition-colors hover:text-emerald-400"
                >
                  Tất cả Tours
                </a>
              </li>
              <li>
                <a
                  href="/product"
                  className="transition-colors hover:text-emerald-400"
                >
                  Thiết bị cắm trại
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="transition-colors hover:text-emerald-400"
                >
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="transition-colors hover:text-emerald-400"
                >
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-lg font-bold">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a
                  href="/faq"
                  className="transition-colors hover:text-emerald-400"
                >
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a
                  href="/booking-guide"
                  className="transition-colors hover:text-emerald-400"
                >
                  Hướng dẫn đặt tour
                </a>
              </li>
              <li>
                <a
                  href="/policy"
                  className="transition-colors hover:text-emerald-400"
                >
                  Chính sách & Điều khoản
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="transition-colors hover:text-emerald-400"
                >
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-lg font-bold">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <span>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-emerald-400" />
                <span>1900 xxxx</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-emerald-400" />
                <span>info@campadventure.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="my-8 h-px bg-gray-700"></div>

        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-gray-400 md:flex-row">
          <p>© 2025 CampAdventure. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Đã đăng ký bản quyền</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
