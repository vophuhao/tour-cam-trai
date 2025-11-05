'use client';

import CategoryModal from '@/components/modals/CategoryModal';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/lib/client-actions';
import { formatDate } from '@/lib/utils';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

type Category = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function CategoryPage() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<
    Category | undefined
  >();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // State cho confirm delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await getCategories(page, limit, search);
      if (res.success) {
        setCategories(res.data.data);
        setTotal(res.data.total);
      } else toast.error(res.message);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lấy danh sách categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      const res = await deleteCategory(id);
      if (res.success) {
        toast.success('Xóa category thành công 🎉');
        fetchCategories();
      } else {
        toast.error(res.message || 'Xóa thất bại ❌');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa category');
    }
  };

  const handleSubmit = async (
    id: string | undefined,
    data: { name: string; isActive: boolean },
  ) => {
    try {
      if (modalMode === 'create') {
        const res = await createCategory(data);
        if (res.success) toast.success('Tạo thành công 🎉');
        else toast.error('Tạo thất bại ❌');
      } else if (modalMode === 'edit' && id) {
        const res = await updateCategory(id, data);
        if (res.success) toast.success('Cập nhật thành công 🎉');
        else toast.error('Cập nhật thất bại ❌');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi thao tác category');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <span className="rounded-lg p-2 text-blue-600">📂</span>
            Quản Lý Danh Mục
          </h1>
        </div>
      </div>
      {/* Search */}
      <div className="mb-8 flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-12 shadow transition-all duration-200 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => {
            setModalMode('create');
            setIsModalOpen(true);
          }}
          className="flex transform items-center gap-2 rounded-xl bg-[#3B6E5F] px-5 py-2 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#4A7A57] hover:shadow-2xl"
        >
          <Plus className="h-5 w-5" /> Tao
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-[#4A7A57]">
            <tr>
              {[
                'Tên',
                'Ngày Tạo',
                'Ngày Cập Nhật',
                'Trạng Thái',
                'Hành Động',
              ].map(h => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-sm font-semibold tracking-wider text-[#F4FAF4] uppercase"
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
                  className={`transition-all duration-200 ease-in-out ${
                    idx % 2 === 0 ? 'bg-[#E6F0E9]' : 'bg-[#F4FAF4]'
                  } hover:bg-[#89a984] hover:shadow-sm`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(cat.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(cat.updatedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                        cat.isActive
                          ? 'border border-green-200 bg-green-50 text-green-700'
                          : 'border border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      {cat.isActive ? 'Hoạt Động' : 'Không Hoạt Động'}
                    </span>
                  </td>
                  <td className="space-x-4 px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setModalMode('edit');
                        setEditingCategory(cat);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-500 transition-colors hover:text-blue-700"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteId(cat.id);
                        setIsConfirmOpen(true);
                      }}
                      className="text-red-500 transition-colors hover:text-red-700"
                      title="Xóa"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-lg text-gray-500"
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
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="flex h-10 w-10 transform items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:scale-105 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ‹
          </button>
          <span className="rounded-lg bg-blue-100 px-5 py-2 font-semibold text-blue-700 shadow-sm">
            {page}
          </span>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage(p => p + 1)}
            className="flex h-10 w-10 transform items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:scale-105 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="animate-scaleIn w-full max-w-md scale-95 transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-full bg-red-50 p-3">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Xác Nhận Xóa
              </h2>
            </div>
            <p className="mb-8 leading-relaxed text-gray-600">
              Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể
              hoàn tác.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  setConfirmDeleteId(null);
                }}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmDeleteId) handleDelete(confirmDeleteId);
                  setIsConfirmOpen(false);
                  setConfirmDeleteId(null);
                }}
                className="transform rounded-lg bg-red-600 px-5 py-2 font-semibold text-white shadow-md transition-all duration-200 hover:scale-105 hover:bg-red-700 hover:shadow-lg"
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
