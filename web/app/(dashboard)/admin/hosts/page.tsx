/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Mail,
  Phone,
  Calendar,
  ChevronRight,
  UserCheck,
  Ban,
  Shield,
  MapPin,
  Building2,
  DollarSign,
  Star,
  TrendingUp,
  Activity,
  MapPinned,
} from "lucide-react";
import { getAllApprovedHosts, getAllHostRequests, updateHostRequestStatus, blockedUser } from "@/lib/client-actions";

interface HostRequest {
  _id: string;
  name: string;
  gmail: string;
  phone?: string;
  status: "pending" | "confirmed" | "rejected";
  user?: {
    _id: string;
    username: string;
    avatarUrl?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ConfirmedHost {
  _id: string;
  email: string;
  username: string;
  full_name?: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  locationCount?: number;
  totalBookings?: number;
  totalRevenue?: number;
  rating?: number;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
  verifiedAt?: string;
  role?: string;
  isBlocked?: boolean;
}

export default function AdminHostsPage() {
  const [activeTab, setActiveTab] = useState<"hosts" | "requests">("requests");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(10);

  const [requestDetailDialog, setRequestDetailDialog] = useState<{
    open: boolean;
    request: HostRequest | null;
  }>({ open: false, request: null });

  const [hostDetailDialog, setHostDetailDialog] = useState<{
    open: boolean;
    host: ConfirmedHost | null;
  }>({ open: false, host: null });

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    request: HostRequest | null;
  }>({ open: false, request: null });

  const [noteDialog, setNoteDialog] = useState<{
    open: boolean;
    request: HostRequest | null;
  }>({ open: false, request: null });
  const [rejectionNote, setRejectionNote] = useState("");

  const [blockDialog, setBlockDialog] = useState<{
    open: boolean;
    host: ConfirmedHost | null;
  }>({ open: false, host: null });

  const queryClient = useQueryClient();

  const { data: hostRequests = [], isLoading: isLoadingRequests } = useQuery<HostRequest[]>({
    queryKey: ["admin-host-requests"],
    queryFn: async () => {
      const response = await getAllHostRequests();
      return (response.data || []) as HostRequest[];
    },
  });

  const { data: confirmedHosts = [], isLoading: isLoadingHosts } = useQuery<ConfirmedHost[]>({
    queryKey: ["admin-confirmed-hosts"],
    queryFn: async () => {
      const response = await getAllApprovedHosts();
      return (response.data || []) as ConfirmedHost[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const response = await updateHostRequestStatus(requestId, "approved");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Đã duyệt yêu cầu thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-host-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-confirmed-hosts"] });
      setConfirmDialog({ open: false, request: null });
      setRequestDetailDialog({ open: false, request: null });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi duyệt yêu cầu");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      requestId,
      note,
    }: {
      requestId: string;
      note?: string;
    }) => {
      const response = await updateHostRequestStatus(requestId, "rejected");
      if (!response.success) throw new Error("Failed to reject");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Đã từ chối yêu cầu");
      queryClient.invalidateQueries({ queryKey: ["admin-host-requests"] });
      setNoteDialog({ open: false, request: null });
      setRequestDetailDialog({ open: false, request: null });
      setRejectionNote("");
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi từ chối yêu cầu");
    },
  });

  const blockMutation = useMutation({
    mutationFn: async (hostId: string) => {
      const response = await blockedUser(hostId);
      if (!response.success) throw new Error("Failed to block/unblock");
      return response.data;
    },
    onSuccess: (_, hostId) => {
      const host = confirmedHosts.find(h => h._id === hostId);
      const isBlocked = host?.isBlocked;
      toast.success(isBlocked ? "Đã mở khóa Host thành công" : "Đã khóa Host thành công");
      queryClient.invalidateQueries({ queryKey: ["admin-confirmed-hosts"] });
      setBlockDialog({ open: false, host: null });
      setHostDetailDialog({ open: false, host: null });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi thực hiện thao tác");
    },
  });

  const pendingRequests = useMemo(() => {
    return hostRequests.filter((r: HostRequest) => r.status === "pending");
  }, [hostRequests]);

  const rejectedRequests = useMemo(() => {
    return hostRequests.filter((r: HostRequest) => r.status === "rejected");
  }, [hostRequests]);

  const getFilteredRequests = (data: HostRequest[]) => {
    let filtered = [...data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.gmail?.toLowerCase().includes(term) ||
          item.phone?.toLowerCase().includes(term) ||
          item.user?.username?.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name-az":
          return a.name.localeCompare(b.name);
        case "name-za":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getFilteredHosts = (data: ConfirmedHost[]) => {
    let filtered = [...data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.username?.toLowerCase().includes(term) ||
          item.email?.toLowerCase().includes(term)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "name-az":
          return a.username.localeCompare(b.username);
        case "name-za":
          return b.username.localeCompare(a.username);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredHosts = getFilteredHosts(confirmedHosts);
  const filteredRequests = getFilteredRequests([...pendingRequests, ...rejectedRequests]);

  const currentData = activeTab === "hosts" ? filteredHosts : filteredRequests;
  const displayedData = currentData.slice(0, displayCount);
  const hasMore = displayCount < currentData.length;

  const stats = useMemo(() => {
    return {
      totalHosts: confirmedHosts.length,
      totalRequests: hostRequests.length,
      pending: pendingRequests.length,
      rejected: rejectedRequests.length,
    };
  }, [confirmedHosts, hostRequests, pendingRequests, rejectedRequests]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Chờ duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Đã từ chối
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleOpenRequestDetail = (request: HostRequest) => {
    setRequestDetailDialog({ open: true, request });
  };

  const handleOpenHostDetail = (host: ConfirmedHost) => {
    setHostDetailDialog({ open: true, host });
  };

  const handleApprove = (request: HostRequest) => {
    setConfirmDialog({ open: true, request });
  };

  const handleReject = (request: HostRequest) => {
    setNoteDialog({ open: true, request });
  };

  const handleConfirmApproval = async () => {
    if (!confirmDialog.request) return;
    await approveMutation.mutateAsync(confirmDialog.request._id);
  };

  const handleSubmitRejection = async () => {
    if (!noteDialog.request) return;
    await rejectMutation.mutateAsync({
      requestId: noteDialog.request._id,
      note: rejectionNote,
    });
  };

  const handleBlockHost = (host: ConfirmedHost) => {
    setBlockDialog({ open: true, host });
  };

  const handleConfirmBlock = async () => {
    if (!blockDialog.host) return;
    await blockMutation.mutateAsync(blockDialog.host._id);
  };

  const isLoading = isLoadingRequests || isLoadingHosts;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Host</h1>
            <p className="mt-1 text-sm text-gray-500">
              Quản lý danh sách Host và xử lý yêu cầu đăng ký
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Host đang hoạt động</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng yêu cầu</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Đã từ chối</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList>
              <TabsTrigger value="requests" className="relative">
                Yêu cầu đăng ký
                {stats.pending > 0 && (
                  <Badge className="ml-2 bg-yellow-500 text-white">{stats.pending}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="hosts">
                Danh sách Host
                <span className="ml-2 text-xs text-gray-500">({stats.totalHosts})</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="name-az">Tên A-Z</SelectItem>
                <SelectItem value="name-za">Tên Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {currentData.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              {activeTab === "hosts" ? (
                <>
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Chưa có Host nào</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm
                      ? "Không tìm thấy Host phù hợp"
                      : "Danh sách Host đã được duyệt sẽ hiển thị ở đây"}
                  </p>
                </>
              ) : (
                <>
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Chưa có yêu cầu nào</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm
                      ? "Không tìm thấy yêu cầu phù hợp"
                      : "Các yêu cầu trở thành Host sẽ hiển thị ở đây"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {displayedData.map((item: any) => {
                if (activeTab === "hosts") {
                  const host = item as ConfirmedHost;
                  return (
                    <Card
                      key={host._id}
                      className="cursor-pointer transition-all hover:shadow-md hover:border-emerald-200"
                      onClick={() => handleOpenHostDetail(host)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarImage src={host.avatarUrl} />
                              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                                {host.username?.charAt(0).toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {host.username}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                                >
                                  <Shield className="w-3 h-3 mr-1" />
                                  Host
                                </Badge>
                                {host.isBlocked ? (
                                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                    <Ban className="w-3 h-3 mr-1" />
                                    Đã khóa
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Hoạt động
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1 truncate">
                                  <Mail className="h-3 w-3 flex-shrink-0" />
                                  {host.email}
                                </span>
                              </div>
                            </div>
                          </div>

                  

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="flex items-center gap-2 text-sm text-emerald-600">
                              <MapPin className="h-4 w-4" />
                              <span className="hidden sm:inline font-medium">Xem địa điểm</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }

                const request = item as HostRequest;
                return (
                  <Card
                    key={request._id}
                    className="cursor-pointer transition-all hover:shadow-md hover:border-emerald-200"
                    onClick={() => handleOpenRequestDetail(request)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={request.user?.avatarUrl} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                              {request.name?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {request.name}
                              </h3>
                              {request.user && (
                                <Badge variant="outline" className="text-xs">
                                  Có tài khoản
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                {request.gmail}
                              </span>
                              {request.phone && (
                                <>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="hidden sm:flex items-center gap-1 flex-shrink-0">
                                    <Phone className="h-3 w-3" />
                                    {request.phone}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(request.createdAt)}</span>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {getStatusBadge(request.status)}

                          {request.status === "pending" && (
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleApprove(request)}
                              >
                                <UserCheck className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Duyệt</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleReject(request)}
                              >
                                <Ban className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Từ chối</span>
                              </Button>
                            </div>
                          )}

                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {hasMore && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setDisplayCount((prev) => prev + 10)}
                  className="w-full sm:w-auto"
                >
                  Xem thêm ({currentData.length - displayCount}{" "}
                  {activeTab === "hosts" ? "host" : "yêu cầu"})
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog
        open={hostDetailDialog.open}
        onOpenChange={(open) => setHostDetailDialog({ ...hostDetailDialog, open })}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Thông tin chi tiết Host</DialogTitle>
            <DialogDescription>Xem đầy đủ thông tin về Host và hoạt động kinh doanh</DialogDescription>
          </DialogHeader>

          {hostDetailDialog.host && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-100">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src={hostDetailDialog.host.avatarUrl} />
                  <AvatarFallback className="bg-emerald-600 text-white text-2xl font-bold">
                    {hostDetailDialog.host.username?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-2xl text-gray-900">{hostDetailDialog.host.username}</h3>
                      {hostDetailDialog.host.full_name && (
                        <p className="text-gray-600 mt-1">{hostDetailDialog.host.full_name}</p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge
                          variant="outline"
                          className="bg-emerald-600 text-white border-emerald-700"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Host chính thức
                        </Badge>
                        {hostDetailDialog.host.isBlocked ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <Ban className="w-3 h-3 mr-1" />
                            Đã khóa
                          </Badge>
                        ) : hostDetailDialog.host.isActive && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Activity className="w-3 h-3 mr-1" />
                            Đang hoạt động
                          </Badge>
                        )}
                      </div>
                    </div>
                    {hostDetailDialog.host.rating && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star className="h-6 w-6 fill-yellow-600" />
                          <span className="text-2xl font-bold">{hostDetailDialog.host.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Đánh giá trung bình</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-4 text-center">
                    <Building2 className="h-10 w-10 mx-auto text-blue-600 mb-2" />
                    <p className="text-3xl font-bold text-blue-900">
                      {hostDetailDialog.host.locationCount ?? 0}
                    </p>
                    <p className="text-sm text-blue-700 font-medium">Địa điểm</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                  <CardContent className="p-4 text-center">
                    <Users className="h-10 w-10 mx-auto text-emerald-600 mb-2" />
                    <p className="text-3xl font-bold text-emerald-900">
                      {hostDetailDialog.host.totalBookings || 0}
                    </p>
                    <p className="text-sm text-emerald-700 font-medium">Đơn đặt chỗ</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-10 w-10 mx-auto text-purple-600 mb-2" />
                    <p className="text-3xl font-bold text-purple-900">
                      {hostDetailDialog.host.totalRevenue 
                        ? `${(hostDetailDialog.host.totalRevenue / 1000000).toFixed(1)}M`
                        : '0'}
                    </p>
                    <p className="text-sm text-purple-700 font-medium">Doanh thu</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-10 w-10 mx-auto text-orange-600 mb-2" />
                    <p className="text-3xl font-bold text-orange-900">
                      {hostDetailDialog.host.totalBookings && hostDetailDialog.host.locationCount
                        ? ((hostDetailDialog.host.totalBookings / hostDetailDialog.host.locationCount) || 0).toFixed(1)
                        : '0'}
                    </p>
                    <p className="text-sm text-orange-700 font-medium">TB/Địa điểm</p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-emerald-600" />
                    Thông tin liên hệ
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{hostDetailDialog.host.email}</span>
                      </div>
                    </div>

                    {hostDetailDialog.host.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Số điện thoại</label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{hostDetailDialog.host.phone}</span>
                        </div>
                      </div>
                    )}

                    {hostDetailDialog.host.address && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Địa chỉ</label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                          <MapPinned className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900">{hostDetailDialog.host.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Thông tin tài khoản
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Ngày tham gia
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(hostDetailDialog.host.createdAt)}
                        </span>
                      </div>
                    </div>

                    {hostDetailDialog.host.verifiedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Ngày xác minh
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-gray-900">
                            {formatDate(hostDetailDialog.host.verifiedAt)}
                          </span>
                        </div>
                      </div>
                    )}

                    {hostDetailDialog.host.updatedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Cập nhật lần cuối
                        </label>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {formatDate(hostDetailDialog.host.updatedAt)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Vai trò
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 uppercase">
                          {hostDetailDialog.host.role || 'HOST'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Summary */}
              {(hostDetailDialog.host.locationCount || 0) > 0 && (
                <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                      Tóm tắt hiệu suất
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Tỷ lệ đặt chỗ thành công</span>
                        <span className="font-semibold text-emerald-600">
                          {hostDetailDialog.host.totalBookings && hostDetailDialog.host.locationCount
                            ? `${((hostDetailDialog.host.totalBookings / (hostDetailDialog.host.locationCount * 10)) * 100).toFixed(1)}%`
                            : '0%'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Doanh thu trung bình/Địa điểm</span>
                        <span className="font-semibold text-purple-600">
                          {hostDetailDialog.host.totalRevenue && hostDetailDialog.host.locationCount
                            ? `${((hostDetailDialog.host.totalRevenue / hostDetailDialog.host.locationCount) / 1000).toFixed(0)}K`
                            : '0K'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="text-sm text-gray-600">Trạng thái hoạt động</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {hostDetailDialog.host.isActive ? 'Hoạt động tốt' : 'Chưa rõ'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setHostDetailDialog({ open: false, host: null })}
            >
              Đóng
            </Button>
            {hostDetailDialog.host && (
              <Button
                variant="outline"
                className={hostDetailDialog.host.isBlocked ? "bg-green-50 hover:bg-green-100 text-green-700 border-green-200" : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"}
                onClick={() => handleBlockHost(hostDetailDialog.host!)}
              >
                <Ban className="w-4 h-4 mr-2" />
                {hostDetailDialog.host.isBlocked ? "Mở khóa Host" : "Khóa Host"}
              </Button>
            )}
            <Button variant="outline" className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200">
              <Mail className="w-4 h-4 mr-2" />
              Gửi tin nhắn
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <MapPin className="w-4 h-4 mr-2" />
              Xem địa điểm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={requestDetailDialog.open}
        onOpenChange={(open) => setRequestDetailDialog({ ...requestDetailDialog, open })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết yêu cầu</DialogTitle>
            <DialogDescription>Thông tin chi tiết về yêu cầu trở thành Host</DialogDescription>
          </DialogHeader>

          {requestDetailDialog.request && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={requestDetailDialog.request.user?.avatarUrl} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl font-bold">
                    {requestDetailDialog.request.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{requestDetailDialog.request.name}</h3>
                  {requestDetailDialog.request.user && (
                    <p className="text-sm text-gray-600">
                      @{requestDetailDialog.request.user.username}
                    </p>
                  )}
                  <div className="mt-2">{getStatusBadge(requestDetailDialog.request.status)}</div>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{requestDetailDialog.request.gmail}</span>
                  </div>
                </div>

                {requestDetailDialog.request.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Số điện thoại
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{requestDetailDialog.request.phone}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Ngày gửi</label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {formatDate(requestDetailDialog.request.createdAt)}
                      </span>
                    </div>
                  </div>

                  {requestDetailDialog.request.updatedAt !==
                    requestDetailDialog.request.createdAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Cập nhật
                      </label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(requestDetailDialog.request.updatedAt)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {requestDetailDialog.request.user && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Thông tin tài khoản</h4>
                  <p className="text-sm text-blue-800">
                    Người này đã có tài khoản trên hệ thống với username{" "}
                    <strong>@{requestDetailDialog.request.user.username}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRequestDetailDialog({ open: false, request: null })}
            >
              Đóng
            </Button>
            {requestDetailDialog.request &&
              requestDetailDialog.request.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleReject(requestDetailDialog.request!)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleApprove(requestDetailDialog.request!)}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Duyệt yêu cầu
                  </Button>
                </>
              )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận duyệt yêu cầu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn duyệt yêu cầu của{" "}
              <strong>{confirmDialog.request?.name}</strong>? Họ sẽ được quyền tạo và quản lý các
              địa điểm cắm trại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmApproval}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Duyệt
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={noteDialog.open}
        onOpenChange={(open) => {
          setNoteDialog({ ...noteDialog, open });
          if (!open) setRejectionNote("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lý do từ chối</DialogTitle>
            <DialogDescription>
              Nhập lý do từ chối yêu cầu của {noteDialog.request?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Lý do từ chối (không bắt buộc)
              </label>
              <Textarea
                value={rejectionNote}
                onChange={(e) => setRejectionNote(e.target.value)}
                placeholder="Nhập lý do từ chối để gửi cho người đăng ký..."
                className="min-h-[120px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNoteDialog({ open: false, request: null });
                setRejectionNote("");
              }}
            >
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSubmitRejection}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Đang xử lý..." : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={blockDialog.open}
        onOpenChange={(open) => setBlockDialog({ ...blockDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {blockDialog.host?.isBlocked ? 'Xác nhận mở khóa Host' : 'Xác nhận khóa Host'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn {blockDialog.host?.isBlocked ? 'mở khóa' : 'khóa'} Host{" "}
              <strong>{blockDialog.host?.username}</strong>?
              {!blockDialog.host?.isBlocked && " Host sẽ không thể quản lý các địa điểm của mình khi bị khóa."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBlock}
              className={blockDialog.host?.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {blockDialog.host?.isBlocked ? 'Mở khóa' : 'Khóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}