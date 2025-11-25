'use client';

import { DataTable } from '@/components/admin/data-table';
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
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useState } from 'react';
import { columns } from './columns';

export default function BookingsPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await getAllOrders();
      return response.data || [];
    },
  });

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    // TODO: Implement status update modal
    console.log('Update status for order:', order._id);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="text-muted-foreground">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý đơn hàng</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và theo dõi tất cả đơn hàng
        </p>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchKey="Code"
        searchPlaceholder="Tìm theo mã đơn..."
        meta={{
          onView: handleView,
          onUpdateStatus: handleUpdateStatus,
        }}
      />

      {/* Order Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription>
              Mã đơn: {selectedOrder?.Code || 'N/A'}
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
                        ? selectedOrder.user.name
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
                    <span className="font-medium">
                      {selectedOrder.shippingAddress.fullName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SĐT:</span>
                    <span className="font-medium">
                      {selectedOrder.shippingAddress.phone}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground">Địa chỉ:</span>
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
                          {(item.price || 0).toLocaleString('vi-VN')}đ x{' '}
                          {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {((item.price || 0) * item.quantity).toLocaleString(
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Trạng thái:</span>
                      <Badge>
                        {selectedOrder.paymentStatus === 'pending'
                          ? 'Chờ thanh toán'
                          : selectedOrder.paymentStatus === 'paid'
                            ? 'Đã thanh toán'
                            : 'Thất bại'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold">Trạng thái đơn</h3>
                  <div className="bg-muted/50 rounded-lg border p-4">
                    <Badge variant="default" className="w-full justify-center">
                      {selectedOrder.orderStatus === 'pending'
                        ? 'Chờ xử lý'
                        : selectedOrder.orderStatus === 'processing'
                          ? 'Đang xử lý'
                          : selectedOrder.orderStatus === 'confirmed'
                            ? 'Đã xác nhận'
                            : selectedOrder.orderStatus === 'shipping'
                              ? 'Đang giao'
                              : selectedOrder.orderStatus === 'completed'
                                ? 'Hoàn thành'
                                : 'Đã hủy'}
                    </Badge>
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
