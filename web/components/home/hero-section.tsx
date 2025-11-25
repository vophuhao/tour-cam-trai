'use client';

import { Button } from '@/components/ui/button';
import { Award, MapPin, Package, Search, Users } from 'lucide-react';
import Image from 'next/image';

const stats = [
  { icon: Award, label: 'Tours đã tổ chức', value: '1,200+' },
  { icon: Users, label: 'Khách hàng hài lòng', value: '10,000+' },
  { icon: MapPin, label: 'Địa điểm', value: '50+' },
  { icon: Package, label: 'Sản phẩm', value: '500+' },
];

export default function HeroSection() {
  return (
    <section className="relative -mt-16 h-[764px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/assets/images/landing-image.jpeg"
          alt="Hero camping"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/60" />
      </div>
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center text-white">
        <div className="bg-primary/20 mb-6 inline-block rounded-full px-6 py-2 text-sm font-semibold backdrop-blur-sm">
          ✨ Khám phá thiên nhiên cùng chúng tôi
        </div>
        <h1 className="mb-6 text-5xl leading-tight font-bold md:text-6xl lg:text-7xl">
          Trải Nghiệm Cắm Trại
          <br />
          <span className="from-primary bg-linear-to-r to-green-400 bg-clip-text text-transparent">
            Đáng Nhớ Nhất
          </span>
        </h1>
        <p className="mb-10 max-w-2xl text-lg leading-relaxed md:text-xl">
          Hành trình khám phá thiên nhiên tuyệt vời tại các địa điểm cắm trại
          đẹp nhất Việt Nam. Tận hưởng không gian yên bình, cùng những trải
          nghiệm khó quên.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" className="group text-lg shadow-lg">
            <Search className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
            Tìm Tour Ngay
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white bg-white/10 text-lg text-white backdrop-blur-sm hover:bg-white/20"
          >
            <Package className="mr-2 h-5 w-5" />
            Xem Ưu Đãi
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute right-0 bottom-0 left-0 z-10 bg-white/10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center gap-3 text-white">
                  <Icon className="text-primary h-8 w-8" />
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm opacity-90">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
