'use client';

import ProductFormModal from '@/components/modals/ProductDetailModal';
import {
  createProduct,
  deleteProduct,
  getAllCategories,
  getProduct,
  updateProduct,
  uploadMedia,
} from '@/lib/client-actions';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProductPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // fetch products
  const fetchProduct = async () => {
    try {
      const res = await getProduct(page, limit, search);
      if (res.success) {
        setProducts(res.data.data);
        setTotal(res.data.total);
      } else toast.error(res.message);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lấy danh sách sản phẩm');
    }
  };
  useEffect(() => {
    fetchProduct();
  }, [page, search]);

  // fetch categories
  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      if (res.success) {
        setCategories(res.data);
      } else toast.error(res.message);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lấy danh mục');
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  // create or update
  const handleCreateOrUpdate = async (
    id: string | undefined,
    data: FormData,
  ) => {
    try {
      // helper to safely parse JSON fields appended from modal
      const parseJsonField = <T,>(key: string): T => {
        const v = data.get(key);
        if (!v) return [] as unknown as T;
        try {
          return JSON.parse(v as string) as T;
        } catch {
          return [] as unknown as T;
        }
      };

      const specifications =
        parseJsonField<{ label: string; value: string }[]>('specifications');
      const variants = parseJsonField<
        {
          size: string;
          expandedSize: string;
          foldedSize: string;
          loadCapacity: string;
          weight: string;
        }[]
      >('variants');
      const details =
        parseJsonField<
          { title: string; items: { label: string; value: string }[] }[]
        >('details');
      const guide = parseJsonField<string[]>('guide');
      const warnings = parseJsonField<string[]>('warnings');

      if (modalMode === 'create') {
        const images = data.getAll('images') as File[];
        let uploadedImages: string[] = [];
        if (images.length > 0) {
          const uploadForm = new FormData();
          images.forEach(img => uploadForm.append('files', img));
          const res = await uploadMedia(uploadForm);
          uploadedImages = res.data as string[];
        }

        const dataPost = {
          name: data.get('name') as string,
          description: (data.get('description') as string) || '',
          price: Number(data.get('price')),
          deal: Number(data.get('deal')),
          stock: Number(data.get('stock')),
          images: uploadedImages,
          category: data.get('category') as string,
          isActive: (data.get('isActive') as string) === 'true',
          specifications,
          variants,
          details,
          guide,
          warnings,
        };
        console.log('Creating product with data:', dataPost);

        const res = await createProduct(dataPost);
        if (res.success) toast.success('Tạo sản phẩm thành công 🎉');
        else toast.error('Tạo sản phẩm thất bại ❌');
      } else if (modalMode === 'edit' && id) {
        const oldImages = data.getAll('oldImages') as string[];
        const newFiles = data.getAll('images') as File[];

        let newImages: string[] = [];
        if (newFiles.length > 0) {
          const uploadForm = new FormData();
          newFiles.forEach(file => uploadForm.append('files', file));
          const uploadRes = await uploadMedia(uploadForm);
          newImages = uploadRes.data as string[];
        }

        const allImages = [...oldImages, ...newImages];
        const dataPost = {
          name: data.get('name') as string,
          description: (data.get('description') as string) || '',
          price: Number(data.get('price')),
          deal: Number(data.get('deal')),
          stock: Number(data.get('stock')),
          images: allImages,
          category: data.get('category') as string,
          isActive: (data.get('isActive') as string) === 'true',
          specifications,
          variants,
          details,
          guide,
          warnings,
        };
        console.log('Updating product with data:', dataPost);
        const res = await updateProduct(id, dataPost);
        if (res.success) toast.success('Cập nhật thành công 🎉');
        else toast.error('Cập nhật thất bại ❌');
      }

      setIsModalOpen(false);
      fetchProduct();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi thao tác sản phẩm');
    }
  };

  // delete
  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success('Xóa sản phẩm thành công 🎉');
        fetchProduct();
      } else {
        toast.error(res.message || 'Xóa thất bại ❌');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Quản lý sản phẩm
        </h1>
      </div>

      {/* Search & Button */}
      <div className="mb-6 flex flex-col items-stretch justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
        {/* Ô tìm kiếm */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white py-2 pr-4 pl-10 text-base shadow-sm outline-none focus:border-[#4A7A57] focus:ring-2 focus:ring-[#3B6E5F] sm:w-72"
          />
        </div>

        {/* Nút tạo */}
        <button
          onClick={() => {
            setModalMode('create');
            setIsModalOpen(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#3B6E5F] px-4 py-2 text-base font-medium text-[#F4FAF4] shadow-md transition hover:bg-[#4A7A57] hover:shadow-lg sm:w-auto sm:px-5 sm:py-2.5"
        >
          <Plus className="h-5 w-5" /> <span>Tạo</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-lg">
        <table className="w-full text-sm sm:text-base">
          <thead className="bg-[#4A7A57]">
            <tr className="text-[#F4FAF4]">
              <th className="px-4 py-3 text-left font-semibold sm:px-6 sm:py-4">
                Tên
              </th>
              <th className="hidden px-4 py-3 text-center font-semibold sm:px-6 sm:py-4 md:table-cell">
                Giá (₫)
              </th>
              <th className="hidden px-4 py-3 text-center font-semibold sm:px-6 sm:py-4 md:table-cell">
                Giảm giá (₫)
              </th>
              <th className="px-4 py-3 text-center font-semibold sm:px-6 sm:py-4">
                Số lượng
              </th>
              <th className="hidden px-4 py-3 text-center font-semibold sm:px-6 sm:py-4 lg:table-cell">
                Danh mục
              </th>
              <th className="px-4 py-3 text-center font-semibold sm:px-6 sm:py-4">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-center font-semibold sm:px-6 sm:py-4">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, idx) => (
              <tr
                key={p._id}
                className={`transition-all duration-200 ease-in-out ${
                  idx % 2 === 0 ? 'bg-[#E6F0E9]' : 'bg-[#F4FAF4]'
                } hover:bg-blue-100/40 hover:shadow-sm`}
              >
                <td className="max-w-[160px] truncate px-4 py-3 font-medium text-gray-900 sm:max-w-none sm:px-6 sm:py-4">
                  {p.name}
                </td>
                <td className="hidden px-4 py-3 text-center sm:px-6 sm:py-4 md:table-cell">
                  {p.price}
                </td>
                <td className="hidden px-4 py-3 text-center sm:px-6 sm:py-4 md:table-cell">
                  {p.deal}
                </td>
                <td className="px-4 py-3 text-center sm:px-6 sm:py-4">
                  {p.stock}
                </td>
                <td className="hidden px-4 py-3 text-center sm:px-6 sm:py-4 lg:table-cell">
                  {p.category?.name}
                </td>
                <td className="px-4 py-3 text-center sm:px-6 sm:py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${
                      p.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center sm:px-6 sm:py-4">
                  <div className="flex justify-center gap-3 sm:gap-4">
                    <button
                      onClick={() => {
                        setModalMode('edit');
                        setEditingProduct(p);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 transition hover:text-blue-800"
                      title="Chỉnh sửa"
                    >
                      <Pencil className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteId(p._id);
                        setIsConfirmOpen(true);
                      }}
                      className="text-red-600 transition hover:text-red-800"
                      title="Xóa"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
        <div className="mt-8 flex items-center justify-center space-x-2 sm:space-x-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded-lg bg-gray-200 px-3 py-2 text-sm transition hover:bg-gray-300 disabled:opacity-50 sm:px-4 sm:text-base"
          >
            Prev
          </button>
          <span className="rounded-lg bg-gray-100 px-3 py-2 text-sm shadow-sm sm:px-4 sm:text-base">
            {page}
          </span>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage(p => p + 1)}
            className="rounded-lg bg-gray-200 px-3 py-2 text-sm transition hover:bg-gray-300 disabled:opacity-50 sm:px-4 sm:text-base"
          >
            Next
          </button>
        </div>
      )}

      {/* Form modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        categories={categories}
        initialData={editingProduct}
      />

      {/* Confirm delete */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-11/12 transform rounded-2xl bg-white p-6 shadow-2xl transition duration-300 sm:w-96">
            <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
              Xác nhận xóa
            </h2>
            <p className="mb-6 text-sm text-gray-600 sm:text-base">
              Bạn có chắc chắn muốn xóa sản phẩm này?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsConfirmOpen(false);
                  setConfirmDeleteId(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-100 sm:px-5 sm:text-base"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmDeleteId) handleDelete(confirmDeleteId);
                  setIsConfirmOpen(false);
                  setConfirmDeleteId(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-red-700 sm:px-5 sm:text-base"
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
