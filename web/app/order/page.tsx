/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createRating, getOrdersByUser, updateOrderStatus } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RatingModal from "@/components/modals/RatingModal";
import { toast } from "sonner";

const TABS = [
  { key: "all", label: "Tất cả", icon: ShoppingBag, color: "text-gray-600" },
  { key: "pending", label: "Chờ thanh toán", icon: Clock, color: "text-orange-600" },
  { key: "processing", label: "Chờ xác nhận", icon: Package, color: "text-blue-600" },
  { key: "confirmed", label: "Đã xác nhận", icon: CheckCircle2, color: "text-cyan-600" },
  { key: "shipping", label: "Vận chuyển", icon: Truck, color: "text-purple-600" },
  { key: "delivered", label: "Đã giao", icon: CheckCircle2, color: "text-teal-600" },
  { key: "completed", label: "Hoàn thành", icon: CheckCircle2, color: "text-emerald-600" },
  { key: "cancelled", label: "Đã hủy", icon: XCircle, color: "text-red-600" },
];

const STATUS_CONFIG = {
  pending: { label: "Chờ thanh toán", color: "bg-orange-100 text-orange-700 border-orange-200" },
  processing: { label: "Chờ xác nhận", color: "bg-blue-100 text-blue-700 border-blue-200" },
  confirmed: { label: "Đã xác nhận", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  shipping: { label: "Đang giao", color: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered: { label: "Đã giao", color: "bg-teal-100 text-teal-700 border-teal-200" },
  completed: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700 border-red-200" },
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
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
    window.location.href = `/order/detail/${orderId}`;
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Chưa có đơn hàng</h3>
          <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào.</p>
          <Button onClick={() => window.location.href = "/products"} className="bg-emerald-600 hover:bg-emerald-700">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Khám phá tour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-600" />
            Đơn hàng của tôi
          </h1>
          <p className="text-gray-600 mt-1">Quản lý và theo dõi đơn hàng của bạn</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2 min-w-max">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const count = orderCounts[tab.key] || 0;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all
                      ${isActive
                        ? 'bg-emerald-100 text-emerald-700 shadow-sm'
                        : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : tab.color}`} />
                    <span className="font-medium whitespace-nowrap">{tab.label}</span>
                    {count > 0 && (
                      <Badge
                        className={`
                          ml-1 px-2 py-0.5 text-xs font-semibold
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
          </ScrollArea>
        </div>

        {/* Orders List */}
        <ScrollArea className="h-[calc(100vh-300px)]">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-500 py-20"
              >
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Không có đơn hàng trong mục này.</p>
              </motion.div>
            ) : (
              <div className="space-y-4 pb-4">
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
                      <Card className="border-2 hover:border-emerald-200 transition-all hover:shadow-md">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Package className="w-6 h-6 text-emerald-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg font-bold text-gray-900">
                                  {order.code}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                  <Calendar className="w-4 h-4" />
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

                            <Badge className={`${statusConfig.color} border-2 px-4 py-1.5 font-semibold text-sm`}>
                              {statusConfig.label}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="p-6">
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0 shadow-sm">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Tent className="w-10 h-10 text-gray-300" />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1">Số lượng: {item.quantity}</p>
                                </div>

                                <div className="text-right">
                                  <span className="text-emerald-600 font-bold text-lg whitespace-nowrap">
                                    {(item.totalPrice * item.quantity).toLocaleString("vi-VN")}₫
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>

                        <CardFooter className="bg-gradient-to-r from-gray-50 to-white border-t py-4 px-6">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-5 h-5 text-gray-400" />
                              <span className="text-sm text-gray-600 font-medium">Tổng tiền:</span>
                              <span className="text-2xl font-bold text-emerald-600">
                                {order.grandTotal.toLocaleString("vi-VN")}₫
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleViewDetail(order._id)}
                                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Chi tiết
                              </Button>

                              {order.orderStatus === "completed" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold"
                                >
                                  <RotateCcw className="w-4 h-4 mr-1" />
                                  Mua lại
                                </Button>
                              )}

                              {order.paymentStatus === "pending" && order.paymentMethod === "card" && (
                                <Button
                                  onClick={handlePayment(order?.payOSCheckoutUrl)}
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
                                >
                                  <CreditCard className="w-4 h-4 mr-1" />
                                  Thanh toán
                                </Button>
                              )}

                              {order.orderStatus === "delivered" && (
                                <>
                                  <Button
                                    onClick={handleComplete(order)}
                                    size="sm"
                                    disabled={updateStatusMutation.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    {updateStatusMutation.isPending ? "Đang xử lý..." : "Đã nhận"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Yêu cầu hủy đơn
                                  </Button>
                                </>
                              )}

                              {order.orderStatus === "completed" && order.hasRated === false && (
                                <Button
                                  onClick={handleRating(order)}
                                  size="sm"
                                  disabled={ratingMutation.isPending}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md"
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
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
        </ScrollArea>
      </div>

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