/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  MapPin,
  Settings,
  Eye,
  Trash2,
  Home,
  TrendingUp,
  DollarSign,
  Calendar,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getMyProperties, deleteProperty } from "@/lib/client-actions";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function PropertiesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  const { data: properties, isLoading, refetch } = useQuery({
    queryKey: ["my-properties"],
    queryFn: async () => {
      const response = await getMyProperties();
      return response.data.properties;
    },
  });
  console.log("Properties:", properties);
  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    try {
      await deleteProperty(propertyToDelete);
      toast.success("Xóa property thành công!");
      refetch();
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa property");
    }
  };

  const filteredProperties = properties?.filter((property: any) => {
    const matchesSearch = property.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    draft: { label: "Bản nháp", color: "bg-gray-100 text-gray-800" },
    published: { label: "Đã xuất bản", color: "bg-green-100 text-green-800" },
    suspended: { label: "Tạm ngưng", color: "bg-red-100 text-red-800" },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý Properties
              </h1>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => router.push("/host/properties/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm Property mới
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        {properties && properties.length > 0 && (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng Properties
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
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
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        properties.filter((p: any) => p.status === "published")
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
                      Tổng Sites
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {properties.reduce(
                        (sum: number, p: any) => sum + (p.stats?.totalSites || 0),
                        0
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
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {properties.reduce(
                        (sum: number, p: any) =>
                          sum + (p.stats?.totalBookings || 0),
                        0
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên property..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="published">Đã xuất bản</SelectItem>
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
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={property.photos?.[0]?.url || "/placeholder.jpg"}
                    alt={property.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      className={
                        statusConfig[
                          property?.status as keyof typeof statusConfig
                        ]?.color || "bg-gray-100 text-gray-800"
                      }
                    >
                      {
                        statusConfig[
                          property?.status as keyof typeof statusConfig
                        ]?.label || "Unknown"
                      }
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {property.name}
                  </h3>

                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {property.location.city}, {property.location.state}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600">Sites</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.stats?.totalSites || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600">Bookings</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.stats?.totalBookings || 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600">Rating</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {property.stats?.averageRating?.toFixed(1) || "0.0"}
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
                              `/host/properties/${property._id}/sites/new`
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
              <Home className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "Không tìm thấy property nào"
                  : "Chưa có property nào"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                  : "Bắt đầu bằng cách tạo property đầu tiên của bạn"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => router.push("/host/properties/new")}
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