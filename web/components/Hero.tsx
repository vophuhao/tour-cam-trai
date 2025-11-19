"use client";
import Link from "next/link";

export default function HeroHeader() {
  return (
    <section
      id="hero-section"
      className="relative h-[800px] w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/assets/images/bg-hero.jpg')" }}
    >
      {/* Lớp mờ gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>

      {/* Nội dung Hero */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold">
          Trải nghiệm du lịch mạo hiểm
        </h1>
        <p className="mt-3 text-lg md:text-2xl opacity-90">
          Khám phá thiên nhiên – Chinh phục thử thách!
        </p>

        <Link
          href="/tour"
          className="mt-6 inline-block bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white text-lg font-semibold shadow-lg"
        >
          Khám phá ngay
        </Link>
      </div>
    </section>
  );
}
