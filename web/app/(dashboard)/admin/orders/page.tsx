'use client';

import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { getAllOrders } from '@/lib/client-actions';
import { useMutation, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useState } from 'react';
import { columns } from './columns';
import { getStatusInfo } from './helper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import queryClient from '@/lib/query-client';
import { updateStatusOrder } from '@/lib/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Package, ShoppingCart, TrendingUp, DollarSign } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | Order['orderStatus']>('all');

  const { data: ordersData = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await getAllOrders();
      return response.data || [];
    },
  });

  const handleView = (order: Order) => {
    router.push(`/admin/orders/detail/${order._id}`);
  };

  const handleUpdateStatus = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await updateStatusOrder(orderId);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("Cập nhật trạng thái đơn hàng thành công");
    },
    onError: () => {
      toast.error("Cập nhật trạng thái thất bại");
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  const statuses: { value: 'all' | Order['orderStatus']; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ thanh toán' },
    { value: 'processing', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
    { value: 'cancel_request', label: 'Yêu cầu hủy' },
  ];

  const filteredOrders =
    filterStatus === 'all' ? ordersData : ordersData.filter(o => o.orderStatus === filterStatus);

  // Stats calculations
  const totalOrders = ordersData.length;
  const pendingOrders = ordersData.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;
  const completedOrders = ordersData.filter(o => o.orderStatus === 'completed').length;
  const totalRevenue = ordersData
    .filter(o => o.orderStatus === 'completed')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn hàng</h1>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý và theo dõi tất cả đơn hàng
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Tổng đơn hàng</CardTitle>
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="h-3.5 w-3.5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Tổng số đơn
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Chờ xử lý</CardTitle>
              <div className="h-7 w-7 rounded-full bg-yellow-100 flex items-center justify-center">
                <Package className="h-3.5 w-3.5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Đơn cần xử lý
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Hoàn thành</CardTitle>
              <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold">{completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                Đơn thành công
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium">Doanh thu</CardTitle>
              <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-3.5 w-3.5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xl font-bold">
                {(totalRevenue / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">
                Tổng doanh thu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Bộ lọc</CardTitle>
            <CardDescription>Lọc đơn hàng theo trạng thái</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilterStatus(status.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === status.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                >
                  {status.label}
                  {status.value !== 'all' && (
                    <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs">
                      {ordersData.filter(o => o.orderStatus === status.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đơn hàng</CardTitle>
            <CardDescription>
              {filteredOrders.length} đơn hàng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={filteredOrders}
              searchKey="code"
              searchPlaceholder="Tìm theo mã đơn..."
              meta={{
                onView: handleView,
                onUpdateStatus: (order: Order) => {
                  handleUpdateStatus.mutate(order._id);
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              Mã đơn: {selectedOrder?.code || 'N/A'}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="mb-3 font-semibold">Thông tin khách hàng</h3>
                <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tên:</span>
                    <span className="font-medium">
                      {typeof selectedOrder.user === 'object'
                        ? selectedOrder.user.username
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">
                      {typeof selectedOrder.user === 'object'
                        ? selectedOrder.user.email
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="mb-3 font-semibold">Địa chỉ giao hàng</h3>
                <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Người nhận:</span>
                    <span className="font-medium">{selectedOrder.shippingAddress.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SĐT:</span>
                    <span className="font-medium">{selectedOrder.shippingAddress.phone}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-sm">Địa chỉ:</span>
                    <span className="font-medium">
                      {selectedOrder.shippingAddress.addressLine},{' '}
                      {selectedOrder.shippingAddress.district},{' '}
                      {selectedOrder.shippingAddress.province}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="mb-3 font-semibold">Sản phẩm</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      {item.image && (
                        <div className="relative h-16 w-16 overflow-hidden rounded-md">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {(item.totalPrice || 0).toLocaleString('vi-VN')}đ x{' '}
                          {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {((item.totalPrice || 0) * item.quantity).toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div>
                <h3 className="mb-3 font-semibold">Tổng kết</h3>
                <div className="space-y-2 bg-muted/30 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{selectedOrder.itemsTotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Phí ship:</span>
                    <span>{selectedOrder.shippingFee.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Thuế:</span>
                    <span>{selectedOrder.tax.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá:</span>
                      <span>-{selectedOrder.discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">
                      {selectedOrder.grandTotal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="mb-3 font-semibold">Thanh toán</h3>
                  <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-sm">Phương thức:</span>
                      <Badge variant="outline">
                        {selectedOrder.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold">Trạng thái đơn</h3>
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <Badge className={`w-full justify-center ${getStatusInfo(selectedOrder.orderStatus).className}`}>
                      {getStatusInfo(selectedOrder.orderStatus).label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Note */}
              {selectedOrder.orderNote && (
                <div>
                  <h3 className="mb-3 font-semibold">Ghi chú</h3>
                  <div className="bg-muted/50 rounded-lg border p-4 italic text-sm">
                    {selectedOrder.orderNote}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}