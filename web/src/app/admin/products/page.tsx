"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

import ProductFormModal from "@/components/modals/ProductDetailModal";
import {
  createProduct,
  deleteProduct,
  getAllCategories,
  getProduct,
  updateProduct,
  uploadMedia,
} from "@/lib/api";

import {
  Product,
  ProductSpecification,
  ProductVariant,
  ProductDetailSection,
  Category,
} from "@/types/product";

export default function ProductPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
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
      toast.error(err.message || "Lỗi lấy danh sách sản phẩm");
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
      toast.error(err.message || "Lỗi lấy danh mục");
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  // create or update
   const handleCreateOrUpdate = async (id: string | undefined, data: FormData) => {
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

      const specifications = parseJsonField<{ label: string; value: string }[]>("specifications");
      const variants = parseJsonField<
        { size: string; expandedSize: string; foldedSize: string; loadCapacity: string; weight: string }[]
      >("variants");
      const details = parseJsonField<{ title: string; items: { label: string; value: string }[] }[]>("details");
      const guide = parseJsonField<string[]>("guide");
      const warnings = parseJsonField<string[]>("warnings");

      if (modalMode === "create") {
        const images = data.getAll("images") as File[];
        let uploadedImages: string[] = [];
        if (images.length > 0) {
          const uploadForm = new FormData();
          images.forEach((img) => uploadForm.append("files", img));
          const res = await uploadMedia(uploadForm);
          uploadedImages = res.data as string[];
        }

        const dataPost = {
          name: data.get("name") as string,
          description: (data.get("description") as string) || "",
          price: Number(data.get("price")),
          deal: Number(data.get("deal")),
          stock: Number(data.get("stock")),
          images: uploadedImages,
          category: data.get("category") as string,
          isActive: (data.get("isActive") as string) === "true",
          specifications,
          variants,
          details,
          guide,
          warnings,
        };
        console.log("Creating product with data:", dataPost);

        const res = await createProduct(dataPost);
        if (res.success) toast.success("Tạo sản phẩm thành công 🎉");
        else toast.error("Tạo sản phẩm thất bại ❌");
      } else if (modalMode === "edit" && id) {
        const oldImages = data.getAll("oldImages") as string[];
        const newFiles = data.getAll("images") as File[];

        let newImages: string[] = [];
        if (newFiles.length > 0) {
          const uploadForm = new FormData();
          newFiles.forEach((file) => uploadForm.append("files", file));
          const uploadRes = await uploadMedia(uploadForm);
          newImages = uploadRes.data as string[];
        }

        const allImages = [...oldImages, ...newImages];
        const dataPost = {
          name: data.get("name") as string,
          description: (data.get("description") as string) || "",
          price: Number(data.get("price")),
          deal: Number(data.get("deal")),
          stock: Number(data.get("stock")),
          images: allImages,
          category: data.get("category") as string,
          isActive: (data.get("isActive") as string) === "true",
          specifications,
          variants,
          details,
          guide,
          warnings,
        };
        console.log("Updating product with data:", dataPost);
        const res = await updateProduct(id, dataPost);
        if (res.success) toast.success("Cập nhật thành công 🎉");
        else toast.error("Cập nhật thất bại ❌");
      }

      setIsModalOpen(false);
      fetchProduct();
    } catch (err: any) {
      toast.error(err.message || "Lỗi thao tác sản phẩm");
    }
  };

  // delete
  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success("Xóa sản phẩm thành công 🎉");
        fetchProduct();
      } else {
        toast.error(res.message || "Xóa thất bại ❌");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa sản phẩm");
    }
  };

return (
  <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
        Quản lý sản phẩm
      </h1>
    </div>

    {/* Search & Button */}
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 sm:mb-8 gap-4">
      {/* Ô tìm kiếm */}
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-full sm:w-72 border border-gray-300 rounded-xl 
                     focus:ring-2 focus:ring-[#3B6E5F] focus:border-[#4A7A57] 
                     outline-none shadow-sm bg-white text-base"
        />
      </div>

      {/* Nút tạo */}
      <button
        onClick={() => {
          setModalMode("create");
          setIsModalOpen(true);
        }}
        className="flex items-center justify-center gap-2 bg-[#3B6E5F]
                   hover:bg-[#4A7A57]
                   text-[#F4FAF4] px-4 sm:px-5 py-2 sm:py-2.5 
                   rounded-xl shadow-md hover:shadow-lg transition text-base font-medium w-full sm:w-auto"
      >
        <Plus className="w-5 h-5" /> <span>Tạo</span>
      </button>
    </div>

    {/* Table */}
    <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-100">
      <table className="w-full text-sm sm:text-base">
        <thead className="bg-[#4A7A57]">
          <tr className="text-[#F4FAF4]">
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-semibold">Tên</th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold hidden md:table-cell">
              Giá (₫)
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold hidden md:table-cell">
              Giảm giá (₫)
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold">Số lượng</th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold hidden lg:table-cell">
              Danh mục
            </th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold">Trạng thái</th>
            <th className="px-4 sm:px-6 py-3 sm:py-4 text-center font-semibold">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, idx) => (
            <tr
              key={p._id}
              className={`transition-all duration-200 ease-in-out ${
                idx % 2 === 0 ? "bg-[#E6F0E9]" : "bg-[#F4FAF4]"
              } hover:bg-blue-100/40 hover:shadow-sm`}
            >
              <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 truncate max-w-[160px] sm:max-w-none">
                {p.name}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-center hidden md:table-cell">
                {p.price}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-center hidden md:table-cell">
                {p.deal}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">{p.stock}</td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-center hidden lg:table-cell">
                {p.category?.name}
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                <span
                  className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
                    p.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                <div className="flex justify-center gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      setModalMode("edit");
                      setEditingProduct(p);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Chỉnh sửa"
                  >
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setConfirmDeleteId(p._id);
                      setIsConfirmOpen(true);
                    }}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
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
      <div className="flex justify-center items-center mt-8 space-x-2 sm:space-x-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 sm:px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 
                     hover:bg-gray-300 transition text-sm sm:text-base"
        >
          Prev
        </button>
        <span className="px-3 sm:px-4 py-2 rounded-lg bg-gray-100 shadow-sm text-sm sm:text-base">
          {page}
        </span>
        <button
          disabled={page * limit >= total}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 sm:px-4 py-2 rounded-lg bg-gray-200 disabled:opacity-50 
                     hover:bg-gray-300 transition text-sm sm:text-base"
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
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 sm:w-96 transform transition duration-300">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Xác nhận xóa
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Bạn có chắc chắn muốn xóa sản phẩm này?
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsConfirmOpen(false);
                setConfirmDeleteId(null);
              }}
              className="px-4 sm:px-5 py-2 rounded-lg border border-gray-300 
                         text-gray-700 hover:bg-gray-100 transition text-sm sm:text-base"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                if (confirmDeleteId) handleDelete(confirmDeleteId);
                setIsConfirmOpen(false);
                setConfirmDeleteId(null);
              }}
              className="px-4 sm:px-5 py-2 rounded-lg bg-red-600 text-white font-semibold 
                         hover:bg-red-700 transition shadow-md text-sm sm:text-base"
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
