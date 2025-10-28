"use client";

import { Tour } from "@/types/tour";
import Image from "next/image";
import Link from "next/link";



interface TourListProps {
  tours: Tour[];
}

export default function TourList({ tours }: TourListProps) {


  return (
    <section className="w-full  ">
      <div className="max-w-7xl mx-auto ">
     
        {tours.length === 0 ? (
          <p className="text-gray-400">Hiện chưa có tour nào.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tours.map((tour) => (
              <Link
                href={`/tour/${tour.slug || tour._id}`}
                key={tour._id}
                className="group bg-[#1c1a18] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Hình ảnh */}
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={tour.images?.[0] || "/images/default-tour.jpg"}
                    alt={tour.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent"></div>
                </div>

                {/* Nội dung */}
                <div className="p-4 text-[#E8E8E8]">
                  <h3 className="text-lg font-semibold mb-1 line-clamp-2">
                    {tour.name}
                  </h3>

                  <p className="text-sm text-gray-400 mb-2">
                    {tour.durationDays}N{tour.durationNights}Đ
                  </p>

                  {/* Giá thấp nhất */}
                  <p className="text-yellow-400 font-bold mb-3">
                    {Math.min(...tour.priceOptions.map((p) => p.price)).toLocaleString()}đ
                  </p>

                  {/* Rating */}
                  {tour.rating && (
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                      <span>⭐ {tour.rating.average.toFixed(1)}</span>
                      <span>({tour.rating.count})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
