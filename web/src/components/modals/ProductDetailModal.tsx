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
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-gray-200 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
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
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Mô tả
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-xl"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Giá (₫)
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+/, "");
                      setForm({ ...form, price: Number(val) })
                    }}
                    className="w-full p-3 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Giảm giá
                  </label>
                  <input
                    type="number"             
                    value={form.deal}
                     onChange={(e) => {
                      const val = e.target.value.replace(/^0+/, "");
                      setForm({ ...form, deal: Number(val) })
                    }}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Số lượng
                </label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                  className="w-full p-3 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Danh mục
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-5 w-5 accent-indigo-600"
                />
                <label className="text-gray-700">Hoạt động</label>
              </div>
            </div>

            {/* Cột phải */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Ảnh sản phẩm
              </label>
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer">
                <span className="text-gray-500">📷 Nhấn để chọn ảnh</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                />
              </label>

              {previewUrls.length > 0 && (
                <div className="mt-4 relative bg-gray-50 rounded-2xl shadow-md flex items-center justify-center h-64 overflow-hidden border">
                  <Image
                    src={previewUrls[currentIndex]}
                    alt="preview"
                    width={500}
                    height={500}
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(previewUrls[currentIndex])}
                    className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {previewUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        className="absolute left-3 bg-white/80 p-2 rounded-full shadow-md"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        className="absolute right-3 bg-white/80 p-2 rounded-full shadow-md"
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
              className="px-5 py-2 bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl"
            >
              {mode === "edit" ? "Lưu " : "+ Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
