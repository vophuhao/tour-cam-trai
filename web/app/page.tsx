"use client";
import Header from '@/components/Header';
import Hero from '@/components/Hero';

import ProductList from '@/components/ProductList';
import TourList from '@/components/TourList';
import { useAllProducts } from '@/hooks/useProduct';
import { useTours } from '@/hooks/useTour';


export default function Home() {

  const { data, isLoading, error } = useTours(1, 10);
  const { data: products, isLoading: isLoadingProducts, error: errorProducts } = useAllProducts();

  if (isLoading || isLoadingProducts)
    return <div className="text-center py-10 text-gray-500">Đang tải tour...</div>;

  if (error || errorProducts)
    return <div className="text-center py-10 text-red-500">Lỗi: {error?.message || errorProducts?.message}</div>;

  // normalize/flatten the API result to a Tour[] before passing to TourList
  const tours = Array.isArray(data?.data) ? (data!.data ).flat() : [];
  const productsList = products?.data || [];
  
  return (
    <main>
    
      <Hero />

      <div className="max-w-7xl mx-auto mt-10">
        <h4 className="font-bold text-2xl mb-6">Các Tour nổi bật</h4>
        <TourList tours={tours} />
      </div>
      <div className="max-w-7xl mx-auto mt-16 mb-10">
        <h4 className="font-bold text-2xl mb-6 ">Sản phẩm nổi bật</h4>
        <ProductList products={productsList} />
      </div>




    </main>
  );
}
