"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  ArrowLeft,
  Settings,
  Eye,
  Trash2,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  getPropertyById,
  getPropertySites,
  deleteSite,
} from "@/lib/client-actions";
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

export default function PropertySitesPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);

  const { data: property } = useQuery({
    queryKey: ["property", propertyId],
    queryFn: async () => {
      const response = await getPropertyById(propertyId);
      return response.data;
    },
  });

  const {
    data: sites,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["property-sites", propertyId],
    queryFn: async () => {
      const response = await getPropertySites(propertyId);
      return response.data;
    },
  });

  const handleDeleteSite = async () => {
    if (!siteToDelete) return;

    try {
      await deleteSite(propertyId, siteToDelete);
      toast.success("Xóa site thành công!");
      refetch();
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa site"
      );
    }
  };

  const filteredSites = sites?.filter((site: any) => {
    const matchesSearch = site.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      site.bookingSettings?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    available: {
      label: "Sẵn sàng",
      color: "bg-green-100 text-green-800",
      dot: "bg-green-500",
    },
    unavailable: {
      label: "Không khả dụng",
      color: "bg-red-100 text-red-800",
      dot: "bg-red-500",
    },
    maintenance: {
      label: "Bảo trì",
      color: "bg-yellow-100 text-yellow-800",
      dot: "bg-yellow-500",
    },
  };

  const siteTypeLabels: any = {
    tent: "Tent Site",
    rv: "RV Site",
    cabin: "Cabin",
    glamping: "Glamping",
    group: "Group Site",
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/host/properties"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách properties
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sites - {property?.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý các vị trí cắm trại trong property này
              </p>
            </div>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() =>
                router.push(`/host/properties/${propertyId}/sites/new`)
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm Site mới
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        {sites && sites.length > 0 && (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Tổng Sites
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {sites.length}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <Eye className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Đang hoạt động
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {
                        sites.filter(
                          (s: any) => s.bookingSettings?.status === "available"
                        ).length
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
                      Sức chứa TB
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {Math.round(
                        sites.reduce(
                          (sum: number, s: any) =>
                            sum + (s.capacity?.maxGuests || 0),
                          0
                        ) / sites.length
                      )}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Giá TB/đêm
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        notation: "compact",
                      }).format(
                        sites.reduce(
                          (sum: number, s: any) =>
                            sum + (s.pricing?.basePrice || 0),
                          0
                        ) / sites.length
                      )}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <DollarSign className="h-6 w-6 text-purple-600" />
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
                    placeholder="Tìm kiếm theo tên site..."
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
                    <SelectItem value="available">Sẵn sàng</SelectItem>
                    <SelectItem value="unavailable">Không khả dụng</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sites List */}
        {filteredSites && filteredSites.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSites.map((site: any) => {
              const status =
                statusConfig[
                  site.bookingSettings?.status as keyof typeof statusConfig
                ] || statusConfig.available;

              return (
                <Card
                  key={site._id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={site.photos?.[0]?.url || "/placeholder.jpg"}
                      alt={site.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className={status.color}>
                        <div className={`h-2 w-2 rounded-full ${status.dot} mr-1.5`} />
                        {status.label}
                      </Badge>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary">
                        {siteTypeLabels[site.siteType]}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {site.name}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {site.description}
                    </p>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600">Khách</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {site.capacity?.maxGuests || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600">Xe</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {site.capacity?.maxVehicles || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600">Giá/đêm</p>
                        <p className="text-sm font-semibold text-emerald-600">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                            notation: "compact",
                          }).format(site.pricing?.basePrice || 0)}
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
                        <Link href={`/land/${property.slug}?site=${site.slug}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
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
                              router.push(
                                `/host/properties/${propertyId}/sites/${site._id}/edit`
                              )
                            }
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSiteToDelete(site._id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa site
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Eye className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all"
                  ? "Không tìm thấy site nào"
                  : "Chưa có site nào"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                  : "Bắt đầu bằng cách tạo site đầu tiên cho property này"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() =>
                    router.push(`/host/properties/${propertyId}/sites/new`)
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo Site mới
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
            <AlertDialogTitle>Xác nhận xóa site</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa site này? Hành động này không thể hoàn
              tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSite}
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