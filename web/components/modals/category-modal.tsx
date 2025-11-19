'use client';

import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { createCategory, updateCategory } from '@/lib/client-actions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc').trim(),
  isActive: z.boolean(),
});

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSuccess?: () => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryModalProps) {
  const isEditing = !!category;

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      isActive: category?.isActive ?? true,
    },
  });

  const isLoading = form.formState.isSubmitting;

  // Reset form when category changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name || '',
        isActive: category?.isActive ?? true,
      });
    }
  }, [open, category, form]);

  async function onSubmit(values: z.infer<typeof categoryFormSchema>) {
    const res =
      isEditing && category
        ? await updateCategory(category._id, values)
        : await createCategory(values);

    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      onOpenChange(false);
      onSuccess?.();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Sửa danh mục' : 'Tạo danh mục mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Cập nhật thông tin danh mục'
              : 'Điền thông tin để tạo danh mục mới'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh mục</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên danh mục"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Trạng thái</FormLabel>
                    <div className="text-muted-foreground text-sm">
                      Danh mục có đang hoạt động không
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : isEditing ? 'Cập nhật' : 'Tạo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
