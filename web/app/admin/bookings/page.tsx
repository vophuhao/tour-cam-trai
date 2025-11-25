/* eslint-disable @typescript-eslint/no-explicit-any */
// ...existing code...
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
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React, { useState, useMemo, useCallback } from 'react';
import { columns } from './columns';
import { getAllBookings } from '@/lib/api';
import { Button } from '@/components/ui/button';
import BookingTourModal from '@/components/modals/booking-tour-modal';
import TourBookingDetailModal from '@/components/update-tour-modal';
import type { ColumnDef } from '@tanstack/table-core';

export default function BookingsPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [openModalDetail, setOpenModalDetail] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await getAllBookings();
      return response.data || [];
    },
  });

  // handlers memoized so DataTable/meta receive stable references
  const handleView = useCallback((order: Order) => {
    setSelectedOrder(order);
    setOpenModalDetail(true);
  }, []);

  const handleUpdateStatus = useCallback((order: Order) => {
    // TODO: Implement status update modal
    console.log('Update status for order:', order._id);
  }, []);

  const memoColumns = useMemo(() => columns, []);
  const meta = useMemo(
    () => ({
      onView: handleView,
      onUpdateStatus: handleUpdateStatus,
    }),
    [handleView, handleUpdateStatus]
  );

  // show inline loading state but keep component mounted (avoids changing hooks order)
  // (If you prefer earlier exit, ensure no hooks are declared below that return)
  // Here we still render table so child components/hocks are stable.
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản lý Booking</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý và theo dõi tất cả tour đã được đặt
        </p>
      </div>

      <Button variant="secondary" size="sm" onClick={() => setOpenModal(true)}>
        Tạo Booking Mới
      </Button>

      {isLoading && (
        <div className="flex h-[80px] items-center">
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      )}
      <DataTable
        columns={memoColumns as unknown as ColumnDef<unknown, unknown>[]}
        data={orders}
        searchKey="code"
        searchPlaceholder="Tìm theo mã đơn..."
        meta={meta}
      />
      

      {openModal && (
        <BookingTourModal open={openModal} onOpenChange={setOpenModal} />
      )}

      {/* Mount detail modal only when needed */}
      {openModalDetail && (
        <TourBookingDetailModal
          open={openModalDetail}
          onOpenChange={(v) => {
            if (!v) setSelectedOrder(null);
            setOpenModalDetail(v);
          }}
          tour={selectedOrder as any}
        />
      )}
    </div>
  );
}
