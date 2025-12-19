/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createRating, getOrdersByUser, updateOrderStatus, submitReturnRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingBag,
  Calendar,
  CreditCard,
  Eye,
  RotateCcw,
  Tent,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import RatingModal from "@/components/modals/RatingModal";
import { toast } from "sonner";
import { uploadMedia } from "@/lib/client-actions";

const TABS = [
  { key: "all", label: "Tất cả", icon: ShoppingBag, color: "text-gray-600" },
  { key: "pending", label: "Chờ thanh toán", icon: Clock, color: "text-orange-600" },
  { key: "processing", label: "Chờ xác nhận", icon: Package, color: "text-blue-600" },
  { key: "confirmed", label: "Đã xác nhận", icon: CheckCircle2, color: "text-cyan-600" },
  { key: "shipping", label: "Vận chuyển", icon: Truck, color: "text-purple-600" },
  { key: "delivered", label: "Đã giao", icon: CheckCircle2, color: "text-teal-600" },
  { key: "completed", label: "Hoàn thành", icon: CheckCircle2, color: "text-emerald-600" },
  { key: "cancel_request", label: "Yêu cầu trả hàng", icon: RotateCcw, color: "text-yellow-600" },
  { key: "cancelled", label: "Đã hủy", icon: XCircle, color: "text-red-600" },
];

const STATUS_CONFIG = {
  pending: { label: "Chờ thanh toán", color: "bg-orange-100 text-orange-700 border-orange-200" },
  processing: { label: "Chờ xác nhận", color: "bg-blue-100 text-blue-700 border-blue-200" },
  confirmed: { label: "Đã xác nhận", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered: { label: "Đã giao", color: "bg-teal-100 text-teal-700 border-teal-200" },
  completed: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancel_request: { label: "Yêu cầu trả hàng", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openReturnDialog, setOpenReturnDialog] = useState<boolean>(false);
  const [returnReason, setReturnReason] = useState<string>("");
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const [uploadingReturn, setUploadingReturn] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // Fetch orders với React Query
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await getOrdersByUser();
      return res.data || [];
    },
    refetchInterval: 30000, // Auto refetch mỗi 30s
    refetchOnWindowFocus: true, // Refetch khi quay lại tab
    staleTime: 10000, // Data coi như cũ sau 10s
  });

  // Mutation cho rating
  const ratingMutation = useMutation({
    mutationFn: createRating,
    onSuccess: () => {
      toast.success("Đánh giá thành công!");
      setOpenModal(false);
      setSelectedOrder(null);
      // Invalidate và refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi đánh giá");
      console.error("Error submitting rating", error);
    },
  });

  // Mutation cho update order status
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái thành công!");
      // Invalidate và refetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra");
      console.error("Error updating order status", error);
    },
  });

  // Mutation cho return request
  const returnRequestMutation = useMutation({
    mutationFn: async ({ orderId, reason, images }: { orderId: string; reason: string; images: string[] }) => {
      return submitReturnRequest(orderId, {
        note: reason,
        images: images,
      });
    },
    onSuccess: () => {
      toast.success("Yêu cầu trả hàng đã được gửi!");
      setOpenReturnDialog(false);
      setReturnReason("");
      setReturnImages([]);
      setSelectedOrder(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu");
      console.error("Error submitting return request", error);
    },
  });

  const handleSubmitRating = async (data: any): Promise<void> => {
    try {
      await ratingMutation.mutateAsync(data);
    } catch (error) {
      // error is already handled in the mutation onError, but log for diagnostics
      console.error("Error submitting rating", error);
    }
  };

  const handlePayment = (payOSCheckoutUrl?: string) => () => {
    if (!payOSCheckoutUrl) return;
    window.location.assign(payOSCheckoutUrl);
  };

  const handleComplete = (order: Order) => () => {
    updateStatusMutation.mutate({ orderId: order._id, status: 'completed' });
  };

  const handleRating = (order: Order) => () => {
    setOpenModal(true);
    setSelectedOrder(order);
  };

  const handleViewDetail = (orderId: string) => () => {
    window.location.href = `/order/${orderId}`;
  };

  const handleReturn = (order: Order) => () => {
    setSelectedOrder(order);
    setOpenReturnDialog(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 5 - returnImages.length);
    setReturnImages([...returnImages, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setReturnImages(returnImages.filter((_, i) => i !== index));
  };

  const handleSubmitReturn = async () => {
    if (!selectedOrder) return;
    if (!returnReason.trim()) {
      toast.error("Vui lòng nhập lý do trả hàng");
      return;
    }

    setUploadingReturn(true);
    try {
      // Upload images to cloudinary or your storage
      const uploadedUrls: string[] = [];
      
      for (const file of returnImages) {
        const formData = new FormData();
        formData.append('files', file);
        // This is a placeholder - replace with your actual upload endpoint
        const response = await uploadMedia(formData);
        if (!response.success) {
          throw new Error('Upload failed');
        }
        else
        {
          // Nếu response.data là mảng, lấy phần tử đầu tiên
          // Nếu là string, dùng trực tiếp
          const url = Array.isArray(response.data) ? response.data[0] : response.data;
          uploadedUrls.push(url);
        }
        
      }

      await returnRequestMutation.mutateAsync({
        orderId: selectedOrder._id,
        reason: returnReason,
        images: uploadedUrls,
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Có lỗi xảy ra khi upload hình ảnh');
    } finally {
      setUploadingReturn(false);
    }
  };

  const filtered = useMemo(() => {
    return orders.filter((o: Order) => {
      if (activeTab === "all") return true;
      return o.orderStatus === activeTab;
    });
  }, [orders, activeTab]);

  // Đếm số lượng đơn hàng theo trạng thái
  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((order: Order) => {
      counts[order.orderStatus] = (counts[order.orderStatus] || 0) + 1;
    });
    return counts;
  }, [orders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Tent className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-red-600">Có lỗi xảy ra khi tải đơn hàng</p>
          <Button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['orders'] })}
            className="mt-4"
          >
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border p-3">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const count = orderCounts[tab.key] || 0;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all flex-shrink-0 text-xs
                    ${isActive
                        ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                      }
                  `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : tab.color}`} />
                    <span className="font-medium whitespace-nowrap">{tab.label}</span>
                    {count > 0 && (
                      <Badge
                        className={`
                        ml-0.5 px-1.5 py-0 text-[10px] font-semibold
                        ${isActive
                            ? 'bg-emerald-200 text-emerald-800'
                            : 'bg-gray-200 text-gray-700'
                          }
                      `}
                      >
                        {count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Orders List */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500 py-16"
            >
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Không có đơn hàng trong mục này.</p>
            </motion.div>
          ) : (
            <div className="space-y-3 pb-4">
              {filtered.map((order: Order, index: number) => {
                const statusConfig = STATUS_CONFIG[order.orderStatus as keyof typeof STATUS_CONFIG];

                return (
                  <motion.div
                    key={order._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border hover:border-emerald-200 transition-all hover:shadow-md">
                      <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <Package className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-bold text-gray-900">
                                {order.code}
                              </CardTitle>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                <Calendar className="w-3 h-3" />
                                {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>

                          <Badge className={`${statusConfig.color} border px-3 py-1 font-semibold text-xs`}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4">
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 shadow-sm">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Tent className="w-8 h-8 text-gray-300" />
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h4>
                                <p className="text-xs text-gray-600 mt-0.5">SL: {item.quantity}</p>
                              </div>

                              <div className="text-right">
                                <span className="text-emerald-600 font-bold text-base whitespace-nowrap">
                                  {(item.totalPrice * item.quantity).toLocaleString("vi-VN")}₫
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="bg-gradient-to-r from-gray-50 to-white border-t py-3 px-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600 font-medium">Tổng:</span>
                            <span className="text-xl font-bold text-emerald-600">
                              {order.grandTotal.toLocaleString("vi-VN")}₫
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleViewDetail(order._id)}
                              className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold h-8 text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Chi tiết
                            </Button>

                            {order.orderStatus === "completed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold h-8 text-xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                Mua lại
                              </Button>
                            )}

                            {order.paymentStatus === "pending" && order.paymentMethod === "card" && (
                              <Button
                                onClick={handlePayment(order?.payOSCheckoutUrl)}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md h-8 text-xs"
                              >
                                <CreditCard className="w-3.5 h-3.5 mr-1" />
                                Thanh toán
                              </Button>
                            )}

                            {order.orderStatus === "delivered" && (
                              <>
                                <Button
                                  onClick={handleComplete(order)}
                                  size="sm"
                                  disabled={updateStatusMutation.isPending}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md h-8 text-xs"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  {updateStatusMutation.isPending ? "Đang xử lý..." : "Đã nhận"}
                                </Button>
                                <Button
                                  onClick={handleReturn(order)}
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md h-8 text-xs"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-1" />
                                  Trả hàng
                                </Button>
                              </>
                            )}

                            {order.orderStatus === "completed" && order.hasRated === false && (
                              <Button
                                onClick={handleRating(order)}
                                size="sm"
                                disabled={ratingMutation.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md h-8 text-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                {ratingMutation.isPending ? "Đang gửi..." : "Đánh giá"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {openModal && selectedOrder && (
          <RatingModal
            isOpen={openModal}
            onClose={() => {
              setOpenModal(false);
              setSelectedOrder(null);
            }}
            order={selectedOrder}
            onSubmit={handleSubmitRating}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border p-3">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const count = orderCounts[tab.key] || 0;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all flex-shrink-0 text-xs
                    ${isActive
                      ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : tab.color}`} />
                  <span className="font-medium whitespace-nowrap">{tab.label}</span>
                  {count > 0 && (
                    <Badge
                      className={`
                        ml-0.5 px-1.5 py-0 text-[10px] font-semibold
                        ${isActive
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-gray-200 text-gray-700'
                        }
                      `}
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Orders List */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-gray-500 py-16"
          >
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Không có đơn hàng trong mục này.</p>
          </motion.div>
        ) : (
          <div className="space-y-3 pb-4">
            {filtered.map((order: Order, index: number) => {
              const statusConfig = STATUS_CONFIG[order.orderStatus as keyof typeof STATUS_CONFIG] || 
                { label: order.orderStatus, color: "bg-gray-100 text-gray-700 border-gray-200" };

              return (
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border hover:border-emerald-200 transition-all hover:shadow-md">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-bold text-gray-900">
                              {order.code}
                            </CardTitle>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>

                        <Badge className={`${statusConfig.color} border px-3 py-1 font-semibold text-xs`}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4">
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 shadow-sm">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Tent className="w-8 h-8 text-gray-300" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h4>
                              <p className="text-xs text-gray-600 mt-0.5">SL: {item.quantity}</p>
                            </div>

                            <div className="text-right">
                              <span className="text-emerald-600 font-bold text-base whitespace-nowrap">
                                {(item.totalPrice * item.quantity).toLocaleString("vi-VN")}₫
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="bg-gradient-to-r from-gray-50 to-white border-t py-3 px-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 font-medium">Tổng:</span>
                          <span className="text-xl font-bold text-emerald-600">
                            {order.grandTotal.toLocaleString("vi-VN")}₫
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleViewDetail(order._id)}
                            className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold h-8 text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Chi tiết
                          </Button>

                          {order.orderStatus === "completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold h-8 text-xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" />
                              Mua lại
                            </Button>
                          )}

                          {order.paymentStatus === "pending" && order.paymentMethod === "card" && (
                            <Button
                              onClick={handlePayment(order?.payOSCheckoutUrl)}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md h-8 text-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5 mr-1" />
                              Thanh toán
                            </Button>
                          )}

                          {order.orderStatus === "delivered" && (
                            <>
                              <Button
                                onClick={handleComplete(order)}
                                size="sm"
                                disabled={updateStatusMutation.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md h-8 text-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                {updateStatusMutation.isPending ? "Đang xử lý..." : "Đã nhận"}
                              </Button>
                              <Button
                                onClick={handleReturn(order)}
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md h-8 text-xs"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Trả hàng
                              </Button>
                            </>
                          )}

                          {order.orderStatus === "completed" && order.hasRated === false && (
                            <Button
                              onClick={handleRating(order)}
                              size="sm"
                              disabled={ratingMutation.isPending}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md h-8 text-xs"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              {ratingMutation.isPending ? "Đang gửi..." : "Đánh giá"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {openModal && selectedOrder && (
        <RatingModal
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onSubmit={handleSubmitRating}
        />
      )}

      {/* Return Dialog */}
      <Dialog open={openReturnDialog} onOpenChange={setOpenReturnDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yêu cầu trả hàng</DialogTitle>
            <DialogDescription>
              Đơn hàng: <span className="font-semibold">{selectedOrder?.code}</span>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do trả hàng *</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do bạn muốn trả hàng..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label>Hình ảnh minh chứng (tối đa 5 ảnh)</Label>
              <div className="space-y-3">
                {/* Preview images */}
                {returnImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {returnImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                {returnImages.length < 5 && (
                  <div>
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Label
                      htmlFor="images"
                      className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Tải lên hình ảnh ({returnImages.length}/5)
                      </span>
                    </Label>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Hình ảnh giúp chúng tôi xử lý yêu cầu nhanh hơn
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenReturnDialog(false);
                setReturnReason("");
                setReturnImages([]);
                setSelectedOrder(null);
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitReturn}
              disabled={uploadingReturn || returnRequestMutation.isPending || !returnReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {uploadingReturn || returnRequestMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}