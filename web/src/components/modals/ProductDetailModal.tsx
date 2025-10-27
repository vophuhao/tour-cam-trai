"use client";

import { useEffect, useState } from "react";
import { X, Trash2, ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import Image from "next/image";

import {
  Product,
  ProductSpecification,
  ProductVariant,
  ProductDetailSection,
  Category,
} from "@/types/product";
interface ProductFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: Product;
  categories: Category[];
  onClose: () => void;
  onSubmit: (id: string | undefined, data: FormData) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  initialData,
  categories,
  onClose,
  onSubmit,
}) => {
  // ...existing code...
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    deal: 0,
    stock: 0,
    category: "",
    isActive: true,
    newImages: [] as File[], // files to upload
    specifications: [] as ProductSpecification[],
    variants: [] as ProductVariant[],
    details: [] as ProductDetailSection[], // follow server model
    guide: [] as string[],
    warnings: [] as string[],
  });

  // previews combines old image URLs (strings) + objectUrls for new files
  const [oldImages, setOldImages] = useState<string[]>([]); // server urls
  const [previewUrls, setPreviewUrls] = useState<string[]>([]); // combined preview urls
  const [fileObjectUrls, setFileObjectUrls] = useState<string[]>([]); // object URLs created for new files
  const [currentIndex, setCurrentIndex] = useState(0);

  // friendly labels cho variant (hiển thị tiếng Việt)
  const variantLabels: Record<string, string> = {
    size: "Kích thước",
    expandedSize: "Kích thước mở rộng",
    foldedSize: "Kích thước gấp",
    loadCapacity: "Tải trọng",
    weight: "Trọng lượng",
  };

  // Load dữ liệu edit (map server images into previews)
  useEffect(() => {
    if (initialData && mode === "edit") {
      setForm({
        name: initialData.name,
        description: initialData.description || "",
        price: initialData.price,
        deal: initialData.deal,
        stock: initialData.stock,
        category: initialData.category?._id || "",
        isActive: initialData.isActive,
        newImages: [],
        specifications: initialData.specifications || [],
        variants: initialData.variants || [],
        // map incoming details -> items with only `label` to match types
        details: (initialData.details || []).map((sec) => ({
          title: sec.title || "",
          items: (sec.items || []).map((it: any) => {
            // if server provided { label, value } we concatenate or prefer label
            const labelOnly =
              typeof it.label === "string" && it.label.trim() !== ""
                ? it.label
                : typeof it.value === "string"
                  ? it.value
                  : "";
            return { label: labelOnly };
          }),
        })) as ProductDetailSection[],
        guide: initialData.guide || [],
        warnings: initialData.warnings || [],
      });
      setOldImages(initialData.images || []);
      setPreviewUrls(initialData.images || []);
      setFileObjectUrls([]);
      setCurrentIndex(0);
    } else {
      setForm({
        name: "",
        description: "",
        price: 0,
        deal: 0,
        stock: 0,
        category: "",
        isActive: true,
        newImages: [],
        specifications: [],
        variants: [],
        details: [],
        guide: [],
        warnings: [],
      });
      setOldImages([]);
      setPreviewUrls([]);
      setFileObjectUrls([]);
      setCurrentIndex(0);
    }
  }, [initialData, mode]);

  // cleanup created object URLs on unmount / when they change
  useEffect(() => {
    return () => {
      fileObjectUrls.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Xử lý ảnh ===
  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    // tạo objectURL cho mỗi file mới
    const newObjectUrls = files.map((f) => URL.createObjectURL(f));

    // cập nhật state: files, objectUrls và preview (kết hợp oldImages + objectUrls)
    setForm((prev) => ({ ...prev, newImages: [...prev.newImages, ...files] }));
    setFileObjectUrls((prev) => {
      const merged = [...prev, ...newObjectUrls];
      return merged;
    });
    setPreviewUrls((prev) => {
      const merged = [...prev, ...newObjectUrls];
      // chuyển sang ảnh vừa thêm
      setCurrentIndex(merged.length - 1);
      return merged;
    });
  };

  // remove image by index to avoid mismatch of duplicate URLs
  const removeImageAt = (index: number) => {
    if (index < 0 || index >= previewUrls.length) return;

    // determine whether removed item is old image or newly created object url
    const oldCount = oldImages.length;
    const removedPreview = previewUrls[index];

    // update previewUrls
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));

    // if it's an old image (server url)
    if (index < oldCount) {
      setOldImages((prevOld) => prevOld.filter((_, i) => i !== index));
    } else {
      // it's one of newly uploaded files -> determine its index among new files
      const fileIndex = index - oldCount;
      setForm((prev) => {
        const newFiles = [...prev.newImages];
        if (fileIndex >= 0 && fileIndex < newFiles.length) {
          // revoke objectURL for that file
          const objectUrl = fileObjectUrls[fileIndex];
          if (objectUrl) {
            try {
              URL.revokeObjectURL(objectUrl);
            } catch { }
          }
          newFiles.splice(fileIndex, 1);
        }
        return { ...prev, newImages: newFiles };
      });
      setFileObjectUrls((prevUrls) => {
        const newUrls = [...prevUrls];
        const idx = index - oldCount;
        if (idx >= 0 && idx < newUrls.length) newUrls.splice(idx, 1);
        return newUrls;
      });
    }

    // adjust current index
    setCurrentIndex((prev) => {
      const newLen = Math.max(0, previewUrls.length - 1);
      if (newLen === 0) return 0;
      if (prev >= newLen) return newLen - 1;
      return prev;
    });
  };

  const removeCurrentImage = () => removeImageAt(currentIndex);

  const nextImage = () =>
    previewUrls.length > 0 &&
    setCurrentIndex((prev) => (prev + 1) % previewUrls.length);

  const prevImage = () =>
    previewUrls.length > 0 &&
    setCurrentIndex((prev) => (prev - 1 + previewUrls.length) % previewUrls.length);

  // === Thêm mới các mục con ===
  const addSpecification = () =>
    setForm((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { label: "", value: "" }],
    }));

  const removeSpecification = (index: number) =>
    setForm((prev) => {
      const newSpecs = [...prev.specifications];
      newSpecs.splice(index, 1);
      return { ...prev, specifications: newSpecs };
    });

  const clearSpecifications = () => {
    if (!confirm("Bạn có chắc muốn xóa tất cả thông số kỹ thuật không?")) return;
    setForm((prev) => ({ ...prev, specifications: [] }));
  };

  const addVariant = () =>
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { size: "", expandedSize: "", foldedSize: "", loadCapacity: "", weight: "" },
      ],
    }));

  // thêm biến thể với size cố định (ví dụ "M" hoặc "L")
  const addVariantWithSize = (size: string) =>
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { size, expandedSize: "", foldedSize: "", loadCapacity: "", weight: "" },
      ],
    }));



  const addGuide = () =>
    setForm((prev) => ({ ...prev, guide: [...prev.guide, ""] }));

  const addWarning = () =>
    setForm((prev) => ({ ...prev, warnings: [...prev.warnings, ""] }));

  // details helpers (match server model)
  const addDetailSection = () =>
    setForm((prev) => ({
      ...prev,
      details: [...prev.details, { title: "", items: [] }],
    }));

  const removeDetailSection = (sectionIndex: number) =>
    setForm((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== sectionIndex),
    }));

  const addDetailItem = (sectionIndex: number) =>
    setForm((prev) => {
      const newDetails = prev.details.map((section, i) =>
        i === sectionIndex
          ? { ...section, items: [...section.items, { label: "" }] }
          : section
      );
      return { ...prev, details: newDetails };
    });

  const removeDetailItem = (sectionIndex: number, itemIndex: number) =>
    setForm((prev) => {
      const newDetails = prev.details.map((section, i) =>
        i === sectionIndex
          ? {
            ...section,
            items: section.items.filter((_, j) => j !== itemIndex),
          }
          : section
      );
      return { ...prev, details: newDetails };
    });

  // === Submit ===
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = initialData?._id;
    const formData = new FormData();

    // append simple fields
    formData.append("name", form.name ?? "");
    formData.append("description", form.description ?? "");
    formData.append("price", String(form.price ?? 0));
    formData.append("deal", String(form.deal ?? 0));
    formData.append("stock", String(form.stock ?? 0));
    formData.append("category", form.category ?? "");
    formData.append("isActive", String(Boolean(form.isActive)));

    // append complex arrays as JSON so server can parse (details follow the model)
    formData.append("specifications", JSON.stringify(form.specifications || []));
    formData.append("variants", JSON.stringify(form.variants || []));
    formData.append("details", JSON.stringify(form.details || []));
    formData.append("guide", JSON.stringify(form.guide || []));
    formData.append("warnings", JSON.stringify(form.warnings || []));

    // keep old image urls so server knows which server images to keep
    oldImages.forEach((img) => formData.append("oldImages", img));

    // append new image files
    form.newImages.forEach((file) => formData.append("images", file));

    onSubmit(id, formData);
  };

  if (!isOpen) return null;

  // === JSX ===
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#2F6B56]">
              {mode === "edit" ? "Chỉnh sửa sản phẩm" : "Tạo sản phẩm mới"}
            </h2>
            <p className="text-sm text-gray-500">
              Điền thông tin sản phẩm và quản lý ảnh, biến thể, thông số kỹ thuật.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Đóng"
            >
              <X />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* THÔNG TIN & ẢNH */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <label className="block text-sm font-medium">Tên sản phẩm</label>
              <input
                placeholder="Nhập tên sản phẩm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 border rounded-xl"
              />

              <label className="block text-sm font-medium">Mô tả sản phẩm</label>
              <textarea
                placeholder="Mô tả ngắn về sản phẩm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 border rounded-xl h-28"
              />

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium">Giá (₫)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Giảm (%)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.deal}
                    onChange={(e) => setForm({ ...form, deal: Number(e.target.value) })}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Số lượng</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full p-3 border rounded-xl"
                  />
                </div>
              </div>

              <div className="items-center gap-3">
                <div className="w-1/2">
                  <label className="block text-sm font-medium">Danh mục</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full p-3 border rounded-xl"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 mt-5 ">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                    id="isActive"
                    className="h-4 w-4 "
                  />
                  <label htmlFor="isActive" className="text-sm">Hoạt động</label>
                </div>
              </div>
            </div>

            {/* Ảnh */}
            <div>
              <label className="block mb-2 font-semibold">Ảnh sản phẩm</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-4 cursor-pointer hover:border-[#3B6E5F]">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleUploadImage}
                  className="hidden"
                />
                <div className="text-center py-4">
                  <div className="text-gray-600 mb-1">Kéo/thả hoặc bấm để chọn ảnh</div>
                  <div className="text-xs text-gray-400">Hỗ trợ nhiều ảnh, tối đa kích thước 5MB / ảnh</div>
                </div>
              </label>

              {previewUrls.length > 0 && (
                <div className="relative mt-4">
                  <Image
                    src={previewUrls[currentIndex]}
                    alt={`Ảnh ${currentIndex + 1}`}
                    width={800}
                    height={480}
                    className="rounded-lg object-contain w-full h-56 bg-gray-50"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <span className="bg-white text-xs px-2 py-1 rounded-full">{currentIndex + 1}/{previewUrls.length}</span>
                    <button
                      type="button"
                      onClick={removeCurrentImage}
                      className="bg-red-600 text-white p-2 rounded-full"
                      title="Xóa ảnh"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {previewUrls.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full"
                        aria-label="Ảnh trước"
                      >
                        <ChevronLeft />
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full"
                        aria-label="Ảnh sau"
                      >
                        <ChevronRight />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* THÔNG SỐ KỸ THUẬT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Thông số kỹ thuật</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addSpecification}
                  className="flex items-center gap-1 text-sm text-[#3B6E5F]"
                >
                  <PlusCircle size={16} /> Thêm
                </button>
              </div>
            </div>

            {form.specifications.map((spec, i) => (
              <div key={i} className="flex gap-2 mt-2 items-center">
                <input
                  placeholder="Tên thông số"
                  value={spec.label}
                  onChange={(e) => {
                    const newSpecs = [...form.specifications];
                    newSpecs[i].label = e.target.value;
                    setForm({ ...form, specifications: newSpecs });
                  }}
                  className="flex-1 p-2 border rounded-lg"
                />
                <input
                  placeholder="Giá trị"
                  value={spec.value}
                  onChange={(e) => {
                    const newSpecs = [...form.specifications];
                    newSpecs[i].value = e.target.value;
                    setForm({ ...form, specifications: newSpecs });
                  }}
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeSpecification(i)}
                  className="text-red-600 ml-2 px-3 py-1 border rounded-md bg-white hover:bg-gray-50"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>

          {/* BIẾN THỂ SẢN PHẨM */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Biến thể (kích thước)</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => addVariantWithSize("M")}
                  className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 text-sm"
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => addVariantWithSize("L")}
                  className="px-3 py-1 border rounded-md bg-white hover:bg-gray-50 text-sm"
                >
                  L
                </button>

              </div>
            </div>

            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 mt-2 items-center">
                {/* Size hiển thị như badge (khóa nếu do nút M/L thêm vào) */}
                <div className="col-span-1">
                  <input
                    value={v.size}
                    onChange={(e) => {
                      const newVariants = [...form.variants];
                      newVariants[i].size = e.target.value;
                      setForm({ ...form, variants: newVariants });
                    }}
                    className="w-full p-2 border rounded-lg text-center"
                    placeholder="Kích thước (M/L)"
                  />
                </div>

                {/* Các trường còn lại giữ như trước */}
                <input
                  className="col-span-1 p-2 border rounded-lg"
                  placeholder={variantLabels.expandedSize}
                  value={v.expandedSize}
                  onChange={(e) => {
                    const newVariants = [...form.variants];
                    newVariants[i].expandedSize = e.target.value;
                    setForm({ ...form, variants: newVariants });
                  }}
                />
                <input
                  className="col-span-1 p-2 border rounded-lg"
                  placeholder={variantLabels.foldedSize}
                  value={v.foldedSize}
                  onChange={(e) => {
                    const newVariants = [...form.variants];
                    newVariants[i].foldedSize = e.target.value;
                    setForm({ ...form, variants: newVariants });
                  }}
                />
                <input
                  className="col-span-1 p-2 border rounded-lg"
                  placeholder={variantLabels.loadCapacity}
                  value={v.loadCapacity}
                  onChange={(e) => {
                    const newVariants = [...form.variants];
                    newVariants[i].loadCapacity = e.target.value;
                    setForm({ ...form, variants: newVariants });
                  }}
                />
                <input
                  className="col-span-1 p-2 border rounded-lg"
                  placeholder={variantLabels.weight}
                  value={v.weight}
                  onChange={(e) => {
                    const newVariants = [...form.variants];
                    newVariants[i].weight = e.target.value;
                    setForm({ ...form, variants: newVariants });
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => {
                      const newVariants = [...prev.variants];
                      newVariants.splice(i, 1);
                      return { ...prev, variants: newVariants };
                    })
                  }
                  className="text-red-600 ml-2"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>

          {/* CHI TIẾT (details) - phù hợp với model server */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Chi tiết sản phẩm</h3>
              <button
                type="button"
                onClick={addDetailSection}
                className="flex items-center gap-1 text-sm text-[#3B6E5F]"
              >
                <PlusCircle size={16} /> Thêm nhóm
              </button>
            </div>

            {form.details.map((section, si) => (
              <div key={si} className="border rounded-lg p-3 mb-2">
                <div className="flex items-center justify-between mb-2">
                  <input
                    placeholder="Tiêu đề nhóm (ví dụ: Thông số kỹ thuật)"
                    value={section.title}
                    onChange={(e) => {
                      const newDetails = [...form.details];
                      newDetails[si].title = e.target.value;
                      setForm({ ...form, details: newDetails });
                    }}
                    className="flex-1 p-2 border rounded-lg mr-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeDetailSection(si)}
                    className="text-sm text-red-600"
                  >
                    Xóa nhóm
                  </button>
                </div>

                {(section.items || []).map((item, ii) => (
                  <div key={ii} className="flex gap-2 mb-2">
                    <input
                      placeholder="Tên chi tiết"
                      value={item.label}
                      onChange={(e) => {
                        const newDetails = [...form.details];
                        newDetails[si].items[ii].label = e.target.value;
                        setForm({ ...form, details: newDetails });
                      }}
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeDetailItem(si, ii)}
                      className="text-red-600 p-2"
                    >
                      Xóa
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addDetailItem(si)}
                  className="text-sm text-[#3B6E5F]"
                >
                  + Thêm chi tiết
                </button>
              </div>
            ))}
          </div>

          {/* HƯỚNG DẪN & LƯU Ý */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Hướng dẫn sử dụng</h3>
              {form.guide.map((step, i) => (
                <input
                  key={i}
                  placeholder={`Bước ${i + 1}`}
                  value={step}
                  onChange={(e) => {
                    const guide = [...form.guide];
                    guide[i] = e.target.value;
                    setForm({ ...form, guide });
                  }}
                  className="w-full p-2 border rounded-lg mb-2"
                />
              ))}
              <button
                type="button"
                onClick={addGuide}
                className="text-sm text-[#3B6E5F]"
              >
                + Thêm bước
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Lưu ý</h3>
              {form.warnings.map((note, i) => (
                <input
                  key={i}
                  placeholder={`Lưu ý ${i + 1}`}
                  value={note}
                  onChange={(e) => {
                    const warnings = [...form.warnings];
                    warnings[i] = e.target.value;
                    setForm({ ...form, warnings });
                  }}
                  className="w-full p-2 border rounded-lg mb-2"
                />
              ))}
              <button
                type="button"
                onClick={addWarning}
                className="text-sm text-[#3B6E5F]"
              >
                + Thêm lưu ý
              </button>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#3B6E5F] text-white rounded-lg"
            >
              {mode === "edit" ? "Lưu thay đổi" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;