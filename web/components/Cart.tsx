"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { Trash } from "lucide-react";


const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

type Props = {
  items?: CartItem[]; // optional server-provided snapshot (CartPage passes this)
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

  // prefer propsItems for display if provided (keeps UI consistent with server snapshot)
  const items = propsItems ?? storeItems;

  // optional: if parent passes items, keep store in sync (hydration)
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
    product.deal ?? product.price;

  const total = items.reduce((s, it) => s + it.quantity * getFinalPrice(it.product), 0);
  const selectedItems = items.filter((it) => selectedIds.includes(it.product._id));
  const selectedTotal = selectedItems.reduce(
    (s, it) => s + it.quantity * getFinalPrice(it.product),
    0
  );
  const selectedQuantity = selectedItems.reduce((s, it) => s + it.quantity, 0);


  const handleCheckout = () => {
    router.push("/cart/payment");
  };

  // use prop handler if provided (so parent can sync backend), otherwise update local store
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


  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-3xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <input
            ref={selectAllRef}
            type="checkbox"
            checked={selectedIds.length === items.length && items.length > 0}
            onChange={toggleSelectAll}
            className="w-5 h-5"
            aria-label="Chọn tất cả"
          />
          <h2 className="text-2xl font-bold">Giỏ hàng của bạn</h2>
        </div>

        <div className="text-right">
          <div className="text-sm text-gray-500">{items.length} sản phẩm</div>
          <div className="text-sm text-gray-500">{selectedQuantity} đã chọn</div>
        </div>
      </div>

      <ul className="space-y-4">
        {items.map((it) => (
          <li
            key={it.product._id}
            className="flex gap-4 items-center p-4 rounded-2xl border border-gray-100 hover:shadow-md transition"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(it.product._id)}
              onChange={() => toggleSelect(it.product._id)}
              className="w-5 h-5 flex-shrink-0"
              aria-label={`Chọn ${it.product.name}`}
            />

            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 flex items-center justify-center">
              {it.product.images?.[0] ? (
                <Image src={it.product.images[0]} alt={it.product.name} width={80} height={80} className="object-cover" />
              ) : (
                <div className="text-xs text-gray-400">No image</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="truncate">
                  <h3 className="font-semibold text-gray-800 truncate">{it.product.name}</h3>
                </div>

                <div className="text-right">
                  {it.product.deal ? (
                    <>
                      <div className="text-red-500 line-through text-xs ">
                        Giá gốc :{formatCurrency(it.product.price)}
                      </div>
                      <div className="text-green-600 font-semibold">
                        Chỉ còn :{formatCurrency(it.product.deal)}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-700 font-medium">
                      Giá gốc :{formatCurrency(it.product.price)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="inline-flex items-center rounded-lg border bg-white">
                  <button
                    aria-label={`Giảm ${it.product.name}`}
                    onClick={() => handleQty(it.product._id, it.quantity - 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50 transition"
                  >
                    −
                  </button>
                  <div className="px-4 py-1 font-medium">{it.quantity}</div>
                  <button
                    aria-label={`Tăng ${it.product.name}`}
                    onClick={() => handleQty(it.product._id, it.quantity + 1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-50 transition"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center gap-4 ">
                  <button
                    aria-label={`Xóa ${it.product.name}`}
                    onClick={() => handleRemove(it.product._id)}
                    className="p-2 rounded-md hover:bg-red-50 text-red-500  transition"
                  >                 
                    <Trash className="w-5 h-5 cursor-pointer" />                 
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 bg-gray-50 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">
            Tổng đã chọn ({selectedQuantity} sản phẩm)
          </div>        
          <div className="text-sm text-green-600 mt-1">
            Tổng giỏ  {formatCurrency(selectedTotal)}
           
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={selectedQuantity === 0}
          className={`w-full md:w-auto flex items-center justify-center gap-3 px-6 py-3 rounded-xl shadow-lg transition ${selectedQuantity === 0
            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            }`}
          aria-label="Thanh toán các sản phẩm đã chọn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-90">
            <path d="M3 7h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 11h10v6H7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Thanh toán ({selectedQuantity})
        </button>
      </div>
    </div>
  );
}