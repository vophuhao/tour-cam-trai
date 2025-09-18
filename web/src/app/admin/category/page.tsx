"use client";

import CategoryModal from "@/components/modals/CategoryModal";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Camping",
    isActive: true,
    createdAt: "2025-09-10",
    updatedAt: "2025-09-12",
  },
  {
    id: "2",
    name: "Hiking",
    isActive: false,
    createdAt: "2025-09-08",
    updatedAt: "2025-09-13",
  },
];

export default function CategoryPage() {
  const [search, setSearch] = useState("");
  const [categories] = useState<Category[]>(mockCategories);
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreate = (data: { name: string; isActive: boolean }) => {
    console.log("Tạo category:", data)
    setIsModalOpen(false)
  }
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Category Management</h1>

      </div>

      {/* Search */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:ring focus:ring-blue-200"
        />
        <button onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 ml-5 text-sm text-white px-4 py-0 rounded-lg shadow">
          + Tạo
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 font-semibold text-gray-700">Tên</th>
              <th className="p-3 font-semibold text-gray-700">Ngày tạo</th>
              <th className="p-3 font-semibold text-gray-700">Cập nhật lần cuối</th>
              <th className="p-3 font-semibold text-gray-700">Trạng thái</th>
              <th className="p-3 font-semibold text-gray-700 text-right ">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{cat.name}</td>

                  <td className="p-3">{cat.createdAt}</td>
                  <td className="p-3">{cat.updatedAt}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xm rounded-full ${cat.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700" 
                        }`}
                    >
                      {cat.isActive ? "Hoạt động" : "Ngừng hoạt động"}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => alert(`Edit ${cat.name}`)}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => alert(`Delete ${cat.name}`)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
       <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div> 
    
  );
}
