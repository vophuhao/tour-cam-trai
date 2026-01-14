'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

export default function Newsletter() {
  return (
    <section className="from-primary bg-linear-to-r to-green-600 py-20 text-white">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <Mail className="mx-auto mb-6 h-16 w-16" />
        <h2 className="mb-4 text-4xl font-bold md:text-5xl">
          Đăng Ký Nhận Ưu Đãi
        </h2>
        <p className="mb-8 text-lg opacity-90">
          Nhận thông tin về các chương trình khuyến mãi, tour mới và mẹo du lịch
          hữu ích
        </p>
        <div className="mx-auto flex max-w-md gap-2">
          <Input
            type="email"
            placeholder="Nhập email của bạn..."
            className="h-12 border-0 bg-white text-black shadow-lg"
          />
          <Button
            size="lg"
            variant="secondary"
            className="h-12 shadow-lg hover:scale-105"
          >
            Đăng ký
          </Button>
        </div>
        <p className="mt-4 text-sm opacity-75">
          🔒 Chúng tôi cam kết bảo mật thông tin của bạn
        </p>
      </div>
    </section>
  );
}
