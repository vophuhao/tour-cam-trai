/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  getPropertyById,
  deleteSite,
  getSitesByProperty,
} from "@/lib/client-actions";

export default function PropertySitesPage() {
  const params = useParams() as any;
  const router = useRouter();
  const propertyId = params?.id ?? params?.propertyId;

  const [property, setProperty] = useState<any | null>(null);
  const [sites, setSites] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) return;
    let mounted = true;

    setLoading(true);
    (async () => {
      try {
        const p = await getPropertyById(propertyId);
        if (mounted && p?.success) setProperty(p.data ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [propertyId]);

  const fetchSites = async () => {
    if (!propertyId) return;
    setLoading(true);
    try {
      const res = await getSitesByProperty(propertyId);

      if (res?.success) setSites(res.data.sites ?? []);
      else setSites([]);
    } catch (err) {
      console.error(err);
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  const handleDeleteSite = async () => {
    if (!siteToDelete || !propertyId) return;
    try {
      await deleteSite(propertyId, siteToDelete);
      toast.success("Xóa site thành công!");
      setDeleteDialogOpen(false);
      setSiteToDelete(null);
      await fetchSites();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Có lỗi xảy ra khi xóa site");
    }
  };

  const filteredSites = useMemo(() => {
    if (!sites) return [];
    return sites.filter((site) => {
      const matchesSearch =
        !searchQuery ||
        (site.name ?? "")
          .toString()
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || site.bookingSettings?.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sites, searchQuery, statusFilter]);

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

  if (loading && sites === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="bg-white ">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/host/properties"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại properties
              </Link>         
            </div>

            <div className="flex items-center gap-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => router.push(`/host/properties/${propertyId}/sites/new`)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm Site mới
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

        {filteredSites && filteredSites.length > 0 ? (
          <div className="space-y-6">
            {filteredSites.map((site: any) => {
              const statusKey = (site.bookingSettings?.status ?? "available") as keyof typeof statusConfig;
              const status = statusConfig[statusKey] || statusConfig.available;
              return (
                <Card key={site._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative w-full sm:w-56 h-44 sm:h-auto flex-shrink-0 bg-gray-100">
                      <Image
                        src={site.photos?.[0]?.url || "/placeholder.jpg"}
                        alt={site.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Badge className={status.color}>
                          <div className={`h-2 w-2 rounded-full ${status.dot} mr-1.5`} />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary">
                          {siteTypeLabels[site.accommodationType] ?? site.accommodationType ?? "Site"}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{site.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-3 max-w-2xl">{site.description}</p>
                          </div>
                          <div className="hidden sm:flex flex-col items-end text-right space-y-2">
                            <p className="text-sm text-gray-500">Giá/đêm</p>
                            <p className="text-lg font-semibold text-emerald-600">
                              {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(site.pricing?.basePrice || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3 text-center sm:text-left">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-gray-600">Khách</p>
                            <p className="text-sm font-semibold text-gray-900">{site.capacity?.maxGuests || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-gray-600">Xe</p>
                            <p className="text-sm font-semibold text-gray-900">{site.capacity?.maxVehicles || 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-gray-600">Số lều</p>
                            <p className="text-sm font-semibold text-gray-900">{site.capacity?.maxTents ?? "-"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/host/properties/${property?._id }/sites/${site._id}`}>
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
                              onClick={() => router.push(`/host/properties/${propertyId}/sites/${site._id}/edit`)}
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
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Eye className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== "all" ? "Không tìm thấy site nào" : "Chưa có site nào"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {searchQuery || statusFilter !== "all"
                  ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                  : "Bắt đầu bằng cách tạo site đầu tiên cho property này"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => router.push(`/host/properties/${propertyId}/sites/new`)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo Site mới
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa site</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc chắn muốn xóa site này? Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSite} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
