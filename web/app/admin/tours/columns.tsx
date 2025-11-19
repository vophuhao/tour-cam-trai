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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

export type TourTableMeta = {
  onEdit: (tour: Tour) => void;
  onDelete: (tour: Tour) => void;
};

export const columns: ColumnDef<Tour, TourTableMeta>[] = [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tên Tour" />
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    id: 'priceAdult',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá người lớn" />
    ),
    cell: ({ row }) => {
      const priceOptions = row.original.priceOptions;
      const adultPrice = priceOptions?.find(
        p =>
          p.name.toLowerCase().includes('người lớn') ||
          p.name.toLowerCase().includes('nguoi lon'),
      );
      return adultPrice ? (
        <span className="font-medium">
          {adultPrice.price.toLocaleString('vi-VN')}đ
        </span>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    id: 'priceChild',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Giá trẻ em" />
    ),
    cell: ({ row }) => {
      const priceOptions = row.original.priceOptions;
      const childPrice = priceOptions?.find(
        p =>
          p.name.toLowerCase().includes('trẻ em') ||
          p.name.toLowerCase().includes('tre em'),
      );
      return childPrice ? (
        <span className="font-medium">
          {childPrice.price.toLocaleString('vi-VN')}đ
        </span>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: 'durationDays',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Thời gian" />
    ),
    cell: ({ row }) => {
      const days = row.getValue('durationDays') as number;
      const nights = row.original.durationNights;
      return (
        <div className="text-sm">
          {days}N{nights}Đ
        </div>
      );
    },
  },
  {
    accessorKey: 'soldCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đã bán" />
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue('soldCount') || 0}</div>
    ),
  },
  {
    accessorKey: 'rating',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Đánh giá" />
    ),
    cell: ({ row }) => {
      const rating = row.getValue('rating') as Tour['rating'];
      return rating?.average ? (
        <div className="text-sm">
          ⭐ {rating.average.toFixed(1)} ({rating.count})
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Chưa có</span>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trạng thái" />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive');
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Hoạt động' : 'Tạm ngưng'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const tour = row.original;
      const meta = table.options.meta as TourTableMeta;

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
            <DropdownMenuItem onClick={() => meta?.onEdit(tour)}>
              <Pencil className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => meta?.onDelete(tour)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
