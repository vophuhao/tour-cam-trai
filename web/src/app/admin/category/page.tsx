"use client";

import CategoryModal from "@/components/modals/CategoryModal";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

type Category = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function CategoryPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // State cho confirm delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategories(page, limit, search);
      if (res.success) {
        setCategories(res.data.data);
        setTotal(res.data.total);
      } else toast.error(res.message);
    } catch (err: any) {
      toast.error(err.message || "Lỗi lấy danh sách categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      const res = await deleteCategory(id);
      if (res.success) {
        toast.success("Xóa category thành công 🎉");
        fetchCategories();
      } else {
        toast.error(res.message || "Xóa thất bại ❌");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa category");
    }
  };

  const handleSubmit = async (
    id: string | undefined,
    data: { name: string; isActive: boolean }
  ) => {
    try {
      if (modalMode === "create") {
        const res = await createCategory(data);
        if (res.success) toast.success("Tạo thành công 🎉");
        else toast.error("Tạo thất bại ❌");
      } else if (modalMode === "edit" && id) {
        const res = await updateCategory(id, data);
        if (res.success) toast.success("Cập nhật thành công 🎉");
        else toast.error("Cập nhật thất bại ❌");
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Lỗi thao tác category");
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className=" text-blue-600 p-2 rounded-lg ">📂</span>
            Quản Lý Danh Mục
          </h1>
        </div>

      </div>
      {/* Search */}
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 w-full bg-white border border-gray-200 rounded-xl shadow 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     transition-all duration-200 ease-in-out"
          />
        </div>
        <button
          onClick={() => {
            setModalMode("create");
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#3B6E5F]
                   hover:bg-[#4A7A57] text-white px-5 py-2
                   rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 
                   transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Tao
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-[#4A7A57]">
            <tr>
              {["Tên", "Ngày Tạo", "Ngày Cập Nhật", "Trạng Thái", "Hành Động"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-sm font-semibold text-[#F4FAF4] uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200">
            {filtered.length > 0 ? (
              filtered.map((cat, idx) => (
                <tr
                  key={cat.id}
                  className={`transition-all duration-200 ease-in-out ${idx % 2 === 0 ? "bg-[#E6F0E9]" : "bg-[#F4FAF4]"
                    } hover:bg-[#89a984] hover:shadow-sm`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(cat.createdAt)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(cat.updatedAt)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${cat.isActive
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                      {cat.isActive ? "Hoạt Động" : "Không Hoạt Động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      onClick={() => {
                        setModalMode("edit");
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteId(cat.id);
                        setIsConfirmOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-gray-500 text-lg"
                >
                  Không tìm thấy danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center items-center mt-10 gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-full 
                     bg-white border border-gray-200 text-gray-600 
                     hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition transform hover:scale-105"
          >
            ‹
          </button>
          <span className="px-5 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold shadow-sm">
            {page}
          </span>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-full 
                     bg-white border border-gray-200 text-gray-600 
                     hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed 
                     transition transform hover:scale-105"
          >
            ›
          </button>
        </div>
      )}

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingCategory}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Confirm Delete Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md 
                        transform transition-all duration-300 scale-95 animate-scaleIn">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Xác Nhận Xóa</h2>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  setConfirmDeleteId(null);
                }}
                className="px-5 py-2 bg-white border border-gray-200 text-gray-700 
                         rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmDeleteId) handleDelete(confirmDeleteId);
                  setIsConfirmOpen(false);
                  setConfirmDeleteId(null);
                }}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold 
                         hover:bg-red-700 shadow-md hover:shadow-lg 
                         transition-all duration-200 transform hover:scale-105"
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
