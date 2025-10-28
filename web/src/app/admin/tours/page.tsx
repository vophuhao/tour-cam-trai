"use client";

import { useState, useEffect } from "react";
import { getTours, deleteTour, getTourById, createTour, updateTour, uploadMedia } from "@/lib/api";
import { toast } from "react-toastify";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import TourModal from "@/components/modals/TourModal";
import { useTours } from "@/hook/useTour";

/* ================== TYPES ================== */
type Activity = { timeFrom?: string; timeTo?: string; description: string };
type Itinerary = { day: number; title: string; activities: Activity[] };
type PriceOption = { name: string; price: number; minPeople?: number; maxPeople?: number };
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
  rating?: { average: number; count: number }
};

type Tour = TourFormData & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};


export default function TourPage() {
  const [search, setSearch] = useState("");
  const [tours, setTours] = useState<Tour[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Tour> | null>(null);
  const { data, isLoading, error } = useTours(1, 10);
  useEffect(() => {
    if (data && (data as any).data) {
      const raw = (data as any).data;
      // Normalize possible nested arrays (Tour[][]) to Tour[]
      const normalizedTours = Array.isArray(raw) ? raw.flat() : [];
      setTours(normalizedTours as Tour[]);
      setTotal((data as any).pagination?.total ?? 0);
    }
  }, [data]);

  const handleSubmitTour = async (
    data: TourFormData,
    existingImages: string[],
    newImages: File[]
  ) => {
    try {
      let uploadedImages: string[] = [];

      if (newImages.length > 0) {
        const uploadForm = new FormData();
        newImages.forEach((file) => uploadForm.append("files", file));
        const res = await uploadMedia(uploadForm);
        console.log("Upload response:", res.data);
        uploadedImages = res.data as string[];
      }
      const payload = {
        ...data,
        images: [...existingImages, ...uploadedImages],
        description: data.description || "",
      };

      if (editData && editData._id) {
        await updateTour(editData._id, payload);
        toast.success("Cập nhật tour thành công!");
      } else {
        await createTour(payload);
        toast.success("Tạo tour thành công!");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Lỗi khi lưu tour");
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
        toast.success("Xóa tour thành công 🎉");

      } else {
        toast.error(res.message || "Xóa thất bại ❌");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa tour");
    }
  };


  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
  };

  const filtered = tours.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-green-600 p-2 rounded-lg">🌍</span> Quản Lý Tour
        </h1>
      </div>

      {/* Search + Create */}
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-96">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm tour..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 w-full bg-white border border-gray-200 rounded-xl shadow focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 ease-in-out"
          />
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#3B6E5F]  hover:to-[#4A7A57] text-white px-5 py-2 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" /> Tạo Tour
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#4A7A57]">
            <tr>
              {["Tên Tour", "Mã Tour", "Đã bán", "Đánh giá", "Trạng Thái", "Ngày Tạo", "Hành Động"].map((h) => (
                <th
                  key={h}
                  className="px-6 py-4 text-left text-sm font-semibold text-[#F4FAF4] uppercase tracking-wider"
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
                  className={`transition-all duration-200 ${idx % 2 === 0 ? "bg-[#E6F0E9]" : "bg-[#F4FAF4]"}`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">{tour.name}</td>
                  <td className="px-6 py-4 text-gray-600">{tour.code}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {tour.soldCount}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {tour.rating?.average ? `${tour.rating.average} (${tour.rating.count})` : "Chưa có đánh giá"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${tour.isActive
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                    >
                      {tour.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(tour.createdAt)}</td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button
                      onClick={() => handleEdit(tour)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDeleteId(tour._id);
                        setIsConfirmOpen(true);
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-gray-500 text-lg">
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
          mode={editData ? "edit" : "create"}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-50 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Xác Nhận Xóa</h2>
            </div>
            <p className="text-gray-600 mb-8">
              Bạn có chắc chắn muốn xóa tour này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsConfirmOpen(false)}
                className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmDeleteId) handleDelete(confirmDeleteId);
                  setIsConfirmOpen(false);
                  setConfirmDeleteId(null);
                }}
                className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
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
