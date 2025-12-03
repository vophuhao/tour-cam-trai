/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Package,
  ShoppingCart,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats } from "@/lib/client-actions";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboardPage() {
  // Fetch all dashboard data
  const { data: overviewStats, isLoading: loadingOverview } = useQuery({
    queryKey: ["admin-dashboard-overview"],
    queryFn: async () => {
      const response = await getDashboardStats("overview");
      return response.data;
    },
  });

  const { data: revenueStats, isLoading: loadingRevenue } = useQuery({
    queryKey: ["admin-dashboard-revenue"],
    queryFn: async () => {
      const response = await getDashboardStats("revenue");
      return response.data;
    },
  });

  const { data: bookingStats, isLoading: loadingBookings } = useQuery({
    queryKey: ["admin-dashboard-bookings"],
    queryFn: async () => {
      const response = await getDashboardStats("bookings");
      return response.data;
    },
  });

  const { data: topLocations, isLoading: loadingLocations } = useQuery({
    queryKey: ["admin-dashboard-top-locations"],
    queryFn: async () => {
      const response = await getDashboardStats("top-locations");
      return response.data;
    },
  });

  const { data: topHosts, isLoading: loadingHosts } = useQuery({
    queryKey: ["admin-dashboard-top-hosts"],
    queryFn: async () => {
      const response = await getDashboardStats("top-hosts");
      return response.data;
    },
  });

  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ["admin-dashboard-activities"],
    queryFn: async () => {
      const response = await getDashboardStats("activities");
      return response.data;
    },
  });

  const { data: growthStats, isLoading: loadingGrowth } = useQuery({
    queryKey: ["admin-dashboard-growth"],
    queryFn: async () => {
      const response = await getDashboardStats("growth");
      return response.data;
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const getGrowthBadge = (growth: number) => {
    if (growth > 0) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{growth.toFixed(1)}%
        </Badge>
      );
    } else if (growth < 0) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <TrendingDown className="w-3 h-3 mr-1" />
          {growth.toFixed(1)}%
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700">
        0%
      </Badge>
    );
  };

  const isLoading =
    loadingOverview ||
    loadingRevenue ||
    loadingBookings ||
    loadingLocations ||
    loadingHosts ||
    loadingActivities ||
    loadingGrowth;

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Tổng quan về hoạt động hệ thống
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Cập nhật lúc</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleString("vi-VN")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tổng người dùng
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(overviewStats?.users?.total || 0)}
                  </p>
                  {growthStats?.users && (
                    <div className="mt-2">
                      {getGrowthBadge(growthStats.users.growth)}
                    </div>
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Hosts</p>
                  <p className="font-semibold">{overviewStats?.users?.hosts || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Guests</p>
                  <p className="font-semibold">{overviewStats?.users?.guests || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tổng doanh thu
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(overviewStats?.revenue?.total || 0)}
                  </p>
                  {growthStats?.revenue && (
                    <div className="mt-2">
                      {getGrowthBadge(growthStats.revenue.growth)}
                    </div>
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Tổng booking
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(overviewStats?.bookings?.total || 0)}
                  </p>
                  {growthStats?.bookings && (
                    <div className="mt-2">
                      {getGrowthBadge(growthStats.bookings.growth)}
                    </div>
                  )}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4 text-sm">
                <p className="text-gray-500">Đang hoạt động</p>
                <p className="font-semibold">
                  {overviewStats?.bookings?.active || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Địa điểm
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(overviewStats?.locations?.total || 0)}
                  </p>
                  <div className="mt-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                      <MapPin className="w-3 h-3 mr-1" />
                      Đã duyệt
                    </Badge>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                  <MapPin className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        {overviewStats?.pendingRequests?.hosts > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-900">
                    Có {overviewStats.pendingRequests.hosts} yêu cầu trở thành Host
                    đang chờ duyệt
                  </p>
                  <p className="text-sm text-yellow-700">
                    Vui lòng xem xét và xử lý các yêu cầu này
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
            <TabsTrigger value="bookings">Booking</TabsTrigger>
            <TabsTrigger value="locations">Top địa điểm</TabsTrigger>
            <TabsTrigger value="hosts">Top hosts</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      name="Doanh thu"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố booking theo trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={bookingStats?.byStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: { _id: any; count: any; }) => `${entry._id}: ${entry.count}`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(bookingStats?.byStatus || []).map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 địa điểm có nhiều booking nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLocations?.map((location: any, index: number) => (
                    <div
                      key={location._id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {location.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {location.address}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span className="font-semibold text-gray-900">
                            {location.bookingCount}
                          </span>
                          bookings
                        </div>
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(location.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hosts">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 hosts có doanh thu cao nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topHosts?.map((host: any, index: number) => (
                    <div
                      key={host._id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold">
                        #{index + 1}
                      </div>
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={host.avatarUrl} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {host.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {host.username}
                        </h4>
                        <p className="text-sm text-gray-500">{host.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex gap-3 text-sm text-gray-500 mb-1">
                          <span>
                            <MapPin className="inline h-3 w-3" />{" "}
                            {host.locationCount}
                          </span>
                          <span>
                            <Calendar className="inline h-3 w-3" />{" "}
                            {host.bookingCount}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(host.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities?.slice(0, 10).map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {activity.type === "booking" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                      <Calendar className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  {activity.type === "review" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                  )}
                  {activity.type === "user" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                  )}

                  <div className="flex-1">
                    {activity.type === "booking" && (
                      <p className="text-sm">
                        <strong>{activity.data.user?.username}</strong> đã đặt{" "}
                        <strong>{activity.data.location?.name}</strong>
                      </p>
                    )}
                    {activity.type === "review" && (
                      <p className="text-sm">
                        <strong>{activity.data.user?.username}</strong> đã đánh
                        giá <strong>{activity.data.location?.name}</strong>
                      </p>
                    )}
                    {activity.type === "user" && (
                      <p className="text-sm">
                        Người dùng mới <strong>{activity.data.username}</strong>{" "}
                        đã đăng ký
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}