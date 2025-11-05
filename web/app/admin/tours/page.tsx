'use client';

import {
  createTour,
  deleteTour,
  getTours,
  updateTour,
  uploadMedia,
} from '@/lib/client-actions';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import TourModal from '../../../components/modals/TourModal';

/* ================== TYPES ================== */
type Activity = { timeFrom?: string; timeTo?: string; description: string };
type Itinerary = { day: number; title: string; activities: Activity[] };
type PriceOption = {
  name: string;
  price: number;
  minPeople?: number;
  maxPeople?: number;
};
type ServiceSection = { title: string; details: { value: string }[] };

export type TourFormData = {
  code?: string;
  name: string;
  slug?: string;
  description?: string; // ✅ cho phép undefined
  durationDays: number;
  durationNights: number;
  stayType: string;
  transportation: string;
  departurePoint: string;
  departureFrequency?: string;
  targetAudience?: string;
  itinerary: Itinerary[];
  priceOptions: PriceOption[];
  servicesIncluded: ServiceSection[];
  servicesExcluded: ServiceSection[];
  notes: ServiceSection[];
  images?: string[]; // ✅ optional
  isActive: boolean;
  viewsCount?: number;
  soldCount?: number;
  rating?: { average: number; count: number };
};

type Tour = TourFormData & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

/* ================== MAIN COMPONENT ================== */
export default function TourPage() {
  const [search, setSearch] = useState('');
  const [tours, setTours] = useState<Tour[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Tour> | null>(null);

  /* ================== API ================== */
  const fetchTours = async () => {
    try {
      const res = await getTours(page, limit, search);
      if (res.success) {
        setTours(res.data.data);
        setTotal(res.data.total);
      } else toast.error(res.message);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi lấy danh sách tour');
    }
  };

  const handleSubmitTour = async (
    data: TourFormData,
    existingImages: string[],
    newImages: File[],
  ) => {
    try {
      let uploadedImages: string[] = [];

      if (newImages.length > 0) {
        const uploadForm = new FormData();
        newImages.forEach(file => uploadForm.append('files', file));
        const res = await uploadMedia(uploadForm);
        console.log('Upload response:', res.data);
        uploadedImages = res.data as string[];
      }
      const payload = {
        ...data,
        images: [...existingImages, ...uploadedImages],
        description: data.description || '',
      };

      if (editData && editData._id) {
        await updateTour(editData._id, payload);
        toast.success('Cập nhật tour thành công!');
      } else {
        await createTour(payload);
        toast.success('Tạo tour thành công!');
      }

      fetchTours();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Lỗi khi lưu tour');
    }
  };

  const handleEdit = (tour: TourFormData) => {
    setEditData(tour);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteTour(id);
      if (res.success) {
        toast.success('Xóa tour thành công 🎉');
        fetchTours();
      } else {
        toast.error(res.message || 'Xóa thất bại ❌');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa tour');
    }
  };

  useEffect(() => {
    fetchTours();
  }, [page, search]);

  /* ================== RENDER ================== */
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  const filtered = tours.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-8">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <span className="rounded-lg p-2 text-green-600">🌍</span> Quản Lý Tour
        </h1>
      </div>

      {/* Search + Create */}
      <div className="mb-8 flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tour..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pr-4 pl-12 shadow transition-all duration-200 ease-in-out focus:border-green-500 focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex transform items-center gap-2 rounded-xl bg-[#3B6E5F] px-5 py-2 text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:to-[#4A7A57] hover:shadow-2xl"
        >
          <Plus className="h-5 w-5" /> Tạo Tour
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#4A7A57]">
            <tr>
              {[
                'Tên Tour',
                'Mã Tour',
                'Đã bán',
                'Đánh giá',
                'Trạng Thái',
                'Ngày Tạo',
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
          <tbody className="divide-y divide-gray-200">
            {filtered.length > 0 ? (
              filtered.map((tour, idx) => (
                <tr
                  key={tour._id}
                  className={`transition-all duration-200 ${idx % 2 === 0 ? 'bg-[#E6F0E9]' : 'bg-[#F4FAF4]'}`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {tour.name}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{tour.code}</td>
                  <td className="px-6 py-4 text-gray-600">{tour.soldCount}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {tour.rating?.average
                      ? `${tour.rating.average} (${tour.rating.count})`
                      : 'Chưa có đánh giá'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                        tour.isActive
                          ? 'border border-green-200 bg-green-50 text-green-700'
                          : 'border border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      {tour.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(tour.createdAt)}
                  </td>
                  <td className="space-x-4 px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(tour)}
                      className="text-blue-500 transition-colors hover:text-blue-700"
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteId(tour._id);
                        setIsConfirmOpen(true);
                      }}
                      className="text-red-500 transition-colors hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-10 text-center text-lg text-gray-500"
                >
                  Không tìm thấy tour nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TourModal
          isOpen={isModalOpen}
          mode={editData ? 'edit' : 'create'}
          initialData={editData || {}}
          onClose={() => {
            setIsModalOpen(false);
            setEditData(null);
          }}
          onSubmit={handleSubmitTour}
        />
      )}

      {/* Confirm Delete */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-full bg-red-50 p-3">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Xác Nhận Xóa
              </h2>
            </div>
            <p className="mb-8 text-gray-600">
              Bạn có chắc chắn muốn xóa tour này? Hành động này không thể hoàn
              tác.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-gray-700 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmDeleteId) handleDelete(confirmDeleteId);
                  setIsConfirmOpen(false);
                  setConfirmDeleteId(null);
                }}
                className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
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
