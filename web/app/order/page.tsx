/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from "react";
import { getOrdersByUser } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "processing", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Vận chuyển" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await getOrdersByUser();
        
        setOrders(res.data || []);
      } catch (err) {
        console.error("Error fetching orders", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const handleViewDetail = (orderId: string) => () => {
    window.location.href = `/order/detail?id=${orderId}`;
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      // Lọc theo tab
      if (activeTab !== "all") {
        switch (activeTab) {
          case "processing":
            if (o.orderStatus !== "processing") return false;
            break;
          case "confirmed":
            if (o.orderStatus !== "confirmed") return false;
            break;
          case "shipping":
            if (o.orderStatus !== "shipping") return false;
            break;
          case "completed":
            if (o.orderStatus !== "completed") return false;
            break;
          case "cancelled":
            if (o.orderStatus !== "cancelled") return false;
            break;
          default:
            break;
        }
      }

      // Lọc theo search
      if (!q) return true;
      if (o.code?.toLowerCase().includes(q)) return true;
      if (o.items.some((it) => it.name.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [orders, activeTab, search]);


  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (orders.length === 0) return <p className="text-center mt-10">Bạn chưa có đơn hàng nào.</p>;
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-6 w-full">
            {TABS.map((t) => (
              <TabsTrigger key={t.key} value={t.key}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Input
          placeholder="Tìm kiếm đơn hàng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-64"
        />
      </div>
     <ScrollArea className="h-[75vh]">
  <div className="flex flex-col space-y-4 p-2">
    {filtered.length === 0 ? (
      <div className="text-center text-gray-500 py-10">
        Không có đơn hàng khả dụng.
      </div>
    ) : (
      filtered.map((order) => (
        <Card key={order._id} className="border">
          <CardHeader className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <CardTitle className="text-sm font-medium">
              Mã đơn: <span className="text-gray-700">{order.code}</span>
            </CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Trạng thái đơn hàng:</span>
              <Badge
                variant={
                  order.orderStatus === "completed"
                    ? "secondary"
                    : order.orderStatus === "cancelled"
                    ? "destructive"
                    : "default"
                }
                className="uppercase"
              >
                {(() => {
                  switch (order.orderStatus) {
                    case "processing": return "Chờ xác nhận";
                    case "confirmed": return "Đã xác nhận";
                    case "shipping": return "Đang giao";
                    case "completed": return "Hoàn thành";
                    case "cancelled": return "Đã hủy";
                    default: return order.orderStatus.toUpperCase();
                  }
                })()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center space-x-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">x{item.quantity}</div>
                </div>
                <div className="font-semibold text-green-600">
                  {(item.totalPrice * item.quantity).toLocaleString("vi-VN")}₫
                </div>
              </div>
            ))}
          </CardContent>

          <CardFooter className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm text-gray-600">Thành tiền:</span>
              <span className="text-green-600 font-semibold text-sm">
                {order.grandTotal.toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              <div className="text-sm text-black/150">
                Ngày đặt hàng: {new Date(order.createdAt).toLocaleDateString("vi-VN")}
              </div>
              <Button size="sm" variant="outline" className="bg-green-400" onClick={handleViewDetail(order._id)}>Chi tiết</Button>
              <Button size="sm" variant="outline" className="bg-green-400">Mua Lại</Button>
            </div>
          </CardFooter>
        </Card>
      ))
    )}
  </div>
</ScrollArea>

    </div>
  );
}
