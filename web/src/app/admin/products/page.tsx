"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductModal from "@/components/modals/ProductDetailModal";
import { createProduct, deleteProduct, getAllCategories, getProduct, updateProduct, uploadMedia } from "@/lib/api";
import { toast } from "react-toastify";
import ProductFormModal from "@/components/modals/ProductDetailModal";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  deal: number;
  stock: number;
  images: string[]
  category: { name: string, _id: string };
  isActive: boolean;
}
export interface Category {
  _id: string;
  name: string;
  isActive: boolean;
}

export default function ProductPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchProduct = async () => {
    try {
      const res = await getProduct(page, limit, search);
      if (res.success) {
        setProducts(res.data.data);
        setTotal(res.data.total);
      } else toast.error(res.message);
    } catch (err: any) {
      toast.error(err.message || "Lỗi lấy danh sách categories");
    }
  };
  useEffect(() => {
    fetchProduct();
  }, [page, search]);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      if (res.success) {
        console.log(res.data)
        setCategories(res.data);
      } else toast.error(res.message);
    } catch (err: any) {
      toast.error(err.message || "Lỗi lấy danh sách categories");
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateOrUpdate = async (id: string | undefined, data: FormData) => {
    try {
      if (modalMode === "create") {
        // 1. Upload ảnh mới
        const images = data.getAll("images") as File[];
        let uploadedImages: string[] = [];
        if (images.length > 0) {
          const uploadForm = new FormData();
          images.forEach((img) => uploadForm.append("files", img));
          const res = await uploadMedia(uploadForm);
          uploadedImages = res.data as string[];
        }

        // 2. Build dataPost
        const dataPost = {
          name: data.get("name") as string,
          description: (data.get("description") as string) || "",
          price: Number(data.get("price")),
          deal: Number(data.get("deal")),
          stock: Number(data.get("stock")),
          images: uploadedImages,
          category: data.get("category") as string,
          isActive: (data.get("isActive") as string) === "true",
        };

        const res = await createProduct(dataPost);
        if (res.success) toast.success("Tạo thành công 🎉");
        else toast.error("Tạo thất bại ❌");
      }
      else if (modalMode === "edit" && id) {
        // 1. Lấy ảnh cũ
        const oldImages = data.getAll("oldImages") as string[];

        // 2. Upload ảnh mới
        const newFiles = data.getAll("images") as File[];
        let newImages: string[] = [];
        if (newFiles.length > 0) {
          const uploadForm = new FormData();
          newFiles.forEach((file) => uploadForm.append("files", file));
          const uploadRes = await uploadMedia(uploadForm);
          newImages = uploadRes.data as string[];
        }
        // 3. Merge ảnh
        const allImages = [...oldImages, ...newImages];
        // 4. Build dataPost
        const dataPost = {
          name: data.get("name") as string,
          description: (data.get("description") as string) || "",
          price: Number(data.get("price")),
          deal: Number(data.get("deal")),
          stock: Number(data.get("stock")),
          images: allImages,
          category: data.get("category") as string,
          isActive: (data.get("isActive") as string) === "true",
        };

        const res = await updateProduct(id, dataPost);
        if (res.success) toast.success("Cập nhật thành công 🎉");
        else toast.error("Cập nhật thất bại ❌");
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Lỗi thao tác category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    try {
      const res = await deleteProduct(id);
      if (res.success) {
        toast.success("Xóa category thành công 🎉");
        fetchCategories();
      } else {
        toast.error(res.message || "Xóa thất bại ❌");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa category");
    }
    fetchProduct()
  };

  return (
    <div className="p-6">
      {/* Header actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
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
            + Tao
          </button>
        </div>
      </div>

      {/* Product table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Tên</th>
              <th className="p-3 text-center">Giá (₫)</th>
              <th className="p-3 text-center">Giam gia (₫)</th>
              <th className="p-3 text-center">Số lượng</th>
              <th className="p-3 text-center">Danh mục</th>
              <th className="p-3 text-center">Trạng thái</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{p.name}</td>
                <td className="p-3 text-center">{p.price}</td>
                <td className="p-3 text-center">{p.deal}</td>
                <td className="p-3 text-center">{p.stock}</td>
                <td className="p-3 text-center">{p.category?.name}</td>
                <td className="p-3 text-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                  >
                    {p.isActive ? "Hoạt động" : "Ngưng"}
                  </span>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => { setModalMode("edit"); setEditingProduct(p); setIsModalOpen(true); }}
                    className="px-3 py-1 text-sm text-white bg-yellow-500 rounded-lg hover:bg-yellow-600"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => { setConfirmDeleteId(p._id); setIsConfirmOpen(true); }}
                    className="px-3 py-1 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
      <ProductFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        categories={categories}
        initialData={editingProduct} // khi sửa
      />


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
