/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useMutation, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useState } from 'react';
import { getStatusInfo } from './helper';
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
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Search, 
  Eye, 
  Clock,
  MapPin,
  Phone,
  User,
  CreditCard,
  CheckCircle2,
  XCircle,
  Truck
} from 'lucide-react';
import { getAllOrders } from '@/lib/client-actions';


export default function OrdersPage() {
  const router = useRouter();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | Order['orderStatus']>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: ordersData = [], isLoading } = useQuery<Order[], Error, Order[]>({
    queryKey: ['orders'],
    queryFn: async (): Promise<Order[]> => {
      const response = await getAllOrders();
      return (response?.data as Order[]) ?? [];
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

  const statuses: { value: 'all' | Order['orderStatus']; label: string; icon: any }[] = [
    { value: 'all', label: 'Tất cả', icon: ShoppingCart },
    { value: 'pending', label: 'Chờ thanh toán', icon: Clock },
    { value: 'processing', label: 'Chờ xác nhận', icon: Package },
    { value: 'confirmed', label: 'Đã xác nhận', icon: CheckCircle2 },
    { value: 'shipping', label: 'Đang giao', icon: Truck },
    { value: 'delivered', label: 'Đã giao', icon: CheckCircle2 },
    { value: 'completed', label: 'Hoàn thành', icon: TrendingUp },
    { value: 'cancelled', label: 'Đã hủy', icon: XCircle },
    { value: 'cancel_request', label: 'Yêu cầu hủy', icon: XCircle },
  ];

  const filteredOrders = ordersData.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.orderStatus === filterStatus;
    const matchesSearch = !searchQuery || 
      o.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (typeof o.user === 'object' && o.user.username?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý đơn hàng
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý và theo dõi tất cả đơn hàng
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tổng đơn hàng</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">{totalOrders}</div>
              <p className="text-xs text-gray-500 mt-1">
                Tổng số đơn
              </p>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Chờ xử lý</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                <Package className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">{pendingOrders}</div>
              <p className="text-xs text-gray-500 mt-1">
                Đơn cần xử lý
              </p>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Hoàn thành</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">{completedOrders}</div>
              <p className="text-xs text-gray-500 mt-1">
                Đơn thành công
              </p>
            </CardContent>
          </Card>

          <Card className="border hover:shadow-sm transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Doanh thu</CardTitle>
              <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {(totalRevenue / 1000000).toFixed(1)}M
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Tổng doanh thu
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-lg">Tìm kiếm & Lọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => {
                const Icon = status.icon;
                const count = status.value === 'all' 
                  ? ordersData.length 
                  : ordersData.filter(o => o.orderStatus === status.value).length;
                
                return (
                  <button
                    key={status.value}
                    onClick={() => setFilterStatus(status.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      filterStatus === status.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {status.label}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      filterStatus === status.value
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <Card className="border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600">Không tìm thấy đơn hàng</p>
              <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold">{filteredOrders.length}</span> đơn hàng
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOrders.map((order) => {
                const user = order.user as { username: string; email: string };
                const statusInfo = getStatusInfo(order.orderStatus);
                const items = Array.isArray(order.items) ? order.items : [];
                const totalItems = items.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0);

                return (
                  <Card 
                    key={order._id} 
                    className="border hover:shadow-md transition-shadow bg-white"
                  >
                    
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold text-gray-900 mb-1">
                            {order.code || 'N/A'}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </CardDescription>
                        </div>
                        <Badge className={`${statusInfo.className} text-xs`}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Customer Info */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{user?.username || 'N/A'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-gray-600">
                          <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-500" />
                          <span className="line-clamp-2">
                            {order.shippingAddress.addressLine}, {order.shippingAddress.district}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Phone className="h-3.5 w-3.5 text-gray-500" />
                          <span>{order.shippingAddress.phone}</span>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1.5">
                            <Package className="h-4 w-4" />
                            Sản phẩm:
                          </span>
                          <span className="font-semibold text-gray-900">{totalItems} SP</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1.5">
                            <CreditCard className="h-4 w-4" />
                            Thanh toán:
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {order.paymentMethod === 'cod' ? 'COD' : 'Chuyển khoản'}
                          </Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm font-medium text-gray-600">Tổng tiền:</span>
                          <span className="text-lg font-bold text-blue-600">
                            {order.grandTotal.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          onClick={() => handleView(order)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Chi tiết
                        </Button>
                        {(order.orderStatus !== 'completed' && order.orderStatus !== 'cancelled') && (
                          <Button
                            onClick={() => handleUpdateStatus.mutate(order._id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-gray-50"
                          >
                            Cập nhật
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
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