"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingCart, 
  ArrowRight, 
  Package,
  MapPin,
  Calendar,
  Users,
  Tent
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

type Props = {
  items?: CartItem[];
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
};

export default function Cart({ items: propsItems, onUpdateQuantity, onRemoveItem }: Props) {
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const storeItems = useCartStore((s) => s.items) as CartItem[];
  const selectedIds = useCartStore((s) => s.selectedIds) as string[];
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const toggleSelect = useCartStore((s) => s.toggleSelect);
  const toggleSelectAll = useCartStore((s) => s.toggleSelectAll);
  const setItems = useCartStore((s) => s.setItems);

  const items = propsItems ?? storeItems;

  useEffect(() => {
    if (propsItems && propsItems.length) setItems(propsItems);
  }, [propsItems, setItems]);

  useEffect(() => {
    if (!selectAllRef.current) return;
    const total = items.length;
    const selected = selectedIds.length;
    selectAllRef.current.indeterminate = selected > 0 && selected < total;
  }, [selectedIds, items.length]);

  const getFinalPrice = (product: CartItem["product"]) =>
    product?.deal ?? product?.price;

  const total = items.reduce((s, it) => s + it.quantity * getFinalPrice(it.product), 0);
  const selectedItems = items.filter((it) => selectedIds.includes(it.product?._id));
  const selectedTotal = selectedItems.reduce(
    (s, it) => s + it.quantity * getFinalPrice(it.product),
    0
  );
  const selectedQuantity = selectedItems.reduce((s, it) => s + it.quantity, 0);
  const totalSavings = selectedItems.reduce(
    (s, it) => s + (it.product?.deal ? (it.product.price - it.product.deal) * it.quantity : 0),
    0
  );

  const handleCheckout = () => {
    router.push("/cart/payment");
  };

  const handleQty = (id: string, next: number) => {
    if (next < 1) return;
    if (onUpdateQuantity) {
      onUpdateQuantity(id, next);
    } else {
      updateQuantity(id, next);
    }
  };

  const handleRemove = (id: string) => {
    if (onRemoveItem) {
      onRemoveItem(id);
    } else {
      removeItem(id);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <Tent className="w-16 h-16 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Giỏ hàng trống
        </h3>
        <p className="text-gray-500 mb-6">
          Hãy thêm tour vào giỏ hàng để tiếp tục
        </p>
        <button
          onClick={() => router.push("/products")}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <span>Khám phá tour</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-emerald-600" />
          Giỏ hàng
        </h1>
        <p className="text-gray-600 mt-1">
          {items.length} tour • {selectedQuantity} đã chọn
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Side - Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Select All */}
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={selectedIds.length === items.length && items.length > 0}
                onChange={toggleSelectAll}
                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium text-gray-700">Chọn tất cả</span>
            </label>
          </div>

          {/* Cart Items */}
          <AnimatePresence mode="popLayout">
            {items.map((it) => {
              const isSelected = selectedIds.includes(it.product?._id);
              const hasDiscount = it.product?.deal && it.product.deal < it.product.price;

              return (
                <motion.div
                  key={it.product._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className={`bg-white rounded-lg shadow-sm p-5 border transition-all ${
                    isSelected ? "border-emerald-500" : "border-gray-200"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(it.product?._id)}
                      className="w-5 h-5 mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />

                    {/* Image */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {it.product?.images?.[0] ? (
                        <Image
                          src={it.product.images[0]}
                          alt={it.product.name}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tent className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {it.product?.name}
                      </h3>

                      {/* Tour Details */}
                      <div className="flex flex-wrap gap-2 mb-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>Đà Lạt</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>2N1Đ</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Max 15</span>
                        </div>
                      </div>

                      {/* Price & Controls */}
                      <div className="flex items-center justify-between">
                        <div>
                          {hasDiscount ? (
                            <div>
                              <div className="text-sm text-gray-400 line-through">
                                {formatCurrency(it.product.price)}
                              </div>
                              <div className="text-lg font-bold text-emerald-600">
                                {formatCurrency(it.product.deal)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(it.product.price)}
                            </div>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <div className="inline-flex items-center border rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQty(it.product?._id, it.quantity - 1)}
                              disabled={it.quantity <= 1}
                              className="px-3 py-1.5 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <div className="px-4 py-1.5 border-x min-w-[50px] text-center font-medium">
                              {it.quantity}
                            </div>
                            <button
                              onClick={() => handleQty(it.product?._id, it.quantity + 1)}
                              className="px-3 py-1.5 hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(it.product?._id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Right Side - Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-lg shadow-sm border p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-600" />
              Tóm tắt đơn hàng
            </h3>

            <div className="space-y-3 py-4 border-y">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span className="font-medium">
                  {formatCurrency(selectedTotal + totalSavings)}
                </span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Giảm giá</span>
                  <span className="font-medium">
                    -{formatCurrency(totalSavings)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
                <span>Tổng cộng</span>
                <span>{formatCurrency(selectedTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={selectedQuantity === 0}
              className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                selectedQuantity === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <span>Thanh toán ({selectedQuantity})</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Trust Info */}
            <div className="pt-4 border-t space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5"></div>
                <span>Hoàn tiền 100% nếu hủy trước 7 ngày</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5"></div>
                <span>Hướng dẫn viên chuyên nghiệp</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5"></div>
                <span>Thiết bị cắm trại cao cấp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}