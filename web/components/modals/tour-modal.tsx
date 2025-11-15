'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import MDEditor from '@uiw/react-md-editor';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import {
  DropzoneInputProps,
  DropzoneRootProps,
  useDropzone,
} from 'react-dropzone';
import { Step, Stepper } from 'react-form-stepper';
import {
  FieldArrayWithId,
  useFieldArray,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import { z } from 'zod';

const tourSchema = z.object({
  name: z.string().min(1, 'Tên tour là bắt buộc'),
  description: z.string().optional(),
  durationDays: z.number().min(1, 'Ít nhất 1 ngày'),
  durationNights: z.number().min(0, 'Số đêm phải >= 0'),
  stayType: z.string().min(1, 'Loại lưu trú là bắt buộc'),
  transportation: z.string().min(1, 'Phương tiện là bắt buộc'),
  departurePoint: z.string().min(1, 'Điểm xuất phát là bắt buộc'),
  departureFrequency: z.string().optional(),
  targetAudience: z.string().optional(),
  isActive: z.boolean(),
  itinerary: z
    .array(
      z.object({
        day: z.number(),
        title: z.string(),
        activities: z.array(
          z.object({
            timeFrom: z.string().optional(),
            timeTo: z.string().optional(),
            description: z.string(),
          }),
        ),
      }),
    )
    .optional(),
  priceOptions: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
        minPeople: z.number().optional(),
        maxPeople: z.number().optional(),
      }),
    )
    .optional(),
  servicesIncluded: z
    .array(
      z.object({
        title: z.string(),
        details: z.array(z.object({ value: z.string() })),
      }),
    )
    .optional(),
  servicesExcluded: z
    .array(
      z.object({
        title: z.string(),
        details: z.array(z.object({ value: z.string() })),
      }),
    )
    .optional(),
  notes: z
    .array(
      z.object({
        title: z.string(),
        details: z.array(z.object({ value: z.string() })),
      }),
    )
    .optional(),
});

type TourFormValues = z.infer<typeof tourSchema>;

interface TourFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: Tour;
  onSubmit: (data: FormData) => void;
}

export default function TourFormModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
}: TourFormModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [oldImages, setOldImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      name: '',
      description: '',
      durationDays: 1,
      durationNights: 0,
      stayType: '',
      transportation: '',
      departurePoint: '',
      departureFrequency: '',
      targetAudience: '',
      isActive: true,
      itinerary: [],
      priceOptions: [],
      servicesIncluded: [],
      servicesExcluded: [],
      notes: [],
    },
  });

  const {
    fields: itineraryFields,
    append: appendItinerary,
    remove: removeItinerary,
  } = useFieldArray({ control: form.control, name: 'itinerary' });

  const {
    fields: priceFields,
    append: appendPrice,
    remove: removePrice,
  } = useFieldArray({ control: form.control, name: 'priceOptions' });

  const {
    fields: includedFields,
    append: appendIncluded,
    remove: removeIncluded,
  } = useFieldArray({ control: form.control, name: 'servicesIncluded' });

  const {
    fields: excludedFields,
    append: appendExcluded,
    remove: removeExcluded,
  } = useFieldArray({ control: form.control, name: 'servicesExcluded' });

  const {
    fields: noteFields,
    append: appendNote,
    remove: removeNote,
  } = useFieldArray({ control: form.control, name: 'notes' });

  // Load initial data
  useEffect(() => {
    if (isOpen && initialData && mode === 'edit') {
      form.reset({
        name: initialData.name,
        description: initialData.description || '',
        durationDays: initialData.durationDays,
        durationNights: initialData.durationNights,
        stayType: initialData.stayType,
        transportation: initialData.transportation,
        departurePoint: initialData.departurePoint,
        departureFrequency: initialData.departureFrequency || '',
        targetAudience: initialData.targetAudience || '',
        isActive: initialData.isActive,
        itinerary: initialData.itinerary || [],
        priceOptions: initialData.priceOptions || [],
        servicesIncluded: initialData.servicesIncluded || [],
        servicesExcluded: initialData.servicesExcluded || [],
        notes: initialData.notes || [],
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOldImages(initialData.images || []);
      setPreviewUrls(initialData.images || []);
      setNewImages([]);
      setCurrentStep(1);
    } else if (isOpen && mode === 'create') {
      form.reset();
      setOldImages([]);
      setPreviewUrls([]);
      setNewImages([]);
      setCurrentStep(1);
    }
  }, [isOpen, initialData, mode, form]);

  // Dropzone
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newObjectUrls = acceptedFiles.map(f => URL.createObjectURL(f));
      setNewImages(prev => [...prev, ...acceptedFiles]);
      setPreviewUrls(prev => [...prev, ...newObjectUrls]);
      setCurrentImageIndex(previewUrls.length + newObjectUrls.length - 1);
    },
    [previewUrls.length],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 10,
  });

  const removeImage = (index: number) => {
    const oldCount = oldImages.length;
    if (index < oldCount) {
      setOldImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setNewImages(prev => prev.filter((_, i) => i !== index - oldCount));
    }
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setCurrentImageIndex(prev =>
      Math.max(0, Math.min(prev, previewUrls.length - 2)),
    );
  };

  // Handle submit
  const handleFormSubmit = (values: TourFormValues) => {
    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('description', values.description || '');
    formData.append('durationDays', String(values.durationDays));
    formData.append('durationNights', String(values.durationNights));
    formData.append('stayType', values.stayType);
    formData.append('transportation', values.transportation);
    formData.append('departurePoint', values.departurePoint);
    formData.append('departureFrequency', values.departureFrequency || '');
    formData.append('targetAudience', values.targetAudience || '');
    formData.append('isActive', String(values.isActive));

    formData.append('itinerary', JSON.stringify(values.itinerary || []));
    formData.append('priceOptions', JSON.stringify(values.priceOptions || []));
    formData.append(
      'servicesIncluded',
      JSON.stringify(values.servicesIncluded || []),
    );
    formData.append(
      'servicesExcluded',
      JSON.stringify(values.servicesExcluded || []),
    );
    formData.append('notes', JSON.stringify(values.notes || []));

    oldImages.forEach(img => formData.append('oldImages', img));
    newImages.forEach(file => formData.append('images', file));

    if (initialData?._id) {
      formData.append('_id', initialData._id);
    }

    onSubmit(formData);
  };

  const canGoNext = () => {
    if (currentStep === 1) {
      const values = form.getValues();
      return (
        values.name &&
        values.durationDays > 0 &&
        values.stayType &&
        values.transportation &&
        values.departurePoint
      );
    }
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === 'edit' ? 'Chỉnh sửa tour' : 'Tạo tour mới'}
          </DialogTitle>
          <DialogDescription>
            Điền thông tin tour, thêm ảnh và lịch trình chi tiết
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="mb-6">
          <Stepper activeStep={currentStep - 1}>
            <Step label="Thông tin" />
            <Step label="Hình ảnh" />
            <Step label="Lịch trình" />
          </Stepper>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            {/* Step 1: Basic Info */}
            {currentStep === 1 && <Step1BasicInfo form={form} />}

            {/* Step 2: Images */}
            {currentStep === 2 && (
              <Step2Images
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                isDragActive={isDragActive}
                previewUrls={previewUrls}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
                removeImage={removeImage}
              />
            )}

            {/* Step 3: Itinerary & Services */}
            {currentStep === 3 && (
              <Step3Itinerary
                form={form}
                itineraryFields={itineraryFields}
                appendItinerary={appendItinerary}
                removeItinerary={removeItinerary}
                priceFields={priceFields}
                appendPrice={appendPrice}
                removePrice={removePrice}
                includedFields={includedFields}
                appendIncluded={appendIncluded}
                removeIncluded={removeIncluded}
                excludedFields={excludedFields}
                appendExcluded={appendExcluded}
                removeExcluded={removeExcluded}
                noteFields={noteFields}
                appendNote={appendNote}
                removeNote={removeNote}
              />
            )}

            <DialogFooter className="mt-8 gap-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  disabled={form.formState.isSubmitting}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    setCurrentStep(prev => prev + 1);
                  }}
                  disabled={!canGoNext() || form.formState.isSubmitting}
                >
                  Tiếp tục
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? 'Đang xử lý...'
                    : mode === 'edit'
                      ? 'Cập nhật tour'
                      : 'Tạo tour'}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Step 1 Component
function Step1BasicInfo({ form }: { form: UseFormReturn<TourFormValues> }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên tour *</FormLabel>
              <FormControl>
                <Input placeholder="VD: Tour Đà Lạt 3N2Đ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-y-0 space-x-3 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Tour đang hoạt động</FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mô tả</FormLabel>
            <FormControl>
              <div data-color-mode="light">
                <MDEditor
                  value={field.value || ''}
                  onChange={value => field.onChange(value || '')}
                  preview="edit"
                  height={200}
                  visibleDragbar={false}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <FormField
          control={form.control}
          name="durationDays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số ngày *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="durationNights"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số đêm *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stayType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại lưu trú *</FormLabel>
              <FormControl>
                <Input placeholder="VD: Khách sạn 3*" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transportation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phương tiện *</FormLabel>
              <FormControl>
                <Input placeholder="VD: Xe khách" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FormField
          control={form.control}
          name="departurePoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Điểm xuất phát *</FormLabel>
              <FormControl>
                <Input placeholder="VD: TP. HCM" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departureFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tần suất khởi hành</FormLabel>
              <FormControl>
                <Input placeholder="VD: Hàng tuần" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="targetAudience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Đối tượng</FormLabel>
              <FormControl>
                <Input placeholder="VD: Gia đình, cặp đôi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

// Step 2 Component
function Step2Images({
  getRootProps,
  getInputProps,
  isDragActive,
  previewUrls,
  currentImageIndex,
  setCurrentImageIndex,
  removeImage,
}: {
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
  previewUrls: string[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  removeImage: (index: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary',
        )}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            'mb-4 h-12 w-12',
            isDragActive ? 'text-primary' : 'text-muted-foreground',
          )}
        />
        <p className="text-center text-lg font-medium">
          {isDragActive
            ? 'Thả ảnh vào đây...'
            : 'Kéo/thả hoặc click để chọn ảnh'}
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          PNG, JPG, WEBP (tối đa 10 ảnh)
        </p>
      </div>

      {previewUrls.length > 0 && (
        <div className="relative">
          <Image
            src={previewUrls[currentImageIndex]}
            alt="Preview"
            width={800}
            height={400}
            className="h-96 w-full rounded-lg border object-cover"
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <span className="rounded-full bg-black/70 px-4 py-2 text-sm text-white">
              {currentImageIndex + 1}/{previewUrls.length}
            </span>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={() => removeImage(currentImageIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {previewUrls.length > 1 && (
            <>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute top-1/2 left-4 -translate-y-1/2"
                onClick={() =>
                  setCurrentImageIndex(
                    (currentImageIndex - 1 + previewUrls.length) %
                      previewUrls.length,
                  )
                }
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute top-1/2 right-4 -translate-y-1/2"
                onClick={() =>
                  setCurrentImageIndex(
                    (currentImageIndex + 1) % previewUrls.length,
                  )
                }
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      )}

      {previewUrls.length === 0 && (
        <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          Chưa có ảnh nào được chọn
        </div>
      )}
    </div>
  );
}

// Step 3 Component
function Step3Itinerary({
  form,
  itineraryFields,
  appendItinerary,
  removeItinerary,
  priceFields,
  appendPrice,
  removePrice,
  includedFields,
  appendIncluded,
  removeIncluded,
  excludedFields,
  appendExcluded,
  removeExcluded,
  noteFields,
  appendNote,
  removeNote,
}: {
  form: UseFormReturn<TourFormValues>;
  itineraryFields: FieldArrayWithId<TourFormValues, 'itinerary'>[];
  appendItinerary: UseFieldArrayAppend<TourFormValues, 'itinerary'>;
  removeItinerary: UseFieldArrayRemove;
  priceFields: FieldArrayWithId<TourFormValues, 'priceOptions'>[];
  appendPrice: UseFieldArrayAppend<TourFormValues, 'priceOptions'>;
  removePrice: UseFieldArrayRemove;
  includedFields: FieldArrayWithId<TourFormValues, 'servicesIncluded'>[];
  appendIncluded: UseFieldArrayAppend<TourFormValues, 'servicesIncluded'>;
  removeIncluded: UseFieldArrayRemove;
  excludedFields: FieldArrayWithId<TourFormValues, 'servicesExcluded'>[];
  appendExcluded: UseFieldArrayAppend<TourFormValues, 'servicesExcluded'>;
  removeExcluded: UseFieldArrayRemove;
  noteFields: FieldArrayWithId<TourFormValues, 'notes'>[];
  appendNote: UseFieldArrayAppend<TourFormValues, 'notes'>;
  removeNote: UseFieldArrayRemove;
}) {
  return (
    <div className="space-y-8">
      {/* Price Options */}
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bảng giá</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendPrice({ name: '', price: 0, minPeople: 0, maxPeople: 0 })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm
          </Button>
        </div>

        {priceFields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-5 gap-2">
            <Input
              placeholder="Tên (VD: Người lớn)"
              {...form.register(`priceOptions.${index}.name`)}
            />
            <Input
              type="number"
              placeholder="Giá"
              {...form.register(`priceOptions.${index}.price`, {
                valueAsNumber: true,
              })}
            />
            <Input
              type="number"
              placeholder="Min người"
              {...form.register(`priceOptions.${index}.minPeople`, {
                valueAsNumber: true,
              })}
            />
            <Input
              type="number"
              placeholder="Max người"
              {...form.register(`priceOptions.${index}.maxPeople`, {
                valueAsNumber: true,
              })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removePrice(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Itinerary */}
      <div className="space-y-4 rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Lịch trình</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendItinerary({
                day: itineraryFields.length + 1,
                title: '',
                activities: [],
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm ngày
          </Button>
        </div>

        {itineraryFields.map((field, index) => (
          <ItineraryDaySection
            key={field.id}
            form={form}
            dayIndex={index}
            onRemove={() => removeItinerary(index)}
          />
        ))}
      </div>

      {/* Services Included */}
      <ServiceSection
        title="Dịch vụ bao gồm"
        fields={includedFields}
        append={appendIncluded}
        remove={removeIncluded}
        form={form}
        fieldName="servicesIncluded"
      />

      {/* Services Excluded */}
      <ServiceSection
        title="Dịch vụ không bao gồm"
        fields={excludedFields}
        append={appendExcluded}
        remove={removeExcluded}
        form={form}
        fieldName="servicesExcluded"
      />

      {/* Notes */}
      <ServiceSection
        title="Ghi chú"
        fields={noteFields}
        append={appendNote}
        remove={removeNote}
        form={form}
        fieldName="notes"
      />
    </div>
  );
}

// Itinerary Day Section Component
function ItineraryDaySection({
  form,
  dayIndex,
  onRemove,
}: {
  form: UseFormReturn<TourFormValues>;
  dayIndex: number;
  onRemove: () => void;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `itinerary.${dayIndex}.activities`,
  });

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Ngày"
          className="w-20"
          {...form.register(`itinerary.${dayIndex}.day`, {
            valueAsNumber: true,
          })}
        />
        <Input
          placeholder="Tiêu đề (VD: Khám phá Đà Lạt)"
          {...form.register(`itinerary.${dayIndex}.title`)}
          className="flex-1"
        />
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="ml-6 space-y-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ timeFrom: '', timeTo: '', description: '' })}
        >
          <Plus className="mr-1 h-3 w-3" />
          Thêm hoạt động
        </Button>

        {fields.map((field, actIndex) => (
          <div key={field.id} className="space-y-2 rounded-md border p-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-medium">
                  Từ:
                </span>
                <TimePicker
                  value={form.watch(
                    `itinerary.${dayIndex}.activities.${actIndex}.timeFrom`,
                  )}
                  onChange={value =>
                    form.setValue(
                      `itinerary.${dayIndex}.activities.${actIndex}.timeFrom`,
                      value,
                    )
                  }
                  placeholder="00:00"
                  className="w-[130px]"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs font-medium">
                  Đến:
                </span>
                <TimePicker
                  value={form.watch(
                    `itinerary.${dayIndex}.activities.${actIndex}.timeTo`,
                  )}
                  onChange={value =>
                    form.setValue(
                      `itinerary.${dayIndex}.activities.${actIndex}.timeTo`,
                      value,
                    )
                  }
                  placeholder="00:00"
                  className="w-[130px]"
                />
              </div>
              <div className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(actIndex)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div data-color-mode="light">
              <MDEditor
                value={
                  form.watch(
                    `itinerary.${dayIndex}.activities.${actIndex}.description`,
                  ) || ''
                }
                onChange={value =>
                  form.setValue(
                    `itinerary.${dayIndex}.activities.${actIndex}.description`,
                    value || '',
                  )
                }
                preview="edit"
                height={150}
                visibleDragbar={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} // Service Section Component
function ServiceSection({
  title,
  fields,
  append,
  remove,
  form,
  fieldName,
}: {
  title: string;
  fields: FieldArrayWithId<
    TourFormValues,
    'servicesIncluded' | 'servicesExcluded' | 'notes'
  >[];
  append: UseFieldArrayAppend<
    TourFormValues,
    'servicesIncluded' | 'servicesExcluded' | 'notes'
  >;
  remove: UseFieldArrayRemove;
  form: UseFormReturn<TourFormValues>;
  fieldName: 'servicesIncluded' | 'servicesExcluded' | 'notes';
}) {
  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ title: '', details: [] })}
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm
        </Button>
      </div>

      {fields.map((field, index) => (
        <ServiceSectionItem
          key={field.id}
          form={form}
          sectionIndex={index}
          fieldName={fieldName}
          onRemove={() => remove(index)}
        />
      ))}
    </div>
  );
}

// Service Section Item Component
function ServiceSectionItem({
  form,
  sectionIndex,
  fieldName,
  onRemove,
}: {
  form: UseFormReturn<TourFormValues>;
  sectionIndex: number;
  fieldName: 'servicesIncluded' | 'servicesExcluded' | 'notes';
  onRemove: () => void;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `${fieldName}.${sectionIndex}.details` as
      | `servicesIncluded.${number}.details`
      | `servicesExcluded.${number}.details`
      | `notes.${number}.details`,
  });

  return (
    <div className="space-y-2 rounded-md border p-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Tiêu đề"
          {...form.register(
            `${fieldName}.${sectionIndex}.title` as
              | `servicesIncluded.${number}.title`
              | `servicesExcluded.${number}.title`
              | `notes.${number}.title`,
          )}
          className="flex-1"
        />
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="ml-4 space-y-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ value: '' })}
        >
          <Plus className="mr-1 h-3 w-3" />
          Thêm chi tiết
        </Button>

        {fields.map((field, detailIndex) => (
          <div key={field.id} className="flex gap-2">
            <span className="text-muted-foreground text-sm">•</span>
            <Input
              placeholder="Chi tiết"
              {...form.register(
                `${fieldName}.${sectionIndex}.details.${detailIndex}.value` as
                  | `servicesIncluded.${number}.details.${number}.value`
                  | `servicesExcluded.${number}.details.${number}.value`
                  | `notes.${number}.details.${number}.value`,
              )}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(detailIndex)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
