"use client";

import CategoryModal from "@/components/modals/CategoryModal";
import { createCategory, deleteCategory, getAllCategories, updateCategory } from "@/lib/api";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

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
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
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
      const res = await getAllCategories(page, limit, search);
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

  const handleSubmit = async (id: string | undefined, data: { name: string; isActive: boolean }) => {
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
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Category Management</h1>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <button
            onClick={() => { setModalMode("create"); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow hover:shadow-lg transition"
          >
            + Create
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-4 text-left text-gray-700 font-semibold">Name</th>
              <th className="p-4 text-left text-gray-700 font-semibold">Created At</th>
              <th className="p-4 text-left text-gray-700 font-semibold">Updated At</th>
              <th className="p-4 text-left text-gray-700 font-semibold">Status</th>
              <th className="p-4 text-right text-gray-700 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">{cat.name}</td>
                  <td className="p-4">{formatDate(cat.createdAt)}</td>
                  <td className="p-4">{formatDate(cat.updatedAt)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${cat.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => { setModalMode("edit"); setEditingCategory(cat); setIsModalOpen(true); }}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setConfirmDeleteId(cat.id); setIsConfirmOpen(true); }}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center items-center mt-6 space-x-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Prev
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded">{page}</span>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialData={editingCategory}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* Confirm Delete Modal */}
      {/* Confirm Delete Modal */}
{isConfirmOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 transform transition duration-300 scale-95 animate-in slide-in-from-bottom-5">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Xác nhận xóa</h2>
      <p className="text-gray-600 mb-6">
        Bạn có chắc chắn muốn xóa category này?
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={() => { setIsConfirmOpen(false); setConfirmDeleteId(null); }}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          Hủy
        </button>
        <button
          onClick={() => {
            if (confirmDeleteId) handleDelete(confirmDeleteId);
            setIsConfirmOpen(false);
            setConfirmDeleteId(null);
          }}
          className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-lg"
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
