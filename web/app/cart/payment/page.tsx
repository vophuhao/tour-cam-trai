"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/store/cart.store";
import { useRouter } from "next/navigation";
import { useAddresses, useAddressActions } from "@/hooks/useAddress";
import AddressModal from "@/components/modals/AddressModal";
import { useCreateOrder } from "@/hooks/useOrder";
import AddressList from "@/components/AddressList";


const formatCurrency = (value: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export default function PaymentPage() {
    const router = useRouter();
    const items = useCartStore((s) => s.items);
    const selectedIds = useCartStore((s) => s.selectedIds);
    const removeItem = useCartStore((s) => s.removeItem);
    const clearSelected = useCartStore((s) => s.clearSelected);
    const createOrderMutation = useCreateOrder();

    // address hooks
    const { data: addressesRes } = useAddresses();
    const { addAddress, removeAddress } = useAddressActions();
    const addresses: Address[] = addressesRes?.data || [];

    // modal / address state
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(
        addresses.length ? 0 : null
    );
    const [showModal, setShowModal] = useState(false);
    const [addrError, setAddrError] = useState<string | null>(null);

    // shipping / payment / placing / extra UI state
    const [shipping, setShipping] = useState<"standard" | "express">("standard");
    const [payment, setPayment] = useState<"cod" | "card" | "momo">("cod");
    const [placing, setPlacing] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    // promo / invoice / notes
    const [promo, setPromo] = useState("");
    const [promoApplied, setPromoApplied] = useState<{ code: string; amount: number } | null>(null);  
    const [orderNote, setOrderNote] = useState("");

    const selectedItems = items.filter((it) => selectedIds.includes(it.product._id));
    const itemsTotal = selectedItems.reduce((s: number, it) => s + (it.product.deal ?? it.product.price) * it.quantity, 0);
    const shippingFee = shipping === "express" ? 45000 : 25000;
    const promoDiscount = promoApplied ? promoApplied.amount : 0;
    const tax = Math.round((itemsTotal - promoDiscount) * 0.05); // simple 5% VAT example
    const grandTotal = Math.max(0, itemsTotal - promoDiscount + shippingFee + tax);

    // UX: delivery ETA text
    const deliveryETA = shipping === "express" ? "1-2 ngày" : "2-4 ngày";

    // keep selectedAddressIndex in sync when addresses change
    useEffect(() => {
        // compute the target index without calling setState synchronously
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
            // defer the state update to avoid calling setState synchronously within the effect
            const t = setTimeout(() => setSelectedAddressIndex(targetIndex), 0);
            return () => clearTimeout(t);
        }
        // no-op cleanup if nothing scheduled
        return;
    }, [addresses, selectedAddressIndex]);

    const canPlace =
        selectedItems.length > 0 &&
        selectedAddressIndex !== null &&
        !placing;

    const handlePlaceOrder = async () => {
        if (!canPlace) return;
        setPlacing(true);

        try {
            const addr = addresses[selectedAddressIndex!];
            
            const payload = {
                // ✅ user backend nhận từ token, không cần truyền
                items: selectedItems.map((it) => ({
                    product: it.product._id,
                    name: it.product.name,
                    totalPrice: (it.product.deal ?? it.product.price),
                    quantity: it.quantity,
                    image: it.product.images?.[0] || ""
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
            
            if(res.data ==="OUT_OF_STOCK") {
                alert("Đặt hàng thất bại: Sản phẩm không còn đủ hàng.");
                setPlacing(false);
                // toast.error("Đặt hàng thất bại: Sản phẩm không còn đủ hàng.");
                return;
            }

            const order = res.data;
         
           // ✅ CASE 1: COD → thành công → thông báo → clear cart → chuyển /orders
            if (payment === "cod") {
                selectedItems.forEach((it) => removeItem(it.product._id));
                clearSelected();

                setSuccess("Đặt hàng thành công!");
                 setTimeout(() => router.push("/order"), 1000);
                return;
            }

            // ✅ CASE 2: PayOS → redirect sang checkoutUrl
            else {
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

    // onSave from modal: call addAddress then close modal
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
        // prevent removing currently selected address
        if (selectedAddressIndex !== null && index === selectedAddressIndex) {
            setAddrError("Không thể xóa địa chỉ đang được chọn. Vui lòng chọn địa chỉ khác trước khi xóa.");
            return;
        }

        const ok = confirm("Bạn có chắc muốn xóa địa chỉ này?");
        if (!ok) return;

        try {
            await removeAddress(index);
            // if removing an address before the selected index, shift selected index left
            if (selectedAddressIndex !== null && index < selectedAddressIndex) {
                setSelectedAddressIndex(selectedAddressIndex - 1);
            }
            // if there are no addresses left, clear selection
            if (addresses.length - 1 === 0) setSelectedAddressIndex(null);
        } catch (err) {
            console.error(err);
            setAddrError("Xóa địa chỉ thất bại. Vui lòng thử lại.");
        }
    };

    const applyPromo = () => {
        // simple demo: "SALE50" -> 50k off, "SAVE10" -> 10% off (capped)
        if (!promo) return;
        const code = promo.trim().toUpperCase();
        if (code === "SALE50") {
            setPromoApplied({ code, amount: 50000 });
        } else if (code === "SAVE10") {
            const amount = Math.round(itemsTotal * 0.1);
            setPromoApplied({ code, amount });
        } else {
            setPromoApplied(null);
            // in real app show error toast
        }
    };

    // compute human-readable estimated delivery only on the client to avoid SSR/client date/locale mismatch
    const estimatedDelivery = typeof window !== "undefined"
        ? (() => {
            const now = new Date();
            const days = shipping === "express" ? 2 : 4;
            const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
            // format using client's locale
            return `${deliveryETA} — khoảng ${now.toLocaleDateString()} đến ${end.toLocaleDateString()}`;
        })()
        : "";
    return (
        <div className="max-w-7xl mx-auto mt-12 p-6 bg-gradient-to-b from-white to-gray-50 rounded-3xl shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: Checkout form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Thông tin nhận hàng</h2>

                        <AddressList
                            addresses={addresses}
                            selectedAddressIndex={selectedAddressIndex}
                            setSelectedAddressIndex={setSelectedAddressIndex}
                            handleRemoveAddress={handleRemoveAddress}
                            setShowModal={setShowModal}
                            addrError={addrError}
                        />
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Phương thức vận chuyển</h2>
                        <div className="grid md:grid-cols-2 gap-3">
                            <label className={`p-4 border rounded-lg ${shipping === "standard" ? "border-blue-400 bg-blue-50" : "border-gray-100"}`}>
                                <input type="radio" name="ship" checked={shipping === "standard"} onChange={() => setShipping("standard")} className="mr-2" />
                                Giao tiêu chuẩn
                                <div className="text-sm text-gray-500 mt-1">{formatCurrency(25000)} — {deliveryETA}</div>
                            </label>
                            <label className={`p-4 border rounded-lg ${shipping === "express" ? "border-blue-400 bg-blue-50" : "border-gray-100"}`}>
                                <input type="radio" name="ship" checked={shipping === "express"} onChange={() => setShipping("express")} className="mr-2" />
                                Giao nhanh
                                <div className="text-sm text-gray-500 mt-1">{formatCurrency(45000)} — {deliveryETA}</div>
                            </label>
                        </div>
                        <div className="text-xs text-gray-500 mt-3">Ước tính giao hàng: {estimatedDelivery}</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
                        <div className="grid md:grid-cols-3 gap-3">
                            <label className={`p-3 border rounded-lg ${payment === "cod" ? "border-blue-400 bg-blue-50" : "border-gray-100"}`}>
                                <input type="radio" name="pay" checked={payment === "cod"} onChange={() => setPayment("cod")} className="mr-2" />
                                Thanh toán khi nhận (COD)
                            </label>
                            <label className={`p-3 border rounded-lg ${payment === "card" ? "border-blue-400 bg-blue-50" : "border-gray-100"}`}>
                                <input type="radio" name="pay" checked={payment === "card"} onChange={() => setPayment("card")} className="mr-2" />
                                Thẻ nội địa/quốc tế
                            </label>
                          
                        </div>

                        <div className="mt-4 grid md:grid-cols-2 gap-3">
                            <div>
                                <label className="text-sm text-gray-500">Mã khuyến mãi</label>
                                <div className="flex gap-2 mt-2">
                                    <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Nhập mã (ví dụ SALE50)" className="p-2 border rounded-lg flex-1" />
                                    <button onClick={applyPromo} className="px-4 py-2 rounded-lg bg-green-500 text-white">Áp dụng</button>
                                </div>
                                {promoApplied ? <div className="text-sm text-green-600 mt-2">Đã áp dụng: {promoApplied.code} — {formatCurrency(promoApplied.amount)}</div> : null}
                            </div>
                
                        </div>

                        <div className="mt-4">
                            <label className="text-sm text-gray-500">Ghi chú đơn hàng</label>
                            <textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Ghi chú cho người giao hàng..." className="w-full p-3 border rounded-lg mt-2" rows={3} />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Order summary */}
                <aside className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>

                    <div className="divide-y divide-gray-100 space-y-4 max-h-72 overflow-y-auto pb-4">
                        {selectedItems.length === 0 ? (
                            <div className="text-gray-500">Không có sản phẩm được chọn.</div>
                        ) : (
                            selectedItems.map((it) => (
                                <div key={it.product._id} className="flex items-center gap-3 py-3">
                                    <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {it.product.images?.[0] ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={it.product.images[0]} alt={it.product.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="text-xs text-gray-400 px-2 text-center">No image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{it.product.name}</div>
                                        <div className="text-xs text-gray-500">{it.quantity} × {formatCurrency(it.product.price)}</div>
                                    </div>
                                    <div className="text-sm font-semibold">{formatCurrency(it.product.price * it.quantity)}</div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                        <div className="flex justify-between"><span>Tạm tính</span><span>{formatCurrency(itemsTotal)}</span></div>
                        <div className="flex justify-between"><span>Giảm</span><span className="text-green-600"> {formatCurrency(promoDiscount)}</span></div>
                        <div className="flex justify-between"><span>Thuế (VAT 5%)</span><span>{formatCurrency(tax)}</span></div>
                        <div className="flex justify-between"><span>Phí vận chuyển</span><span>{formatCurrency(shippingFee)}</span></div>
                        <div className="flex justify-between font-bold text-lg mt-2"><span>Tổng thanh toán</span><span>{formatCurrency(grandTotal)}</span></div>
                    </div>

                    <button
                        onClick={handlePlaceOrder}
                        disabled={!canPlace}
                        className={`mt-5 w-full py-3 rounded-xl text-white font-semibold ${canPlace ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" : "bg-gray-300 cursor-not-allowed"}`}
                    >
                        {placing ? "Đang xử lý..." : `Thanh toán ${formatCurrency(grandTotal)}`}
                    </button>

                    <div className="text-xs text-gray-400 mt-3">
                        Bằng việc thanh toán bạn đồng ý với Điều khoản & Chính sách của chúng tôi.
                    </div>

                    {success && (
                        <div className="mt-3 p-3 bg-green-50 text-green-800 rounded-md text-sm">
                            {success}
                        </div>
                    )}
                </aside>
            </div>

            {showModal && (
                <AddressModal
                    initial={undefined}
                    onSave={handleSaveAddress}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}