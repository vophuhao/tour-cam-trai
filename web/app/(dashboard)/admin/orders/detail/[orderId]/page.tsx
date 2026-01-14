/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { getOrderById, updateOrderStatus, approveRefundRequest, rejectRefundRequest, adminCancelOrder } from "@/lib/api";
import { JSX } from "react/jsx-dev-runtime";

type OrderItem = {
  product?: any;
  product_id?: any;
  name: string;
  quantity: number;
  totalPrice: number;
  image?: string;
};

type ShippingAddress = {
  fullName?: string;
  phone?: string;
  addressLine?: string;
  province?: string;
  district?: string;
};

type Order = {
  _id: string;
  code?: string;
  user?: any;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  paymentMethod?: string;
  shippingMethod?: string;
  itemsTotal?: number;
  shippingFee?: number;
  tax?: number;
  discount?: number;
  grandTotal?: number;
  promoCode?: string;
  orderNote?: string;
  paymentStatus?: string;
  orderStatus?: string;
  payOSOrderCode?: number;
  payOSCheckoutUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  history?: { status: string; date: string; note?: string, images?: string[] }[];
};

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  processing: { label: "Chờ xác nhận", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  confirmed: { label: "Đã xác nhận", color: "text-blue-700", bgColor: "bg-blue-100" },
  shipping: { label: "Đang giao", color: "text-indigo-700", bgColor: "bg-indigo-100" },
  delivered: { label: "Đã giao", color: "text-green-700", bgColor: "bg-green-100" },
  completed: { label: "Hoàn thành", color: "text-purple-700", bgColor: "bg-purple-100" },
  cancelled: { label: "Đã hủy", color: "text-red-700", bgColor: "bg-red-100" },
  cancel_request: { label: "Yêu cầu hủy", color: "text-orange-700", bgColor: "bg-orange-100" },
  refund_request: { label: "Yêu cầu trả hàng", color: "text-pink-700", bgColor: "bg-pink-100" },
  refunded: { label: "Đã hoàn tiền", color: "text-teal-700", bgColor: "bg-teal-100" },
  refund_rejected: { label: "Từ chối trả hàng", color: "text-rose-700", bgColor: "bg-rose-100" },
};

const statusOrder = ["processing", "confirmed", "shipping", "delivered"];

export default function OrderDetail(): JSX.Element {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      setIsLoading(true);
      const res = await getOrderById(orderId);
      if (res?.success) {
        setOrder(res.data || null);
      } else {
        toast.error("Không thể tải đơn hàng");
        router.back();
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tải đơn hàng");
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const formatCurrency = (v?: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v ?? 0);

  const formatDate = (d?: string) => {
    if (!d) return "-";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(d));
  };

  const getStatusBadge = (status?: string) => {
    const cfg = (status && statusConfig[status]) || { label: status ?? "Unknown", color: "text-gray-700", bgColor: "bg-gray-100" };
    return <span className={`px-4 py-2 rounded-full text-sm font-medium ${cfg.bgColor} ${cfg.color}`}>{cfg.label}</span>;
  };

  const getPrimaryImage = (item: OrderItem) => {
    if (item.image) return item.image;
    const imgs = item.product?.images ?? item.product_id?.images;
    if (!imgs) return "/placeholder-product.jpg";
    if (Array.isArray(imgs)) {
      if (typeof imgs[0] === "object") {
        const p = imgs.find((i: any) => i.is_primary);
        return p?.image_url || imgs[0]?.image_url || "/placeholder-product.jpg";
      }
      return imgs[0] || "/placeholder-product.jpg";
    }
    return "/placeholder-product.jpg";
  };

  const getNextStatus = (current?: string) => {
    const flow: Record<string, string> = {
      processing: "confirmed",
      confirmed: "shipping",
      shipping: "delivered",
      delivered: "completed",

    };
    return current ? flow[current] : undefined;
  };

  const getNextLabel = (current?: string) => {
    const labels: Record<string, string> = {
      processing: "Xác nhận đơn",
      confirmed: "Bắt đầu giao hàng",
      shipping: "Đã giao hàng",
      delivered: "Hoàn thành",
      cancel_request: "Xác nhận trả hàng",
      cancelled: "Đơn đã hủy"
    };
    return current ? labels[current] : "Cập nhật";
  };

  const handleUpdateStatus = async (newStatus: string) => {
    const currentLabel = statusConfig[order?.orderStatus || ""]?.label || "";
    const newLabel = statusConfig[newStatus]?.label || "";

    if (!window.confirm(`Bạn có chắc muốn cập nhật trạng thái từ "${currentLabel}" sang "${newLabel}"?`)) return;

    try {
      setIsUpdating(true);
      const res = await updateOrderStatus(orderId!, newStatus);

      if (res?.success) {
        // Cập nhật state local ngay lập tức
        setOrder(prevOrder => {
          if (!prevOrder) return null;

          const updatedOrder = {
            ...prevOrder,
            orderStatus: newStatus,
            history: [
              ...(prevOrder.history || []),
              {
                status: newStatus,
                date: new Date().toISOString(),
                note: undefined
              }
            ]
          };

          return updatedOrder;
        });

        toast.success(`Đã cập nhật sang "${newLabel}"`);
      } else {
        toast.error(res?.message || "Cập nhật thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentStatusIndex = (status?: string) => {
    if (!status) return -1;
    if (status === "cancelled" || status === "cancel_request" || status === "completed" || status === "refund_request" || status === "refunded" || status === "refund_rejected") return -1;
    return statusOrder.indexOf(status);
  };

  const handleApproveRefund = async () => {
    const note = prompt("Nhập ghi chú (không bắt buộc):");
    if (note === null) return; // User cancelled

    if (!window.confirm("Bạn có chắc muốn duyệt yêu cầu trả hàng này?")) return;

    try {
      setIsUpdating(true);
      const res = await approveRefundRequest(orderId!, note || undefined);

      if (res?.success) {
        toast.success("Đã duyệt yêu cầu trả hàng");
        await loadOrder();
      } else {
        toast.error(res?.message || "Duyệt yêu cầu thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi duyệt yêu cầu trả hàng");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectRefund = async () => {
    const note = prompt("Nhập lý do từ chối (không bắt buộc):");
    if (note === null) return; // User cancelled

    if (!window.confirm("Bạn có chắc muốn từ chối yêu cầu trả hàng này?")) return;

    try {
      setIsUpdating(true);
      const res = await rejectRefundRequest(orderId!, note || undefined);

      if (res?.success) {
        toast.success("Đã từ chối yêu cầu trả hàng");
        await loadOrder();
      } else {
        toast.error(res?.message || "Từ chối yêu cầu thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi từ chối yêu cầu trả hàng");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdminCancel = async () => {
    const note = prompt("Nhập lý do hủy đơn (không bắt buộc):");
    if (note === null) return; // User cancelled

    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này? Số lượng sản phẩm sẽ được hoàn trả về kho.")) return;

    try {
      setIsUpdating(true);
      const res = await adminCancelOrder(orderId!, note || undefined);

      if (res?.success) {
        toast.success("Đã hủy đơn hàng");
        await loadOrder();
      } else {
        toast.error(res?.message || "Hủy đơn thất bại");
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi hủy đơn hàng");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusHistory = () => {
    if (!order) return [];
    const currentIndex = getCurrentStatusIndex(order.orderStatus);

    return statusOrder.map((status, index) => {
      const historyItem = order.history?.find(h => h.status === status);
      const isActive = index <= currentIndex;
      const isCurrent = status === order.orderStatus;

      return {
        status,
        label: statusConfig[status]?.label || status,
        date: historyItem?.date,
        isActive,
        isCurrent,
        note: historyItem?.note,
      };
    });
  };
  console.log("Order Data:", order);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Không tìm thấy đơn hàng</p>
          <button onClick={() => router.back()} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const cancelNote =
    order.orderStatus === "cancel_request" || order.orderStatus === "cancelled"
      ? (order.history?.slice().reverse().find(h => h.note)?.note ?? order.orderNote)
      : undefined;

  const statusHistory = getStatusHistory();
  const historyImages = order.history?.flatMap(h => h.images ?? []) ?? [];

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="container mx-auto px-4 py-8">
        <div className=" gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{order.code ?? order._id}</h2>
                  <p className="text-sm text-gray-500">Đặt lúc: {formatDate(order.createdAt)}</p>
                </div>
                {getStatusBadge(order.orderStatus)}
              </div>

              {cancelNote && (
                <div className="mb-4 p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-orange-800 mb-1">
                        {order.orderStatus === "cancel_request" ? "Lý do yêu cầu hủy đơn:" : "Lý do hủy đơn:"}
                      </h4>
                      <p className="text-sm text-orange-700">{cancelNote}</p>
                    </div>
                  </div>
                </div>
              )}
              {historyImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Hình ảnh liên quan:</h4>
                  <div className="flex flex-wrap gap-2">
                    {historyImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Hình ảnh liên quan ${index + 1}`}
                        className="w-24 h-24 object-cover rounded"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.jpg"; }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                {/* Update Status Button */}
                {!["delivered", "cancelled", "completed", "cancel_request"].includes(order.orderStatus ?? "") &&
                  getNextStatus(order.orderStatus) && (
                    <button
                      onClick={() => handleUpdateStatus(getNextStatus(order.orderStatus)!)}
                      disabled={isUpdating}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark 
                   disabled:bg-gray-400 transition text-sm whitespace-nowrap"
                    >
                      {isUpdating ? "⏳ Đang cập nhật..." : getNextLabel(order.orderStatus)}
                    </button>
                  )}

                {/* Admin Cancel Order Button */}
                {order.paymentStatus !== "paid" &&
                  ["pending", "processing"].includes(order.orderStatus ?? "") && (
                    <button
                      onClick={handleAdminCancel}
                      disabled={isUpdating}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 
                   disabled:bg-gray-400 transition text-sm whitespace-nowrap"
                    >
                      {isUpdating ? "⏳ Đang xử lý..." : "Hủy đơn"}
                    </button>
                  )}
              </div>

              {/* Refund Request Action Buttons - Only when status is refund_request */}
              {order.orderStatus === "refund_request" && (
                <div className="mt-3 flex gap-3">
                  <button
                    onClick={handleApproveRefund}
                    disabled={isUpdating}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition text-sm"
                  >
                    {isUpdating ? "⏳ Đang xử lý..." : "Duyệt yêu cầu"}
                  </button>
                  <button
                    onClick={handleRejectRefund}
                    disabled={isUpdating}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition text-sm"
                  >
                    {isUpdating ? "⏳ Đang xử lý..." : "Từ chối yêu cầu"}
                  </button>
                </div>
              )}
            </div>

            {/* Lịch sử đơn hàng */}
            {!["cancelled", "cancel_request"].includes(order.orderStatus ?? "") && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold mb-6">Lịch sử đơn hàng</h3>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${(getCurrentStatusIndex(order.orderStatus) / (statusOrder.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Status Steps */}
                  <div className="relative flex justify-between">
                    {statusHistory.map((item, index) => (
                      <div key={item.status} className="flex flex-col items-center" style={{ flex: 1 }}>
                        {/* Circle */}
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center font-bold text-white z-10 transition-all
                          ${item.isActive ? 'bg-blue-600' : 'bg-gray-300'}
                          ${item.isCurrent ? 'ring-4 ring-blue-200' : ''}
                        `}>
                          {index + 1}
                        </div>

                        {/* Label and Date */}
                        <div className="mt-3 text-center">
                          <p className={`font-medium text-sm ${item.isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                            {item.label}
                          </p>
                          {item.date && (
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(item.date)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 col-span-2">
                <h3 className="text-xl font-bold mb-4">Sản phẩm ({order.items?.length ?? 0})</h3>
                <div className="space-y-4">
                  {order.items?.map((it, idx) => {
                    const unit = it.quantity ? (it.totalPrice / it.quantity) : it.totalPrice;
                    return (
                      <div key={idx} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50 transition">
                        <div className="w-20 h-20 flex-shrink-0">
                          <img
                            src={getPrimaryImage(it)}
                            alt={it.name}
                            className="w-full h-full object-cover rounded border border-gray-200"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.jpg"; }}
                          />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">{it.name}</h4>
                          <p className="text-sm text-gray-500 mb-2">Số lượng: {it.quantity}</p>
                          <div className="flex items-center gap-3">
                            <p className="text-sm text-gray-500">Đơn giá: {formatCurrency(unit)}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold text-green-600">{formatCurrency(it.totalPrice)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                    <h3 className="text-xl font-bold mb-4">Tổng quan đơn hàng</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-700"><span>Tạm tính:</span><span>{formatCurrency(order.itemsTotal)}</span></div>
                      <div className="flex justify-between text-gray-700"><span>Phí vận chuyển:</span><span>{formatCurrency(order.shippingFee)}</span></div>
                      {order.discount && order.discount > 0 && <div className="flex justify-between text-green-600"><span>Giảm giá:</span><span>-{formatCurrency(order.discount)}</span></div>}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Tổng cộng:</span>
                          <span className="text-green-600">{formatCurrency(order.grandTotal)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Phương thức thanh toán:</span><br />
                        {order.paymentMethod === "cod" && "Thanh toán khi nhận hàng (COD)"}
                        {order.paymentMethod === "card" && "Thẻ/Online"}
                      </p>
                    </div>

                    <button onClick={() => router.push("/admin/orders")} className="w-full mt-6 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition">
                      Quay lại danh sách
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold mb-4">Thông tin giao hàng</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700"><span className="font-medium">Người nhận:</span> {order.shippingAddress?.fullName}</p>
                    <p className="text-gray-700"><span className="font-medium">Số điện thoại:</span> {order.shippingAddress?.phone}</p>
                    <p className="text-gray-700"><span className="font-medium">Địa chỉ:</span> {order.shippingAddress ? `${order.shippingAddress.addressLine}, ${order.shippingAddress.province}` : "-"}</p>
                    {order.orderNote && <p className="text-gray-700"><span className="font-medium">Ghi chú:</span> {order.orderNote}</p>}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                  <h3 className="text-xl font-bold mb-4">Thông tin thanh toán</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700"><span className="font-medium">Phương thức:</span> {order.paymentMethod === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Thẻ/Online"}</p>
                    <p className="text-gray-700"><span className="font-medium">Trạng thái thanh toán:</span> {order.paymentStatus === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}