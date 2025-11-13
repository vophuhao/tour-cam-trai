"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-green-50 to-white text-center px-6">
      <CheckCircle className="w-20 h-20 text-green-600 mb-4" />
      <h1 className="text-2xl font-bold text-green-700 mb-2">Thanh toán thành công!</h1>
      <p className="text-gray-600 mb-6">
        Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý và sẽ sớm được xác nhận.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/orders")}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95"
        >
          Xem đơn hàng
        </button>
        <button
          onClick={() => router.push("/cart")}
          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
}
