"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

import ProductFormModal from "@/components/modals/ProductDetailModal";
import { uploadMedia, getAllCategories } from "@/lib/api";
import { useProducts, useProductActions } from "@/hook/useProduct";
import { useQuery } from "@tanstack/react-query";

import { Product, Category } from "@/types/product";

export default function ProductPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  /* =============================
   * 🔹 Hook: Lấy sản phẩm & danh mục
   * ============================= */
  const { data, isLoading } = useProducts(page, limit, search);
  const { createProduct, updateProduct, deleteProduct } = useProductActions();

  const { data: categoryRes } = useQuery({
    queryKey: ["categories", "all"],
    queryFn: getAllCategories,
    staleTime: 5 * 60 * 1000,
  });
  const categories = categoryRes?.data || [];

  const products = data?.data || [];
  const total = data?.pagination?.total || 0;

  /* =============================
   * 🧩 Tạo hoặc cập nhật sản phẩm
   * ============================= */
  const handleCreateOrUpdate = async (id: string | undefined, formData: FormData) => {
    try {
      const parseJsonField = <T,>(key: string): T => {
        const v = formData.get(key);
        if (!v) return [] as unknown as T;
        try {
          return JSON.parse(v as string);
        } catch {
          return [] as unknown as T;
        }
      };

      const specifications = parseJsonField<{ label: string; value: string }[]>("specifications");
      const variants = parseJsonField<{ size: string; expandedSize: string; foldedSize: string; loadCapacity: string; weight: string; }[]>("variants");
      const details = parseJsonField<{ title: string; items: { label: string; value: string }[] }[]>("details");
      const guide = parseJsonField<string[]>("guide");
      const warnings = parseJsonField<string[]>("warnings");

      if (modalMode === "create") {
        const images = formData.getAll("images") as File[];
        let uploadedImages: string[] = [];

        if (images.length > 0) {
          const uploadForm = new FormData();
          images.forEach((img) => uploadForm.append("files", img));
          const res = await uploadMedia(uploadForm);
          uploadedImages = res.data as string[];
        }

        const dataPost = {
          name: formData.get("name") as string,
          description: (formData.get("description") as string) || "",
          price: Number(formData.get("price")),
          deal: Number(formData.get("deal")),
          stock: Number(formData.get("stock")),
          images: uploadedImages,
          category: formData.get("category") as string,
          isActive: (formData.get("isActive") as string) === "true",
          specifications,
          variants,
          details,
          guide,
          warnings,
        };

        createProduct(dataPost as any, {
          onSuccess: () => {
            toast.success("Tạo sản phẩm thành công 🎉");
            setIsModalOpen(false);
          },
          onError: (err) => toast.error(err.message || "Lỗi tạo sản phẩm ❌"),
        });
      } else if (modalMode === "edit" && id) {
        const oldImages = formData.getAll("oldImages") as string[];
        const newFiles = formData.getAll("images") as File[];

        let newImages: string[] = [];
        if (newFiles.length > 0) {
          const uploadForm = new FormData();
          newFiles.forEach((file) => uploadForm.append("files", file));
          const uploadRes = await uploadMedia(uploadForm);
          newImages = uploadRes.data as string[];
        }

        const allImages = [...oldImages, ...newImages];
        const dataPost = {
          name: formData.get("name") as string,
          description: (formData.get("description") as string) || "",
          price: Number(formData.get("price")),
          deal: Number(formData.get("deal")),
          stock: Number(formData.get("stock")),
          images: allImages,
          category: formData.get("category") as string,
          isActive: (formData.get("isActive") as string) === "true",
          specifications,
          variants,
          details,
          guide,
          warnings,
        };

        updateProduct(
          { id, data: dataPost as any },
          {
            onSuccess: () => {
              toast.success("Cập nhật thành công 🎉");
              setIsModalOpen(false);
            },
            onError: (err) => toast.error(err.message || "Cập nhật thất bại ❌"),
          }
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi thao tác sản phẩm");
    }
  };

  /* =============================
   * 🗑️ Xóa sản phẩm
   * ============================= */
  const handleDelete = (id: string) => {
    deleteProduct(id, {
      onSuccess: () => toast.success("Xóa sản phẩm thành công 🎉"),
      onError: (err) => toast.error(err.message || "Xóa sản phẩm thất bại ❌"),
    });
  };

  /* =============================
   * 🖼️ UI hiển thị
   * ============================= */
  if (isLoading) return <p className="text-center mt-10">Đang tải sản phẩm...</p>;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Quản lý sản phẩm
        </h1>
      </div>

      {/* Search & Button */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-72 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3B6E5F] focus:border-[#4A7A57] outline-none shadow-sm bg-white text-base"
          />
        </div>

        <button
          onClick={() => {
            setModalMode("create");
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-[#3B6E5F] hover:bg-[#4A7A57] text-[#F4FAF4] px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition text-base font-medium w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" /> <span>Tạo</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100">
        <table className="w-full text-sm sm:text-base">
          <thead className="bg-[#4A7A57] text-[#F4FAF4]">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Tên</th>
              <th className="px-4 py-3 text-center hidden md:table-cell">Giá</th>
              <th className="px-4 py-3 text-center hidden md:table-cell">Giảm giá</th>
              <th className="px-4 py-3 text-center">Kho</th>
              <th className="px-4 py-3 text-center hidden lg:table-cell">Danh mục</th>
              <th className="px-4 py-3 text-center">Trạng thái</th>
              <th className="px-4 py-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr
                key={p._id}
                className={`${idx % 2 === 0 ? "bg-[#E6F0E9]" : "bg-[#F4FAF4]"} hover:bg-blue-100/40 transition`}
              >
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-center hidden md:table-cell">{p.price}</td>
                <td className="px-4 py-3 text-center hidden md:table-cell">{p.deal}</td>
                <td className="px-4 py-3 text-center">{p.stock}</td>
                <td className="px-4 py-3 text-center hidden lg:table-cell">{p.category?.name}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setModalMode("edit");
                        setEditingProduct(p);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteId(p._id);
                        setIsConfirmOpen(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center items-center mt-8 space-x-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Prev
          </button>
          <span className="px-4 py-2 rounded-lg bg-gray-100 shadow-sm">{page}</span>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        categories={categories}
        initialData={editingProduct}
      />

      {/* Confirm Delete */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 sm:w-96">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa</h2>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa sản phẩm này?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmDeleteId) handleDelete(confirmDeleteId);
                  setIsConfirmOpen(false);
                  setConfirmDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
