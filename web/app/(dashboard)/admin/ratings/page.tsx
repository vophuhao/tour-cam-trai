/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Star,
  MessageSquare,
  Check,
  TrendingUp,
  Search,
  ShieldCheck,
  Send,
  Package,
  Calendar,
  ChevronRight,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { adminReplyToRating, getAllRatings } from "@/lib/client-actions";

export default function AdminRatingsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [displayCount, setDisplayCount] = useState(10);

  // Detail dialog
  const [detailDialog, setDetailDialog] = useState<{
    open: boolean;
    rating: any | null;
  }>({ open: false, rating: null });

  // Response dialog
  const [responseDialog, setResponseDialog] = useState<{
    open: boolean;
    rating: any | null;
  }>({ open: false, rating: null });

  const queryClient = useQueryClient();

  // Fetch ratings
  const { data: ratings = [], isLoading } = useQuery<any[], Error>({
    queryKey: ["admin-ratings"],
    queryFn: async (): Promise<any[]> => {
      const response = await getAllRatings();
      if (!response.success) throw new Error("Failed to fetch ratings");
      return (response.data || []) as any[];
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: async ({
      ratingId,
      message,
    }: {
      ratingId: string;
      message: string;
    }) => {
      const response = await adminReplyToRating(ratingId, message);
      if (!response.success) throw new Error("Failed to reply");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Phản hồi thành công!");
      queryClient.invalidateQueries({ queryKey: ["admin-ratings"] });
      setResponseDialog({ open: false, rating: null });
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi phản hồi");
    },
  });

  // Filter ratings
  const filteredRatings = useMemo(() => {
    let filtered = [...ratings];

    // Tab filter
    if (activeTab === "pending") {
      filtered = filtered.filter((r: any) => !r.adminReply);
    } else if (activeTab === "replied") {
      filtered = filtered.filter((r: any) => r.adminReply);
    } else if (activeTab === "high-rated") {
      filtered = filtered.filter((r: any) => r.rating >= 4);
    } else if (activeTab === "low-rated") {
      filtered = filtered.filter((r: any) => r.rating < 4);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r: any) =>
          r.user?.username?.toLowerCase().includes(term) ||
          r.product?.name?.toLowerCase().includes(term) ||
          r.review?.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [ratings, activeTab, sortBy, searchTerm]);

  // Display ratings
  const displayedRatings = filteredRatings.slice(0, displayCount);
  const hasMore = displayCount < filteredRatings.length;

  // Stats
  const stats = useMemo(() => {
    const total = ratings.length;
    const pending = ratings.filter((r: any) => !r.adminReply).length;
    const replied = ratings.filter((r: any) => r.adminReply).length;
    const avgRating =
      total > 0
        ? (ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / total).toFixed(1)
        : 0;

    return { total, pending, replied, avgRating };
  }, [ratings]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStarColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-500";
    if (rating >= 3.5) return "text-yellow-500";
    return "text-red-500";
  };

  const handleOpenDetail = (rating: any) => {
    setDetailDialog({ open: true, rating });
  };

  const handleOpenResponse = (rating: any) => {
    setResponseDialog({ open: true, rating });
    setDetailDialog({ open: false, rating: null });
  };

  const handleSubmitResponse = async (message: string) => {
    if (!responseDialog.rating) return;
    await replyMutation.mutateAsync({
      ratingId: responseDialog.rating._id,
      message,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý đánh giá
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Xem và phản hồi các đánh giá từ khách hàng
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng số</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                  <MessageSquare className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Chờ phản hồi
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Đã phản hồi
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.replied}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Đánh giá TB
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.avgRating}{" "}
                    <Star className="inline h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 sm:w-auto">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="pending">Chờ phản hồi</TabsTrigger>
              <TabsTrigger value="replied">Đã phản hồi</TabsTrigger>
              <TabsTrigger value="high-rated">≥ 4 sao</TabsTrigger>
              <TabsTrigger value="low-rated">&lt; 4 sao</TabsTrigger>
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
                <SelectItem value="rating-high">Đánh giá cao</SelectItem>
                <SelectItem value="rating-low">Đánh giá thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {filteredRatings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                Chưa có đánh giá nào
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Không tìm thấy kết quả phù hợp"
                  : "Các đánh giá sẽ hiển thị ở đây"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {displayedRatings.map((rating: any) => (
                <Card
                  key={rating._id}
                  className="cursor-pointer transition-all hover:shadow-md hover:border-emerald-200"
                  onClick={() => handleOpenDetail(rating)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left: User & Product */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={rating.user?.avatarUrl} />
                          <AvatarFallback>
                            {rating.user?.username?.charAt(0).toUpperCase() ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {rating.user?.username}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                            <Package className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {rating.product?.name}
                            </span>
                            <span className="flex-shrink-0">•</span>
                            <Calendar className="h-3 w-3 flex-shrink-0" />
                            <span className="flex-shrink-0">
                              {formatDate(rating.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Review preview */}
                      <div className="hidden md:block flex-1 min-w-0">
                        <p className="text-sm text-gray-600 truncate">
                          {rating.review || "Không có nhận xét"}
                        </p>
                      </div>

                      {/* Right: Rating & Status */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Star
                            className={`h-5 w-5 fill-current ${getStarColor(
                              rating.rating || 0
                            )}`}
                          />
                          <span className="font-semibold text-gray-900">
                            {rating.rating?.toFixed(1) || "0.0"}
                          </span>
                        </div>

                        {rating.adminReply ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Đã phản hồi
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200"
                          >
                            <MessageSquare className="mr-1 h-3 w-3" />
                            Chờ phản hồi
                          </Badge>
                        )}

                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setDisplayCount((prev) => prev + 10)}
                  className="w-full sm:w-auto"
                >
                  Xem thêm ({filteredRatings.length - displayCount} đánh giá)
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialog.open}
        onOpenChange={(open) =>
          setDetailDialog({ ...detailDialog, open })
        }
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đánh giá</DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết và phản hồi đánh giá
            </DialogDescription>
          </DialogHeader>

          {detailDialog.rating && (
            <div className="space-y-4">
              {/* Product Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded overflow-hidden bg-white flex-shrink-0">
                  {detailDialog.rating.product?.images ? (
                    <img
                      src={detailDialog.rating.product.images[0]}
                      alt={detailDialog.rating.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {detailDialog.rating.product?.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Đơn hàng: {detailDialog.rating.order?.code}
                  </p>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={detailDialog.rating.user?.avatarUrl} />
                  <AvatarFallback>
                    {detailDialog.rating.user?.username
                      ?.charAt(0)
                      .toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {detailDialog.rating.user?.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    {detailDialog.rating.user?.email}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= detailDialog.rating.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {formatDate(detailDialog.rating.createdAt)}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              {detailDialog.rating.review && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Nhận xét</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {detailDialog.rating.review}
                  </p>
                </div>
              )}

              {/* Images */}
              {detailDialog.rating.files &&
                detailDialog.rating.files.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Hình ảnh</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {detailDialog.rating.files.map(
                        (file: string, index: number) => (
                          <div
                            key={index}
                            className="aspect-square rounded border overflow-hidden"
                          >
                            <img
                              src={file}
                              alt={`Review ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Admin Reply */}
              {detailDialog.rating.adminReply && (
                <div className="p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r">
                  <div className="flex items-start gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-emerald-900 mb-1">
                        Phản hồi của bạn
                      </p>
                      <p className="text-sm text-gray-700">
                        {detailDialog.rating.adminReply.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(detailDialog.rating.adminReply.repliedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialog({ open: false, rating: null })}
            >
              Đóng
            </Button>
            {detailDialog.rating && (
              <Button
                onClick={() => handleOpenResponse(detailDialog.rating)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {detailDialog.rating.adminReply
                  ? "Sửa phản hồi"
                  : "Phản hồi"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <ResponseDialog
        open={responseDialog.open}
        rating={responseDialog.rating}
        onOpenChange={(open) =>
          setResponseDialog({ ...responseDialog, open })
        }
        onSubmit={handleSubmitResponse}
        isSubmitting={replyMutation.isPending}
      />
    </div>
  );
}

// Response Dialog Component
function ResponseDialog({
  open,
  rating,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  rating: any;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (rating?.adminReply) {
      setMessage(rating.adminReply.message);
    } else {
      setMessage("");
    }
  }, [rating]);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    await onSubmit(message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {rating?.adminReply ? "Sửa phản hồi" : "Phản hồi đánh giá"}
          </DialogTitle>
          <DialogDescription>
            Viết phản hồi của bạn cho đánh giá này
          </DialogDescription>
        </DialogHeader>

        {rating && (
          <div className="space-y-4">
            {/* User & Rating Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={rating.user?.avatarUrl} />
                  <AvatarFallback>
                    {rating.user?.username?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {rating.user?.username}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= rating.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {rating.review && (
                <p className="text-sm text-gray-700">{rating.review}</p>
              )}
            </div>

            {/* Response Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Phản hồi của bạn
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập phản hồi của bạn..."
                className="min-h-[120px]"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !message.trim()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}