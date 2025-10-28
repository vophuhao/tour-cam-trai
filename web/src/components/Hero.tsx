"use client";

import Link from "next/link";
import banner from "@/assets/images/banner.jpg";

export default function Hero() {
  return (
    <section
      className="relative bg-cover bg-center h-[80vh] flex items-center"
      style={{ backgroundImage: `url(${banner.src})` }}
    >
      {/* Overlay màu xanh lá mờ */}
      <div className="absolute inset-0 bg-[hsl(var(--primary))/75]"></div>

      <div className="relative max-w-7xl mx-auto px-4 text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          Khám phá thiên nhiên cùng{" "}
          <span className="text-[hsl(var(--accent))]">CampAdventure</span>
        </h1>
        <p className="text-lg md:text-2xl mb-6 drop-shadow-md">
          Tour cắm trại & phụ kiện chất lượng, trải nghiệm trọn vẹn ngoài trời.
        </p>
        <Link
          href="/tour"
          className="inline-block bg-[hsl(var(--accent))] text-[hsl(var(--primary))] px-6 py-3 rounded-lg font-semibold text-lg hover:bg-[hsl(var(--accent))]/90 transition-colors"
        >
          Đặt tour ngay
        </Link>
      </div>
    </section>
  );
}
