'use client';

import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import { Eye, MoreHorizontal } from 'lucide-react';

export type BookingTableMeta = {
  onView: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
};

const paymentStatusMap = {
  pending: { label: 'Chờ thanh toán', variant: 'secondary' as const },
  paid: { label: 'Đã thanh toán', variant: 'default' as const },
  failed: { label: 'Thất bại', variant: 'destructive' as const },
};

const orderStatusMap = {
  pending: { label: 'Chờ xử lý', variant: 'secondary' as const },
  processing: { label: 'Đang xử lý', variant: 'default' as const },
  confirmed: { label: 'Đã xác nhận', variant: 'default' as const },
  shipping: { label: 'Đang giao', variant: 'default' as const },
  completed: { label: 'Hoàn thành', variant: 'default' as const },
  cancelled: { label: 'Đã hủy', variant: 'destructive' as const },
};

export const columns: ColumnDef<Order>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'Code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mã đơn" />
    ),
    cell: ({ row }) => (
      <div className="font-mono text-sm">{row.getValue('Code') || '-'}</div>
    ),
  },
  {
    id: 'customer',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Khách hàng" />
    ),
    cell: ({ row }) => {
      const user = row.original.user as { name: string; email: string };
      return (
        <div>
          <div className="font-medium">{user?.name || 'N/A'}</div>
          <div className="text-muted-foreground text-xs">{user?.email}</div>
        </div>
      );
    },
  },
  {
    id: 'items',
    header: 'Sản phẩm',
    cell: ({ row }) => {
      const items = row.original.items;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      return (
        <div className="text-sm">
          {items.length} SP ({totalItems} món)
        </div>
      );
    },
  },
  {
    accessorKey: 'grandTotal',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tổng tiền" />
    ),
    cell: ({ row }) => {
      const total = row.getValue('grandTotal') as number;
      return (
        <span className="font-semibold">{total.toLocaleString('vi-VN')}đ</span>
      );
    },
  },
  {
    accessorKey: 'paymentMethod',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thanh toán" />
    ),
    cell: ({ row }) => {
      const method = row.getValue('paymentMethod') as string;
      return (
        <div className="text-sm">
          {method === 'cod' ? 'COD' : 'Chuyển khoản'}
        </div>
      );
    },
  },
  {
    accessorKey: 'paymentStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TT Thanh toán" />
    ),
    cell: ({ row }) => {
      const status = row.getValue(
        'paymentStatus',
      ) as keyof typeof paymentStatusMap;
      const statusInfo = paymentStatusMap[status];
      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    },
  },
  {
    accessorKey: 'orderStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="TT Đơn hàng" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('orderStatus') as keyof typeof orderStatusMap;
      const statusInfo = orderStatusMap[status];
      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ngày đặt" />
    ),
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string;
      return <div className="text-sm">{formatDate(date)}</div>;
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const order = row.original;
      const meta = table.options.meta as BookingTableMeta;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order._id)}
            >
              Sao chép ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta?.onView(order)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta?.onUpdateStatus(order)}>
              Cập nhật trạng thái
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
