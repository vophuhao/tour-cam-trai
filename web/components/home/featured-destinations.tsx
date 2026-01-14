'use client';

import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

const destinations = [
  {
    id: 1,
    name: 'Sapa - Lào Cai',
    image: 'https://images.unsplash.com/photo-1583952734649-7a976a92bfaa?w=800',
    tours: 12,
    description: 'Núi non hùng vĩ, ruộng bậc thang',
  },
  {
    id: 2,
    name: 'Đà Lạt',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
    tours: 15,
    description: 'Thành phố ngàn hoa, khí hậu mát mẻ',
  },
  {
    id: 3,
    name: 'Phú Quốc',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    tours: 8,
    description: 'Biển xanh, cát trắng, hoàng hôn tuyệt đẹp',
  },
  {
    id: 4,
    name: 'Tây Nguyên',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    tours: 10,
    description: 'Cao nguyên rộng lớn, thiên nhiên hoang sơ',
  },
];

export default function FeaturedDestinations() {
  return (
    <section className="bg-linear-to-b from-gray-50 to-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <span className="bg-primary/10 text-primary mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold">
            Điểm đến
          </span>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Điểm Đến Nổi Bật
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Khám phá những địa điểm cắm trại tuyệt vời nhất, được yêu thích bởi
            hàng nghìn du khách
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map(dest => (
            <Card
              key={dest.id}
              className="group cursor-pointer overflow-hidden border-0 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={dest.image}
                  alt={dest.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute right-0 bottom-0 left-0 p-6 text-white">
                  <h3 className="mb-2 text-2xl font-bold">{dest.name}</h3>
                  <p className="mb-2 text-sm opacity-90">{dest.description}</p>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <MapPin className="h-4 w-4" />
                    {dest.tours} tours có sẵn
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
