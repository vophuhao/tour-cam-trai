"use client";

import { useEffect, useState } from "react";
import { X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  deal: number;
  stock: number;
  images: string[];
  category: { name: string; _id: string };
  isActive: boolean;
}

interface ProductFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: Product;
  categories: Category[];
  onClose: () => void;
  onSubmit: (id: string | undefined, data: FormData) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  categories,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    deal: 0,
    stock: 0,
    newImages: [] as File[], // ảnh mới upload
    category: "",
    isActive: true,
  });

  const [oldImages, setOldImages] = useState<string[]>([]); // ảnh cũ từ DB
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // ảnh hiển thị
  const [currentIndex, setCurrentIndex] = useState(0);

  // load dữ liệu khi edit
  useEffect(() => {
    if (initialData && mode === "edit") {
      setForm({
        name: initialData.name,
        description: initialData.description || "",
        price: initialData.price,
        deal: initialData.deal,
        stock: initialData.stock,
        newImages: [],
        category: initialData.category?._id || "",
        isActive: initialData.isActive,
      });
      setOldImages(initialData.images || []);
      setPreviewUrls(initialData.images || []);
    } else {
      setForm({
        name: "",
        description: "",
        price: 0,
        deal: 0,
        stock: 0,
        newImages: [],
        category: "",
        isActive: true,
      });
      setOldImages([]);
      setPreviewUrls([]);
    }
    setCurrentIndex(0);
  }, [initialData, mode]);


  // chọn ảnh
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm((prev) => ({ ...prev, newImages: [...prev.newImages, ...files] }));
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
    setCurrentIndex(previewUrls.length + files.length - 1);
  };

  // xóa ảnh
  const removeImage = (url: string) => {
    setPreviewUrls((prev) => prev.filter((img) => img !== url));
    if (url.startsWith("http")) {
      setOldImages((prev) => prev.filter((img) => img !== url));
    } else {
      setForm((prev) => ({
        ...prev,
        newImages: prev.newImages.filter(
          (file) => URL.createObjectURL(file) !== url
        ),
      }));
    }
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const nextImage = () => {
    if (previewUrls.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % previewUrls.length);
    }
  };

  const prevImage = () => {
    if (previewUrls.length > 0) {
      setCurrentIndex(
        (prev) => (prev - 1 + previewUrls.length) % previewUrls.length
      );
    }
  };

  // submit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const id = initialData?._id;
    const formData = new FormData();

    // text fields
    formData.append("name", form.name);
    formData.append("description", form.description || "");
    formData.append("price", form.price.toString());
    formData.append("deal", form.deal.toString());
    formData.append("stock", form.stock.toString());
    formData.append("category", form.category);
    formData.append("isActive", form.isActive ? "true" : "false");

    // old images (khi edit mới có)
    oldImages.forEach((img) => formData.append("oldImages", img));

    // new images (file upload)
    form.newImages.forEach((file) => {
      formData.append("images", file);
    });

    onSubmit(id, formData);
  };


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold bg-gradient-to-r from-[#3B6E5F] to-[#4A7A57] text-transparent bg-clip-text">
            {mode === "edit" ? "✨ Chỉnh sửa sản phẩm" : "✨ Tạo sản phẩm mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Cột trái */}
            <div className="space-y-5">
              {/* Tên sản phẩm */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  value={form.name ?? ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nhập tên sản phẩm"
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-md transition"
                  required
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Mô tả
                </label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Nhập mô tả sản phẩm"
                  rows={3}
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-md transition resize-none"
                />
              </div>

              {/* Giá & Giảm giá */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Giá (₫)
                  </label>
                  <input
                    type="number"
                    value={form.price ?? ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+/, "");
                      setForm({ ...form, price: Number(val) });
                    }}
                    placeholder="Nhập giá sản phẩm"
                    className="w-full p-3 rounded-xl bg-white border border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-md transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Giảm giá
                  </label>
                  <input
                    type="number"
                    value={form.deal ?? ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+/, "");
                      setForm({ ...form, deal: Number(val) });
                    }}
                    placeholder="Nhập giảm giá"
                    className="w-full p-3 rounded-xl bg-white border border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-md transition"
                  />
                </div>
              </div>

              {/* Số lượng */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Số lượng
                </label>
                <input
                  type="number"
                  value={form.stock ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                  placeholder="Nhập số lượng"
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-md transition"
                  required
                />
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Danh mục
                </label>
                <select
                  value={form.category ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:shadow-md transition"
                  required
                >
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Checkbox Hoạt động */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-5 w-5 accent-[#4A7A57]"
                />
                <label className="text-gray-700">Hoạt động</label>
              </div>
            </div>

            {/* Cột phải */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Ảnh sản phẩm
              </label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer bg-white shadow-lg hover:shadow-2xl hover:border-[#4A7A57] hover:bg-indigo-50 transition group relative overflow-hidden">
                {/* Icon trung tâm đẹp hơn */}
                <div className="flex flex-col items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-[#3B6E5F] mb-3 group-hover:text-[#4A7A57] transition"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                  <span className="text-gray-600 group-hover:text-[#4A7A57] font-semibold text-lg">
                    Nhấn để chọn ảnh
                  </span>
                </div>

                {/* Input thực tế */}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {/* Hiệu ứng overlay khi hover */}
                <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-20 transition rounded-3xl pointer-events-none"></div>
              </label>

              {previewUrls.length > 0 && (
                <div className="mt-4 relative bg-gray-50 rounded-2xl shadow-sm flex items-center justify-center h-64 overflow-hidden border border-gray-200">
                  <Image
                    src={previewUrls[currentIndex]}
                    alt="preview"
                    width={500}
                    height={500}
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(previewUrls[currentIndex])}
                    className="absolute top-2 right-2 bg-indigo-600 text-white p-2 rounded-full shadow hover:scale-110 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {previewUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        className="absolute left-2 bg-white/90 p-2 rounded-full shadow"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        className="absolute right-2 bg-white/90 p-2 rounded-full shadow"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {previewUrls.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {previewUrls.map((url, idx) => (
                    <Image
                      key={idx}
                      src={url}
                      alt="thumb"
                      width={64}
                      height={64}
                      className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 ${idx === currentIndex
                        ? "border-indigo-500"
                        : "border-transparent opacity-70"
                        }`}
                      onClick={() => setCurrentIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#3B6E5F] text-white rounded-xl shadow hover:shadow-lg transition"
            >
              {mode === "edit" ? "Lưu" : "+ Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>


  );

};

export default ProductFormModal;
