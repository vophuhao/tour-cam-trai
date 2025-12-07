'use client';

import { userCancelPayment } from '@/lib/client-actions';
import { XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentCancelPage() {
  const router = useRouter();
   const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode");
  console.log('Booking ID from params:', orderCode);
  useEffect(() => {
    // Call API to cancel payment and remove booking
    const cancelPayment = async () => {
      try {
        const response = await userCancelPayment(orderCode!);
        
        console.log('Payment cancelled:', response);
      } catch (error) {
        console.error('Error cancelling payment:', error);
      }
    };

    cancelPayment();
  }, [orderCode]);
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
          onClick={() => router.push('/')}
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 hover:bg-gray-50"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
