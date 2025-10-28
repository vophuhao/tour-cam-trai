"use client";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TourList from "@/components/ListTour";
import { useTours } from "@/hook/useTour";

export default function Home() {
  const { data, isLoading, error } = useTours(1, 10);

  if (isLoading)
    return <div className="text-center py-10 text-gray-500">Đang tải tour...</div>;

  if (error)
    return <div className="text-center py-10 text-red-500">Lỗi: {error.message}</div>;

  // normalize/flatten the API result to a Tour[] before passing to TourList
  const tours = Array.isArray(data?.data) ? (data!.data as any).flat() : [];

  return (
    <>
      <Header />
      <Hero />
      <div className="max-w-7xl mx-auto mt-10">
        <h4 className="font-bold text-2xl mb-6">Các Tour nổi bật</h4>
        <TourList tours={tours} />
      </div>
    </>
  );
}
