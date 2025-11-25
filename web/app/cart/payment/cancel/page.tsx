'use client';

import { XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center bg-linear-to-b from-red-50 to-white px-6 text-center">
      <XCircle className="mb-4 h-20 w-20 text-red-500" />
      <h1 className="mb-2 text-2xl font-bold text-red-600">
        Thanh toán thất bại hoặc bị hủy
      </h1>
      <p className="mb-6 text-gray-600">
        Giao dịch của bạn chưa được hoàn tất. Bạn có thể thử lại hoặc chọn
        phương thức khác.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => router.push('/cart')}
          className="rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white hover:opacity-95"
        >
          Quay lại giỏ hàng
        </button>
        <button
          onClick={() => router.push('/')}
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
