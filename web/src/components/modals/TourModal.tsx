"use client";

import { Dialog } from "@headlessui/react";
import {
  useForm,
  useFieldArray,
  SubmitHandler,
  Resolver,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, PlusCircle, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
/* ================== SCHEMA ================== */
const tourSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Tên tour bắt buộc"),
  description: z.string().optional(),
  durationDays: z.number().min(1),
  durationNights: z.number().min(0),
  stayType: z.string().min(1),
  transportation: z.string().min(1),
  departurePoint: z.string().min(1),
  departureFrequency: z.string().optional(),

  itinerary: z.array(
    z.object({
      day: z.number(),
      title: z.string(),
      activities: z.array(
        z.object({
          timeFrom: z.string().optional(),
          timeTo: z.string().optional(),
          description: z.string(),
        })
      ),
    })
  ),

  priceOptions: z.array(
    z.object({
      name: z.string(),
      price: z.number().min(0),
      minPeople: z.number().optional(),
      maxPeople: z.number().optional(),
    })
  ),

  servicesIncluded: z.array(
    z.object({
      title: z.string(),
      // array of objects để dùng useFieldArray thoải mái
      details: z.array(z.object({ value: z.string() })),
    })
  ),
  servicesExcluded: z.array(
    z.object({
      title: z.string(),
      details: z.array(z.object({ value: z.string() })),
    })
  ),
  notes: z.array(
    z.object({
      title: z.string(),
      details: z.array(z.object({ value: z.string() })),
    })
  ),

  images: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export type TourFormData = z.infer<typeof tourSchema>;

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: Partial<TourFormData>;
  onClose: () => void;
  onSubmit: (data: TourFormData) => void;
};

/* ================== MAIN MODAL ================== */
export default function TourModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
}: Props) {
  const methods = useForm<TourFormData>({
    resolver: zodResolver(tourSchema) as unknown as Resolver<TourFormData>,
    defaultValues: initialData || {
      itinerary: [],
      priceOptions: [],
      servicesIncluded: [],
      servicesExcluded: [],
      notes: [],
      images: [],
      isActive: true,
    },
  });

  // Upload ảnh
  const handleUploadImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setNewImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
    setCurrentImgIndex(previewImages.length + files.length - 1);
  };

  // Xóa ảnh
  const removeImage = (url: string) => {
    setPreviewImages((prev) => prev.filter((img) => img !== url));
    setNewImages((prev) => prev.filter((file) => URL.createObjectURL(file) !== url));
    setCurrentImgIndex((prev) => Math.max(0, prev - 1));
  };

  // Next / Prev
  const nextImage = () => {
    if (previewImages.length > 0) setCurrentImgIndex((prev) => (prev + 1) % previewImages.length);
  };
  const prevImage = () => {
    if (previewImages.length > 0) setCurrentImgIndex((prev) => (prev - 1 + previewImages.length) % previewImages.length);
  };

  const [previewImages, setPreviewImages] = useState<string[]>(initialData?.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Reset form khi initialData thay đổi (edit mode)
  useEffect(() => {
    if (initialData) {
      methods.reset({
        ...initialData,
        itinerary: initialData.itinerary || [],
        priceOptions: initialData.priceOptions || [],
        servicesIncluded: initialData.servicesIncluded || [],
        servicesExcluded: initialData.servicesExcluded || [],
        notes: initialData.notes || [],
        images: initialData.images || [],
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData, methods]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  const {
    fields: itineraryFields,
    append: addItinerary,
    remove: removeItinerary,
  } = useFieldArray({ control, name: "itinerary" });

  const {
    fields: priceFields,
    append: addPriceOption,
    remove: removePriceOption,
  } = useFieldArray({ control, name: "priceOptions" });

  const submitHandler: SubmitHandler<TourFormData> = (data) => {
    // chuyển ảnh mới sang string hoặc file
    const formData = { ...data, images: previewImages };
    onSubmit(formData);
    reset();
    setPreviewImages([]);
    setNewImages([]);
    setCurrentImgIndex(0);
    reset(); // Đóng modal sau khi submit
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-6xl p-0 overflow-hidden border border-gray-200/70 ring-1 ring-black/5 flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b ">
            <Dialog.Title className="text-xl md:text-2xl font-semibold text-[#3B6E5F] tracking-tight">
              {mode === "create" ? "Tạo Tour Mới" : "Chỉnh Sửa Tour"}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="hover:bg-emerald-100/70 p-2 rounded-full transition border border-transparent hover:border-emerald-200"
              aria-label="Đóng"
            >
              <X className="w-5 h-5 text-emerald-700" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(submitHandler)} className="space-y-8 p-6">
                {/* === PHẦN 1: THÔNG TIN CƠ BẢN === */}
                <section className="rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="px-6 py-4 border-b rounded-t-2xl bg-gradient-to-r from-white to-gray-50">
                    <h3 className="text-base md:text-lg font-semibold text-emerald-700">📋 Thông tin cơ bản</h3>
                    <p className="text-xs text-gray-500 mt-1">Nhập thông tin chung của tour</p>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Mã tour" {...register("code")} />
                    <Input
                      label="Tên tour *"
                      {...register("name")}
                      error={errors.name?.message}
                    />
                    <Input type="number" label="Số ngày" {...register("durationDays", { valueAsNumber: true })} />
                    <Input type="number" label="Số đêm" {...register("durationNights", { valueAsNumber: true })} />
                    <Input label="Loại lưu trú" {...register("stayType")} />
                    <Input label="Phương tiện" {...register("transportation")} />
                    <Input label="Điểm khởi hành" {...register("departurePoint")} />
                    <Input label="Tần suất" {...register("departureFrequency")} />
                    <div className="col-span-1 md:col-span-2 flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">Mô tả tour</label>
                      <textarea
                        {...register("description")}
                        rows={4}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 bg-white placeholder:text-gray-400 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-400/30 outline-none transition"
                        placeholder="Nhập mô tả tour"
                      />
                    </div>
                  </div>
                </section>

                {/* === PHẦN 2: LỊCH TRÌNH === */}
                <section className="rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="px-6 py-4 border-b rounded-t-2xl bg-gradient-to-r from-white to-gray-50">
                    <h3 className="text-base md:text-lg font-semibold text-emerald-700">📅 Lịch trình</h3>
                    <p className="text-xs text-gray-500 mt-1">Mỗi ngày gồm tiêu đề và danh sách hoạt động</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {itineraryFields.map((field, i) => (
                      <ItineraryDay key={field.id} index={i} removeDay={() => removeItinerary(i)} />
                    ))}
                    <div className="pt-1">
                      <ButtonAdd
                        onClick={() =>
                          addItinerary({ day: itineraryFields.length + 1, title: "", activities: [] })
                        }
                        label="Thêm ngày"
                      />
                    </div>
                  </div>
                </section>

                {/* === PHẦN 3: GIÁ TOUR === */}
                <section className="rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="px-6 py-4 border-b rounded-t-2xl bg-gradient-to-r from-white to-gray-50">
                    <h3 className="text-base md:text-lg font-semibold text-emerald-700">💰 Giá tour</h3>
                    <p className="text-xs text-gray-500 mt-1">Khai báo mức giá theo đối tượng</p>
                  </div>
                  <div className="p-6 space-y-3">
                    {priceFields.map((field, i) => (
                      <div
                        key={field.id}
                        className="rounded-xl p-3 bg-white border border-gray-200/80 flex flex-col md:flex-row md:items-center gap-2 shadow-sm"
                      >
                        <Input placeholder="Tên (Người lớn...)" {...register(`priceOptions.${i}.name`)} />
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Giá"
                            {...register(`priceOptions.${i}.price`, { valueAsNumber: true })}
                            className="w-44"
                          />
                          <button
                            type="button"
                            onClick={() => removePriceOption(i)}
                            className="text-red-500 hover:text-red-600 rounded-lg p-2 hover:bg-red-50"
                            title="Xóa giá"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="pt-1">
                      <ButtonAdd onClick={() => addPriceOption({ name: "", price: 0 })} label="Thêm giá" />
                    </div>
                  </div>
                </section>

                {/* === PHẦN 4: DỊCH VỤ & GHI CHÚ === */}
                <section className="rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="px-6 py-4 border-b rounded-t-2xl bg-gradient-to-r from-white to-gray-50">
                    <h3 className="text-base md:text-lg font-semibold text-emerald-700">🧩 Dịch vụ & Ghi chú</h3>
                    <p className="text-xs text-gray-500 mt-1">Nhóm tiêu đề và các chi tiết con</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <FieldGroupArray title="✅ Dịch vụ bao gồm" name="servicesIncluded" />
                    <FieldGroupArray title="❌ Dịch vụ không bao gồm" name="servicesExcluded" />
                    <FieldGroupArray title="ℹ️ Lưu ý" name="notes" />
                  </div>
                </section>

                {/* === PHẦN 5: ẢNH TOUR === */}
                <section className="rounded-2xl border border-gray-200/70 bg-white shadow-sm transition-shadow hover:shadow-md">
                  <div className="px-6 py-4 border-b rounded-t-2xl bg-gradient-to-r from-white to-gray-50">
                    <h3 className="text-base md:text-lg font-semibold text-emerald-700">🖼 Ảnh tour</h3>
                    <p className="text-xs text-gray-500 mt-1">Chọn ảnh để hiển thị cho tour</p>
                  </div>

                  <div className="p-6">
                    <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-2xl cursor-pointer bg-white shadow-sm hover:border-emerald-300 hover:bg-emerald-50/40 transition relative">
                      <span className="text-gray-600 font-medium">Nhấn để chọn ảnh</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUploadImages}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </label>

                    {previewImages.length > 0 && (
                      <>
                        <div className="mt-4 relative bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm flex items-center justify-center h-80 overflow-hidden border border-gray-200">
                          <Image
                            src={previewImages[currentImgIndex]}
                            alt="preview"
                            width={800}
                            height={800}
                            className="max-h-full max-w-full object-contain"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(previewImages[currentImgIndex])}
                            className="absolute top-3 right-3 bg-emerald-600 text-white p-2 rounded-full shadow hover:bg-emerald-700 transition"
                            title="Xóa ảnh này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {previewImages.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={prevImage}
                                className="absolute left-3 bg-white/95 p-2 rounded-full shadow ring-1 ring-gray-200 hover:bg-white transition"
                                title="Ảnh trước"
                              >
                                <ChevronLeft className="w-6 h-6 text-gray-700" />
                              </button>
                              <button
                                type="button"
                                onClick={nextImage}
                                className="absolute right-3 bg-white/95 p-2 rounded-full shadow ring-1 ring-gray-200 hover:bg-white transition"
                                title="Ảnh tiếp"
                              >
                                <ChevronRight className="w-6 h-6 text-gray-700" />
                              </button>
                            </>
                          )}
                        </div>

                        {previewImages.length > 1 && (
                          <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                            {previewImages.map((url, idx) => (
                              <button
                                key={url + idx}
                                type="button"
                                onClick={() => setCurrentImgIndex(idx)}
                                className={`relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl border transition 
                                  ${idx === currentImgIndex ? "ring-2 ring-emerald-500 border-emerald-300" : "border-gray-200 hover:border-emerald-300"}`}
                                title={`Ảnh ${idx + 1}`}
                              >
                                <Image
                                  src={url}
                                  alt={`thumb-${idx}`}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </section>

                {/* === SUBMIT BUTTON === */}
                <div className="flex justify-end gap-3 border-t pt-5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 text-white font-medium rounded-xl shadow hover:bg-emerald-700"
                  >
                    {mode === "create" ? "Tạo Tour" : "Cập nhật Tour"}
                  </button>
                </div>
              </form>
            </FormProvider>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

// Input đơn giản có label + error
function Input({ label, error, className = "", ...props }: any) {
  return (
    <div className="flex flex-col min-w-0">
      {label && <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        {...props}
        aria-invalid={!!error}
        className={`w-full border border-gray-300 rounded-xl px-3 py-2 bg-white placeholder:text-gray-400 
        focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-400/30 outline-none transition ${className}`}
      />
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
}

// Nút thêm mới
function ButtonAdd({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-emerald-700 text-sm font-medium hover:underline hover:text-emerald-800"
    >
      <PlusCircle className="w-4 h-4" /> {label}
    </button>
  );
}

/* ================== ItineraryDay ================== */
function ItineraryDay({ index, removeDay }: { index: number; removeDay: () => void }) {
  const { control, register } = useFormContext<TourFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `itinerary.${index}.activities` as const,
  });

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      {/* Day header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b bg-gray-50 rounded-t-2xl">
        <div className="flex items-center gap-3 w-full">
          <span className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-600 text-white text-sm font-semibold">
            {index + 1}
          </span>
          <div className="flex gap-2 flex-1">
            <input
              type="number"
              placeholder="Ngày"
              {...register(`itinerary.${index}.day`, { valueAsNumber: true })}
              className="w-24 border border-gray-300 rounded-xl px-2 py-2 bg-white focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-400/30 outline-none"
              title="Số ngày (1, 2, 3...)"
            />
            <input
              placeholder="Tiêu đề ngày"
              {...register(`itinerary.${index}.title`)}
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 bg-white focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-400/30 outline-none"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={removeDay}
          className="text-red-500 hover:text-red-600 rounded-lg p-2 hover:bg-red-50"
          title="Xóa ngày"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Activities timeline */}
      <div className="px-4 py-4">
        {fields.length === 0 && (
          <div className="text-sm text-gray-500 italic mb-2">Chưa có hoạt động nào. Thêm hoạt động bên dưới.</div>
        )}
        <div className="relative pl-4">
          <div className="absolute left-1 top-1 bottom-1 w-0.5 bg-emerald-100 rounded"></div>
          <div className="space-y-2">
            {fields.map((act, j) => (
              <div key={act.id} className="relative ml-3">
                <div className="absolute -left-3 top-3 w-2 h-2 rounded-full bg-emerald-500"></div>
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200/80 shadow-sm">
                  <input
                    type="time"
                    {...register(`itinerary.${index}.activities.${j}.timeFrom`)}
                    className="border border-gray-300 rounded-lg px-2 py-2 bg-white focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-400/30 outline-none"
                    title="Giờ"
                  />
                  <input
                    placeholder="Mô tả hoạt động"
                    {...register(`itinerary.${index}.activities.${j}.description`)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-400/30 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => remove(j)}
                    className="text-red-500 hover:text-red-600 rounded-lg p-2 hover:bg-red-50"
                    title="Xóa hoạt động"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3">
            <ButtonAdd onClick={() => append({ description: "" })} label="Thêm hoạt động" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================== FieldGroupArray ================== */
function FieldGroupArray({ title, name }: { title: string; name: "servicesIncluded" | "servicesExcluded" | "notes" }) {
  const { control, register } = useFormContext<TourFormData>();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>

      {fields.map((field, i) => (
        <div key={field.id} className="rounded-xl border bg-white shadow-sm">
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-b bg-gray-50 rounded-t-xl">
            <input
              placeholder="Tiêu đề"
              {...register(`${name}.${i}.title` as const)}
              className="border border-gray-300 rounded-lg px-3 py-2 flex-1 bg-white focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-400/30 outline-none"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-500 hover:text-red-600 rounded-lg p-2 hover:bg-red-50"
              title="Xóa mục"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="px-3 py-3">
            <DetailsArray name={`${name}.${i}.details` as const} />
          </div>
        </div>
      ))}

      <div className="pt-1">
        <ButtonAdd onClick={() => append({ title: "", details: [] })} label="Thêm mục" />
      </div>
    </div>
  );
}

/* ================== DetailsArray (nested) ================== */
function DetailsArray({
  name,
}: {
  name:
    | `servicesIncluded.${number}.details`
    | `servicesExcluded.${number}.details`
    | `notes.${number}.details`;
}) {
  const { control, register } = useFormContext<TourFormData>();
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">Chi tiết</div>
      <div className="relative pl-4">
        <div className="absolute left-1 top-2 bottom-2 w-0.5 bg-emerald-100 rounded"></div>
        <div className="space-y-2">
          {fields.map((detail, j) => (
            <div key={detail.id} className="relative ml-3">
              <div className="absolute -left-3 top-3 w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="flex items-center gap-2">
                <input
                  placeholder="Chi tiết"
                  {...register(`${name}.${j}.value` as const)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-400/30 outline-none"
                />
                <button
                  type="button"
                  onClick={() => remove(j)}
                  className="text-red-500 hover:text-red-600 rounded-lg p-2 hover:bg-red-50"
                  title="Xóa chi tiết"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <ButtonAdd onClick={() => append({ value: "" })} label="Thêm chi tiết" />
      </div>
    </div>
  );
}