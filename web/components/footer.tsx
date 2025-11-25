'use client';

import { Separator } from '@/components/ui/separator';
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
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-gray-900 py-12 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-2xl font-bold">
              <Tent className="text-primary h-6 w-6" />
              CampAdventure
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-400">
              Đồng hành cùng bạn khám phá vẻ đẹp thiên nhiên Việt Nam với những
              tour cắm trại chất lượng cao và thiết bị chuyên nghiệp.
            </p>
            <div className="flex gap-3">
              <Link
                href="#"
                className="hover:bg-primary rounded-full bg-white/10 p-2 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="hover:bg-primary rounded-full bg-white/10 p-2 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="hover:bg-primary rounded-full bg-white/10 p-2 transition-colors"
              >
                <Youtube className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="hover:bg-primary rounded-full bg-white/10 p-2 transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-lg font-bold">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  href="/tour"
                  className="hover:text-primary transition-colors"
                >
                  Tất cả Tours
                </Link>
              </li>
              <li>
                <Link
                  href="/product"
                  className="hover:text-primary transition-colors"
                >
                  Thiết bị cắm trại
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-lg font-bold">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  href="/faq"
                  className="hover:text-primary transition-colors"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  href="/booking-guide"
                  className="hover:text-primary transition-colors"
                >
                  Hướng dẫn đặt tour
                </Link>
              </li>
              <li>
                <Link
                  href="/policy"
                  className="hover:text-primary transition-colors"
                >
                  Chính sách & Điều khoản
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 text-lg font-bold">Liên hệ</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                <span>123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="text-primary h-5 w-5" />
                <span>1900 xxxx</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="text-primary h-5 w-5" />
                <span>info@campadventure.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-gray-800" />

        <div className="flex flex-col items-center justify-between gap-4 text-center text-sm text-gray-400 md:flex-row">
          <p>© 2025 CampAdventure. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-primary h-4 w-4" />
            <span>Đã đăng ký bản quyền</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
