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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useDropzone } from 'react-dropzone';
import { useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá phải >= 0'),
  deal: z.number().min(0).max(100, 'Giảm giá từ 0-100%'),
  stock: z.number().min(0, 'Số lượng phải >= 0'),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  isActive: z.boolean(),
  specifications: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
  variants: z
    .array(
      z.object({
        size: z.string(),
        expandedSize: z.string(),
        foldedSize: z.string(),
        loadCapacity: z.string(),
        weight: z.string(),
      }),
    )
    .optional(),
  details: z
    .array(
      z.object({
        title: z.string(),
        items: z.array(z.object({ label: z.string() })),
      }),
    )
    .optional(),
  guide: z.array(z.object({ text: z.string() })).optional(),
  warnings: z.array(z.object({ text: z.string() })).optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: Product;
  categories: Category[];
  onSubmit: (id: string | undefined, data: FormData) => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  mode,
  initialData,
  categories,
  onSubmit,
}: ProductModalProps) {
  const [newImages, setNewImages] = useState<File[]>([]);
  const [oldImages, setOldImages] = useState<string[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      deal: 0,
      stock: 0,
      category: '',
      isActive: true,
      specifications: [],
      variants: [],
      details: [],
      guide: [],
      warnings: [],
    },
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control: form.control,
    name: 'specifications',
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control: form.control,
    name: 'variants',
  });

  const {
    fields: detailFields,
    append: appendDetail,
    remove: removeDetail,
  } = useFieldArray({
    control: form.control,
    name: 'details',
  });

  const {
    fields: guideFields,
    append: appendGuide,
    remove: removeGuide,
  } = useFieldArray({
    control: form.control,
    name: 'guide',
  });

  const {
    fields: warningFields,
    append: appendWarning,
    remove: removeWarning,
  } = useFieldArray({
    control: form.control,
    name: 'warnings',
  });

  // Load initial data
  useEffect(() => {
    if (isOpen && initialData && mode === 'edit') {
      form.reset({
        name: initialData.name,
        description: initialData.description || '',
        price: initialData.price,
        deal: initialData.deal || 0,
        stock: initialData.stock,
        category: initialData.category?._id || '',
        isActive: initialData.isActive,
        specifications: initialData.specifications || [],
        variants: initialData.variants || [],
        details: initialData.details || [],
        guide: (initialData.guide || []).map(text => ({ text })),
        warnings: (initialData.warnings || []).map(text => ({ text })),
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOldImages(initialData.images || []);
      setPreviewUrls(initialData.images || []);
      setNewImages([]);
    } else if (isOpen && mode === 'create') {
      form.reset({
        name: '',
        description: '',
        price: 0,
        deal: 0,
        stock: 0,
        category: '',
        isActive: true,
        specifications: [],
        variants: [],
        details: [],
        guide: [],
        warnings: [],
      });
      setOldImages([]);
      setPreviewUrls([]);
      setNewImages([]);
    }
  }, [isOpen, initialData, mode, form]);

  // Handle image upload with react-dropzone
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

  // Remove image
  const removeImage = (index: number) => {
    const oldCount = oldImages.length;

    if (index < oldCount) {
      setOldImages(prev => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - oldCount;
      setNewImages(prev => prev.filter((_, i) => i !== fileIndex));
    }

    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setCurrentImageIndex(prev =>
      Math.max(0, Math.min(prev, previewUrls.length - 2)),
    );
  };

  // Handle form submit
  const handleFormSubmit = (values: ProductFormValues) => {
    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('description', values.description || '');
    formData.append('price', String(values.price));
    formData.append('deal', String(values.deal));
    formData.append('stock', String(values.stock));
    formData.append('category', values.category);
    formData.append('isActive', String(values.isActive));

    formData.append(
      'specifications',
      JSON.stringify(values.specifications || []),
    );
    formData.append('variants', JSON.stringify(values.variants || []));
    formData.append('details', JSON.stringify(values.details || []));

    // Convert back to string[] when submitting
    formData.append(
      'guide',
      JSON.stringify((values.guide || []).map(item => item.text)),
    );
    formData.append(
      'warnings',
      JSON.stringify((values.warnings || []).map(item => item.text)),
    );

    oldImages.forEach(img => formData.append('oldImages', img));
    newImages.forEach(file => formData.append('images', file));

    onSubmit(initialData?._id, formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-7xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {mode === 'edit' ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            Điền thông tin sản phẩm và quản lý ảnh, biến thể, thông số kỹ thuật
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-8"
          >
            {/* Section 1: Basic Info + Images */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left: Form Fields */}
              <div className="space-y-4 lg:col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập tên sản phẩm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả sản phẩm"
                          className="h-28"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá (₫)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giảm giá (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số lượng</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={e =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Danh mục</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn danh mục" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat._id} value={cat._id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          <FormLabel>Hoạt động</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Right: Image Upload with Dropzone */}
              <div className="space-y-3">
                <span>Ảnh sản phẩm</span>
                <div
                  {...getRootProps()}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary',
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload
                    className={cn(
                      'mb-2 h-8 w-8',
                      isDragActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                  />
                  <p className="text-muted-foreground text-center text-sm">
                    {isDragActive
                      ? 'Thả ảnh vào đây...'
                      : 'Kéo/thả hoặc click để chọn ảnh'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    PNG, JPG, WEBP (tối đa 10 ảnh)
                  </p>
                </div>

                {previewUrls.length > 0 && (
                  <div className="relative">
                    <Image
                      src={previewUrls[currentImageIndex]}
                      alt="Preview"
                      width={400}
                      height={240}
                      className="h-64 w-full rounded-lg border object-cover"
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className="rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                        {currentImageIndex + 1}/{previewUrls.length}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-8 w-8"
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
                          className="absolute top-1/2 left-3 -translate-y-1/2"
                          onClick={() =>
                            setCurrentImageIndex(
                              (currentImageIndex - 1 + previewUrls.length) %
                                previewUrls.length,
                            )
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="absolute top-1/2 right-3 -translate-y-1/2"
                          onClick={() =>
                            setCurrentImageIndex(
                              (currentImageIndex + 1) % previewUrls.length,
                            )
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Specifications & Variants */}
            <div className="space-y-6 rounded-lg border p-6">
              <h2 className="text-xl font-semibold">
                Thông số kỹ thuật & Biến thể
              </h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Specifications */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Thông số kỹ thuật</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendSpec({ label: '', value: '' })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm
                    </Button>
                  </div>

                  {specFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <Input
                        placeholder="Tên thông số"
                        {...form.register(`specifications.${index}.label`)}
                      />
                      <Input
                        placeholder="Giá trị"
                        {...form.register(`specifications.${index}.value`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSpec(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Variants */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Biến thể</h3>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendVariant({
                            size: 'M',
                            expandedSize: '',
                            foldedSize: '',
                            loadCapacity: '',
                            weight: '',
                          })
                        }
                      >
                        M
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          appendVariant({
                            size: 'L',
                            expandedSize: '',
                            foldedSize: '',
                            loadCapacity: '',
                            weight: '',
                          })
                        }
                      >
                        L
                      </Button>
                    </div>
                  </div>

                  {variantFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-6 gap-2">
                      <Input
                        placeholder="Size"
                        {...form.register(`variants.${index}.size`)}
                      />
                      <Input
                        placeholder="Mở rộng"
                        {...form.register(`variants.${index}.expandedSize`)}
                      />
                      <Input
                        placeholder="Gấp"
                        {...form.register(`variants.${index}.foldedSize`)}
                      />
                      <Input
                        placeholder="Tải trọng"
                        {...form.register(`variants.${index}.loadCapacity`)}
                      />
                      <Input
                        placeholder="Trọng lượng"
                        {...form.register(`variants.${index}.weight`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeVariant(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 3: Details Sections */}
            <div className="space-y-4 rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Chi tiết sản phẩm</h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendDetail({ title: '', items: [] })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm phần
                </Button>
              </div>

              {detailFields.map((field, detailIndex) => (
                <div key={field.id} className="space-y-3 rounded-md border p-4">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Tiêu đề phần (VD: Thông tin chung)"
                      {...form.register(`details.${detailIndex}.title`)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDetail(detailIndex)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <DetailItemsArray form={form} detailIndex={detailIndex} />
                </div>
              ))}
            </div>

            {/* Section 4: Guide & Warnings */}
            <div className="rounded-lg border p-6">
              <h2 className="mb-6 text-xl font-semibold">Hướng dẫn & Lưu ý</h2>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Hướng dẫn sử dụng</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendGuide({ text: '' })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm
                    </Button>
                  </div>
                  {guideFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <span className="bg-muted flex h-10 w-8 items-center justify-center rounded-md text-sm font-medium">
                        {index + 1}
                      </span>
                      <Input
                        placeholder={`Bước ${index + 1}`}
                        {...form.register(`guide.${index}.text`)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeGuide(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Lưu ý quan trọng</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendWarning({ text: '' })}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm
                    </Button>
                  </div>
                  {warningFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <span className="bg-destructive/10 text-destructive flex h-10 w-8 items-center justify-center rounded-md text-sm font-medium">
                        !
                      </span>
                      <Input
                        placeholder={`Lưu ý ${index + 1}`}
                        {...form.register(`warnings.${index}.text`)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWarning(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={form.formState.isSubmitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? 'Đang xử lý...'
                  : mode === 'edit'
                    ? 'Cập nhật sản phẩm'
                    : 'Tạo sản phẩm'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DetailItemsArray({
  form,
  detailIndex,
}: {
  form: UseFormReturn<ProductFormValues>;
  detailIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `details.${detailIndex}.items`,
  });

  return (
    <div className="ml-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Các mục con:</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => append({ label: '' })}
        >
          <Plus className="mr-1 h-3 w-3" />
          Thêm mục
        </Button>
      </div>

      {fields.map((field, itemIndex) => (
        <div key={field.id} className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">•</span>
          <Input
            placeholder={`Mục ${itemIndex + 1}`}
            {...form.register(
              `details.${detailIndex}.items.${itemIndex}.label`,
            )}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(itemIndex)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
