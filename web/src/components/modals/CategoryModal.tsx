"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface Category {
  id?: string
  name: string
  isActive: boolean
}

interface CategoryModalProps {
  isOpen: boolean
  mode: "create" | "edit"
  initialData?: Category
  onClose: () => void
  onSubmit: (id: string | undefined, data: { name: string; isActive: boolean }) => Promise<void>
}

export default function CategoryModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<Category>({ name: "", isActive: true })
  const [showConfirm, setShowConfirm] = useState(false)

  // Khi mở modal edit thì đổ dữ liệu cũ vào form
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(initialData)
    } else if (mode === "create") {
      setFormData({ name: "", isActive: true })
    }
  }, [mode, initialData, isOpen])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(initialData?.id, formData)
      setFormData({ name: "", isActive: true })
      onClose()
    } catch (error) {
      console.error("Submit thất bại:", error)
    }
  }

  const handleClose = () => setShowConfirm(true)

  const confirmClose = () => {
    setFormData({ name: "", isActive: true })
    setShowConfirm(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <div
          className="bg-white p-7 rounded-2xl shadow-xl w-96 relative animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút X */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold mb-7 text-gray-800">
            {mode === "create" ? "Tạo mới danh mục" : "Chỉnh sửa danh mục"}
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tên
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                placeholder="Nhập tên danh mục..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Trạng thái
              </label>
              <select
                value={formData.isActive ? "active" : "inactive"}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.value === "active" })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng hoạt động</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {mode === "create" ? "Tạo" : "Lưu"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Panel xác nhận đóng */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-80 text-center animate-fadeIn">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Bạn có chắc muốn đóng không?
            </h3>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmClose}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
