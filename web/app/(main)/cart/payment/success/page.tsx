'use client';

import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-linear-to-b from-green-50 to-white px-6 text-center">
      <CheckCircle className="mb-4 h-20 w-20 text-green-600" />
      <h1 className="mb-2 text-2xl font-bold text-green-700">
        Thanh toán thành công!
      </h1>
      <p className="mb-6 text-gray-600">
        Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý và sẽ sớm được
        xác nhận.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/orders')}
          className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white hover:opacity-95"
        >
          Xem đơn hàng
        </button>
        <button
          onClick={() => router.push('/cart')}
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
}
