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
import { useEffect, useState } from 'react';
import { columns } from './columns';
import { getStatusInfo } from './helper';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import queryClient from '@/lib/query-client';
import { updateStatusOrder } from '@/lib/api';
import { toast } from 'react-toastify';

export default function BookingsPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // filter state
  const [filterStatus, setFilterStatus] = useState<'all' | Order['orderStatus']>('all');

  const { data: ordersData = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await getAllOrders();
      return response.data || [];
    },
  });

  const [orders, setOrders] = useState<Order[]>(ordersData);

  // Đồng bộ khi fetch xong
  useEffect(() => {
    setOrders(ordersData);
  }, [ordersData]);


  const handleView = (order: Order) => {
    console.log('Viewing order:', order);
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
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
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'processing', label: 'Đang xử lý' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'cancelled', label: 'Đã hủy' },
  ];

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter(o => o.orderStatus === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý và theo dõi tất cả đơn hàng
          </p>
        </div>

      </div>
      <div className="flex items-center gap-3">
        <Select
          value={filterStatus}
          onValueChange={(value) =>
            setFilterStatus(value as "all" | Order["orderStatus"])
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>

          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      <DataTable
        columns={columns}
        data={filteredOrders}
        searchKey="code"
        searchPlaceholder="Tìm theo mã đơn..."
        meta={{
          onView: handleView,
          onUpdateStatus: (order: Order) => {
            handleUpdateStatus.mutate(order._id, {
              onSuccess: () => {
                // cập nhật local state ngay
                setOrders(prev =>
                  prev.map(o =>
                    o._id === order._id ? { ...o, orderStatus: order.orderStatus } : o
                  )
                );
              },
              onError: () => toast.error("Cập nhật trạng thái thất bại"),
            });
          },
        }}

      />


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
                    <span className="text-muted-foreground">Tên:   {typeof selectedOrder.user === 'object'
                      ? selectedOrder.user.username
                      : 'N/A'} </span>

                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email: {typeof selectedOrder.user === 'object'
                      ? selectedOrder.user.email
                      : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="mb-3 font-semibold">Địa chỉ giao hàng</h3>
                <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Người nhận: {selectedOrder.shippingAddress.fullName}</span>

                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">SĐT: {selectedOrder.shippingAddress.phone}</span>

                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Địa chỉ:  {selectedOrder.shippingAddress.addressLine},{' '}
                      {selectedOrder.shippingAddress.district},{' '}
                      {selectedOrder.shippingAddress.province}</span>

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
                      className="flex items-center gap-4 rounded-lg border p-3"
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-md object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {(item.totalPrice || 0).toLocaleString('vi-VN')}đ x{' '}
                          {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {((item.totalPrice || 0) * item.quantity).toLocaleString(
                          'vi-VN',
                        )}
                        đ
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Summary */}
              <div>
                <h3 className="mb-3 font-semibold">Tổng kết</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>
                      {selectedOrder.itemsTotal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí ship:</span>
                    <span>
                      {selectedOrder.shippingFee.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thuế:</span>
                    <span>{selectedOrder.tax.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span>
                        -{selectedOrder.discount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span>
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
                      <span className="text-muted-foreground">
                        Phương thức:
                      </span>
                      <span className="font-medium">
                        {selectedOrder.paymentMethod === 'cod'
                          ? 'COD'
                          : 'Chuyển khoản'}
                      </span>
                    </div>
                    {/* <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <Badge>
                        {selectedOrder.paymentStatus === 'pending'
                          ? 'Chờ thanh toán'
                          : selectedOrder.paymentStatus === 'paid'
                            ? 'Đã thanh toán'
                            : 'Thất bại'}
                      </Badge>
                    </div> */}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold">Trạng thái đơn</h3>
                  <div className="bg-muted/50 rounded-lg border p-4">
                    {selectedOrder && (
                      <Badge className={`w-full justify-center ${getStatusInfo(selectedOrder.orderStatus).className}`}>
                        {getStatusInfo(selectedOrder.orderStatus).label}
                      </Badge>
                    )}

                  </div>
                </div>
              </div>

              {/* Order Note */}
              {selectedOrder.orderNote && (
                <div>
                  <h3 className="mb-3 font-semibold">Ghi chú</h3>
                  <div className="bg-muted/50 rounded-lg border p-4">
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
