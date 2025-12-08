/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { deleteProperty, getMyProperties } from '@/lib/client-actions';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Eye,
  Filter,
  Home,
  MapPin,
  Plus,
  Search,
  Settings,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function PropertiesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  const {
    data: properties,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['my-properties'],
    queryFn: async () => {
      const response = await getMyProperties();
      return response.data.properties;
    },
  });
  console.log('Properties:', properties);
  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      await deleteProperty(propertyToDelete);
      toast.success('Xóa property thành công!');
      refetch();
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Có lỗi xảy ra khi xóa property',
      );
    }
  };

  const filteredProperties = properties?.filter((property: any) => {
    const matchesSearch = property.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    active: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-800' },
    inactive: { label: 'Không hoạt động', color: 'bg-gray-100 text-gray-800' },
    pending_approval: {
      label: 'Chờ duyệt',
      color: 'bg-yellow-100 text-yellow-800',
    },
    suspended: { label: 'Tạm ngưng', color: 'bg-red-100 text-red-800' },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Khu cắm trại
              </h1>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => router.push('/host/properties/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm khu mới
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        {properties && properties.length > 0 && (
          <div className="mb-8 grid gap-6 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng Khu cắm trại
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {properties.length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <Home className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Đã xuất bản
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {
                        properties.filter((p: any) => p.status === 'published')
                          .length
                      }
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng Địa điểm cắm trại
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {properties.reduce(
                        (sum: number, p: any) =>
                          sum + (p.stats?.totalSites || 0),
                        0,
                      )}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng Bookings
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {properties.reduce(
                        (sum: number, p: any) =>
                          sum + (p.stats?.totalBookings || 0),
                        0,
                      )}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Calendar className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên property..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="active">Đang hoạt động</SelectItem>
                    <SelectItem value="inactive">Không hoạt động</SelectItem>
                    <SelectItem value="pending_approval">Chờ duyệt</SelectItem>
                    <SelectItem value="suspended">Tạm ngưng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties List */}
        {filteredProperties && filteredProperties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property: any) => (
              <Card
                key={property._id}
                className="overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="relative h-48">
                  <Image
                    src={property.photos?.[0]?.url || '/placeholder.jpg'}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={
                        statusConfig[
                          property?.status as keyof typeof statusConfig
                        ]?.color || 'bg-gray-100 text-gray-800'
                      }
                    >
                      {statusConfig[
                        property?.status as keyof typeof statusConfig
                      ]?.label || 'Unknown'}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {property.name}
                  </h3>

                  <div className="mb-4 flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {property.location.city}, {property.location.state}
                    </span>
                  </div>

                  <div className="mb-4 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-xs text-gray-600">Sites</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.stats?.totalSites || 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-xs text-gray-600">Bookings</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.stats?.totalBookings || 0}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-2">
                      <p className="text-xs text-gray-600">Rating</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.stats?.averageRating?.toFixed(1) || '0.0'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/host/properties/${property._id}/sites`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem sites
                      </Link>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/host/properties/${property._id}`)
                          }
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/host/properties/${property._id}/sites/new`,
                            )
                          }
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Thêm site
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setPropertyToDelete(property._id);
                            setDeleteDialogOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa property
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Home className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {searchQuery || statusFilter !== 'all'
                  ? 'Không tìm thấy property nào'
                  : 'Chưa có property nào'}
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                  : 'Bắt đầu bằng cách tạo property đầu tiên của bạn'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => router.push('/host/properties/new')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo Property mới
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa property</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa property này? Hành động này không thể
              hoàn tác. Property chỉ có thể xóa khi không còn site nào.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProperty}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
