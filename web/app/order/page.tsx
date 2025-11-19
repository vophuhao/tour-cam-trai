/* eslint-disable @next/next/no-img-element */
// ...existing code...
"use client";

import { useEffect, useMemo, useState } from "react";
import { getOrdersByUser } from "@/lib/api";

type OrderItem = {
  product : Product;
  quantity: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  paymentStatus: string;
  orderStatus: string;
  grandTotal: number;
  createdAt: string;
};

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "shipping", label: "Vận chuyển" },
  { key: "delivering", label: "Chờ giao hàng" },
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (activeTab !== "all") {
        
        const status = (o.orderStatus || "").toLowerCase();
        if (activeTab === "pending" && !/pending|waiting|chờ xác nhận/.test(status)) return false;
        if (activeTab === "shipping" && !/shipping|shipped|đang giao|vận chuyển/.test(status)) return false;
        if (activeTab === "delivering" && !/delivering|in transit|chờ giao hàng/.test(status)) return false;
        if (activeTab === "completed" && !/completed|delivered|hoàn thành|giao thành công/.test(status)) return false;
        if (activeTab === "cancelled" && !/cancelled|canceled|đã hủy/.test(status)) return false;
      }
      if (!q) return true;
      // search by shopName, order id, product name
     
      if (o._id?.toLowerCase().includes(q)) return true;
      if (o.items.some((it) => it.product.name.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [orders, activeTab, search]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (orders.length === 0)
    return <p className="text-center mt-10">Bạn chưa có đơn hàng nào.</p>;

  console.log("Filtered orders:", filtered[0].items[0]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Tabs + Search */}
      <div className="bg-white p-4 rounded shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <nav className="flex space-x-4 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 text-sm rounded-tl rounded-tr ${
                  activeTab === t.key
                    ? "border-b-2 border-red-500 text-red-600 font-semibold"
                    : "text-gray-600 hover:text-red-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

         
        </div>
      </div>

      {/* Orders list */}
      <div className="space-y-6">
        {filtered.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 ">           

              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Giao hàng thành công</span>
                </div>
                <div className="text-red-600 font-semibold">{order.orderStatus.toUpperCase()}</div>
              </div>
            </div>

            {/* Items */}
            <div className="px-4 py-4 space-y-4">
              {order.items.map((item) => (
                <div key={item.product._id} className="flex items-center space-x-4">
                  {item.product ? (
                    <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500">No image</div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.product.name}</div>
                    
                    <div className="text-xs text-gray-500">x{item.quantity}</div>
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    {(item.product.price * item.quantity).toLocaleString("vi-VN")}₫
                  </div>
                </div>
              ))}
            </div>

            {/* Footer: total + actions */}
            <div className="px-4 py-3 bg-gray-50  flex flex-col md:flex-row items-start md:items-center justify-between space-y-3 md:space-y-0">
              <div className="text-sm">
                Thành tiền:{" "}
                <span className="text-red-600 font-semibold">{order.grandTotal.toLocaleString("vi-VN")}₫</span>
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-red-500 text-white rounded text-sm">Đánh Giá</button>
                <button className="px-4 py-2 border rounded text-sm">Liên Hệ Người Bán</button>
                <button className="px-4 py-2 border rounded text-sm">Mua Lại</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ...existing code...