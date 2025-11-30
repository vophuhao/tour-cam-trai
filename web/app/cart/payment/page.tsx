"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { useRouter } from "next/navigation";
import { useAddresses, useAddressActions } from "@/hooks/useAddress";
import AddressModal from "@/components/modals/AddressModal";
import { useCreateOrder } from "@/hooks/useOrder";
import AddressList from "@/components/AddressList";
import { 
  MapPin, 
  Truck, 
  CreditCard, 
  Tag, 
  FileText,
  CheckCircle2,
  Tent,
  Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function PaymentPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const selectedIds = useCartStore((s) => s.selectedIds);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearSelected = useCartStore((s) => s.clearSelected);
  const createOrderMutation = useCreateOrder();

  const { data: addressesRes } = useAddresses();
  const { addAddress, removeAddress } = useAddressActions();
  const addresses: Address[] = addressesRes?.data || [];

  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(
    addresses.length ? 0 : null
  );
  const [showModal, setShowModal] = useState(false);
  const [addrError, setAddrError] = useState<string | null>(null);

  const [shipping, setShipping] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"cod" | "card" | "momo">("cod");
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; amount: number } | null>(null);
  const [orderNote, setOrderNote] = useState("");

  const selectedItems = items.filter((it) => selectedIds.includes(it.product._id));
  const itemsTotal = selectedItems.reduce(
    (s: number, it) => s + (it.product.deal ?? it.product.price) * it.quantity,
    0
  );
  const shippingFee = shipping === "express" ? 45000 : 25000;
  const promoDiscount = promoApplied ? promoApplied.amount : 0;
  const tax = Math.round((itemsTotal - promoDiscount) * 0.05);
  const grandTotal = Math.max(0, itemsTotal - promoDiscount + shippingFee + tax);

  const deliveryETA = shipping === "express" ? "1-2 ngày" : "2-4 ngày";

  useEffect(() => {
    let targetIndex: number | null = selectedAddressIndex;

    if (addresses.length && selectedAddressIndex === null) {
      targetIndex = 0;
    }
    if (!addresses.length) {
      targetIndex = null;
    }
    if (addresses.length && selectedAddressIndex !== null && selectedAddressIndex >= addresses.length) {
      targetIndex = addresses.length - 1;
    }

    if (targetIndex !== selectedAddressIndex) {
      const t = setTimeout(() => setSelectedAddressIndex(targetIndex), 0);
      return () => clearTimeout(t);
    }
    return;
  }, [addresses, selectedAddressIndex]);

  const canPlace = selectedItems.length > 0 && selectedAddressIndex !== null && !placing;

  const handlePlaceOrder = async () => {
    if (!canPlace) return;
    setPlacing(true);

    try {
      const addr = addresses[selectedAddressIndex!];

      const payload = {
        items: selectedItems.map((it) => ({
          product: it.product._id,
          name: it.product.name,
          totalPrice: it.product.deal ?? it.product.price,
          quantity: it.quantity,
          image: it.product.images?.[0] || "",
        })),
        shippingAddress: {
          fullName: addr.fullName,
          phone: addr.phone,
          addressLine: addr.addressLine,
          province: addr.city,
          district: addr.district,
        },
        paymentMethod: payment === "cod" ? "cod" : "card",
        shippingMethod: shipping,
        itemsTotal,
        discount: promoDiscount,
        tax,
        shippingFee,
        grandTotal,
        promoCode: promoApplied?.code || null,
        orderNote,
      };

      const res = await createOrderMutation.mutateAsync(payload);
      console.log("Order response:", res);

      if (res.message === "OUT_OF_STOCK") {
        toast.error("Đặt hàng thất bại: Sản phẩm không còn đủ hàng.");
        setPlacing(false);
        return;
      }
      const order = res.data;

      if (payment === "cod") {
        selectedItems.forEach((it) => removeItem(it.product._id));
        clearSelected();
        setSuccess("Đặt hàng thành công!");
        setTimeout(() => router.push("/order"), 1000);
        return;
      } else {
        if (!order.payOSCheckoutUrl) {
          alert("Lỗi: Không nhận được PayOS checkout URL");
          return;
        }
        window.location.assign(order.payOSCheckoutUrl);
      }
    } catch (err) {
      console.error(err);
    }

    setPlacing(false);
  };

  const handleSaveAddress = async (addr: {
    fullName: string;
    phone: string;
    addressLine: string;
    province: string;
    provinceCode?: number;
    district?: string;
    districtCode?: number;
  }) => {
    await addAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine: addr.addressLine.trim(),
      city: addr.province,
      district: addr.district,
    });
    setShowModal(false);
  };

  const handleRemoveAddress = async (index: number) => {
    setAddrError(null);
    if (selectedAddressIndex !== null && index === selectedAddressIndex) {
      setAddrError("Không thể xóa địa chỉ đang được chọn. Vui lòng chọn địa chỉ khác trước khi xóa.");
      return;
    }

    const ok = confirm("Bạn có chắc muốn xóa địa chỉ này?");
    if (!ok) return;

    try {
      await removeAddress(index);
      if (selectedAddressIndex !== null && index < selectedAddressIndex) {
        setSelectedAddressIndex(selectedAddressIndex - 1);
      }
      if (addresses.length - 1 === 0) setSelectedAddressIndex(null);
    } catch (err) {
      console.error(err);
      setAddrError("Xóa địa chỉ thất bại. Vui lòng thử lại.");
    }
  };

  const applyPromo = () => {
    if (!promo) return;
    const code = promo.trim().toUpperCase();
    if (code === "SALE50") {
      setPromoApplied({ code, amount: 50000 });
    } else if (code === "SAVE10") {
      const amount = Math.round(itemsTotal * 0.1);
      setPromoApplied({ code, amount });
    } else {
      setPromoApplied(null);
    }
  };

  const estimatedDelivery =
    typeof window !== "undefined"
      ? (() => {
          const now = new Date();
          const days = shipping === "express" ? 2 : 4;
          const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
          return `${deliveryETA} — khoảng ${now.toLocaleDateString()} đến ${end.toLocaleDateString()}`;
        })()
      : "";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Tent className="w-8 h-8 text-emerald-600" />
            Thanh toán đặt tour
          </h1>
          <p className="text-gray-600 mt-1">Hoàn tất thông tin để đặt tour của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Checkout form */}
          <div className="lg:col-span-2 space-y-5">
            {/* Địa chỉ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 border"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">Thông tin liên hệ</h2>
              </div>
              <AddressList
                addresses={addresses}
                selectedAddressIndex={selectedAddressIndex}
                setSelectedAddressIndex={setSelectedAddressIndex}
                handleRemoveAddress={handleRemoveAddress}
                setShowModal={setShowModal}
                addrError={addrError}
              />
            </motion.div>

            {/* Vận chuyển */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-sm p-6 border"
            >
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">Phương thức giao hàng</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <label
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    shipping === "standard"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="ship"
                    checked={shipping === "standard"}
                    onChange={() => setShipping("standard")}
                    className="mr-2 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium">Giao tiêu chuẩn</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(25000)} — {deliveryETA}
                  </div>
                </label>
                <label
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    shipping === "express"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="ship"
                    checked={shipping === "express"}
                    onChange={() => setShipping("express")}
                    className="mr-2 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium">Giao nhanh</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {formatCurrency(45000)} — {deliveryETA}
                  </div>
                </label>
              </div>
              <div className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Ước tính giao hàng: {estimatedDelivery}
              </div>
            </motion.div>

            {/* Thanh toán */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-6 border"
            >
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-gray-900">Phương thức thanh toán</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-4">
                <label
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    payment === "cod"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={payment === "cod"}
                    onChange={() => setPayment("cod")}
                    className="mr-2 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium">COD</span>
                  <div className="text-xs text-gray-500">Thanh toán khi nhận hàng</div>
                </label>
                <label
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    payment === "card"
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={payment === "card"}
                    onChange={() => setPayment("card")}
                    className="mr-2 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium">Thẻ</span>
                  <div className="text-xs text-gray-500">Thẻ nội địa/quốc tế</div>
                </label>
              </div>

              {/* Mã giảm giá */}
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                  <Tag className="w-4 h-4" />
                  Mã khuyến mãi
                </label>
                <div className="flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    placeholder="Nhập mã (VD: SALE50)"
                    className="p-2.5 border rounded-lg flex-1 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    onClick={applyPromo}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Áp dụng
                  </button>
                </div>
                {promoApplied && (
                  <div className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Đã áp dụng: {promoApplied.code} — {formatCurrency(promoApplied.amount)}
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-2">
                  <FileText className="w-4 h-4" />
                  Ghi chú đơn hàng
                </label>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Thông tin bổ sung (nếu có)..."
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                />
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Order summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 bg-white rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-gray-900">Đơn hàng</h3>
              </div>

              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto mb-4">
                {selectedItems.length === 0 ? (
                  <div className="text-gray-500 text-sm py-4">Không có sản phẩm được chọn.</div>
                ) : (
                  selectedItems.map((it) => (
                    <div key={it.product._id} className="flex items-center gap-3 py-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {it.product.images?.[0] ? (
                          <img
                            src={it.product.images[0]}
                            alt={it.product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tent className="w-8 h-8 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{it.product.name}</div>
                        <div className="text-xs text-gray-500">
                          {it.quantity} × {formatCurrency(it.product.price)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatCurrency(it.product.price * it.quantity)}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 text-sm pb-4 border-b">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(itemsTotal)}</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Thuế (VAT 5%)</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-lg py-4 border-b">
                <span>Tổng thanh toán</span>
                <span className="text-emerald-600">{formatCurrency(grandTotal)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!canPlace}
                className={`mt-4 w-full py-3 rounded-lg text-white font-semibold transition-all ${
                  canPlace
                    ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {placing ? "Đang xử lý..." : `Đặt hàng ${formatCurrency(grandTotal)}`}
              </button>

              <div className="text-xs text-gray-500 mt-3 text-center">
                Bằng việc đặt hàng bạn đồng ý với Điều khoản của chúng tôi.
              </div>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>

      {showModal && (
        <AddressModal initial={undefined} onSave={handleSaveAddress} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}