"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gradient-to-b from-red-50 to-white text-center px-6">
      <XCircle className="w-20 h-20 text-red-500 mb-4" />
      <h1 className="text-2xl font-bold text-red-600 mb-2">Thanh toán thất bại hoặc bị hủy</h1>
      <p className="text-gray-600 mb-6">
        Giao dịch của bạn chưa được hoàn tất. Bạn có thể thử lại hoặc chọn phương thức khác.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/cart")}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95"
        >
          Quay lại giỏ hàng
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
