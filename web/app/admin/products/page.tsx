'use client';

import { DataTable } from '@/components/admin/data-table';
import { DeleteAlertDialog } from '@/components/modals/delete-alert-dialog';
import ProductModal from '@/components/modals/product-modal';
import {
  createProduct,
  deleteProduct,
  getAllCategories,
  getAllProduct,
  updateProduct,
  uploadMedia,
} from '@/lib/client-actions';
import { parseJsonField } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { columns } from './columns';

export default function ProductPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products with React Query
  const { data: products = [], refetch: refetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => getAllProduct().then(res => res.data),
  });

  // Fetch categories with React Query
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories().then(res => res.data),
  });

  const handleCreate = () => {
    setSelectedProduct(null);
    setCreateModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  // Create or update handler
  const handleCreateOrUpdate = async (
    id: string | undefined,
    data: FormData,
  ) => {
    const specifications = parseJsonField<ProductSpecification[]>(
      data,
      'specifications',
    );
    const variants = parseJsonField<ProductVariant[]>(data, 'variants');
    const details = parseJsonField<ProductDetailSection[]>(data, 'details');
    const guide = parseJsonField<string[]>(data, 'guide');
    const warnings = parseJsonField<string[]>(data, 'warnings');

    if (!id) {
      // CREATE MODE
      const images = data.getAll('images') as File[];
      let uploadedImages: string[] = [];

      if (images.length > 0) {
        const uploadForm = new FormData();
        images.forEach(img => uploadForm.append('files', img));
        const res = await uploadMedia(uploadForm);
        uploadedImages = res.data as string[];
      }

      const dataPost = {
        name: data.get('name') as string,
        description: (data.get('description') as string) || '',
        price: Number(data.get('price')),
        deal: Number(data.get('deal')) || 0,
        stock: Number(data.get('stock')),
        images: uploadedImages,
        category: data.get('category') as string,
        isActive: (data.get('isActive') as string) === 'true',
        specifications,
        variants,
        details,
        guide,
        warnings,
      };

      const res = await createProduct(dataPost);
      if (res.success) {
        toast.success('Tạo sản phẩm thành công 🎉');
        refetchProducts();
        setCreateModalOpen(false);
      } else {
        toast.error(res.message || 'Tạo sản phẩm thất bại ❌');
      }
    } else {
      // EDIT MODE
      const oldImages = data.getAll('oldImages') as string[];
      const newFiles = data.getAll('images') as File[];

      let newImages: string[] = [];
      if (newFiles.length > 0) {
        const uploadForm = new FormData();
        newFiles.forEach(file => uploadForm.append('files', file));
        const uploadRes = await uploadMedia(uploadForm);
        newImages = uploadRes.data as string[];
      }

      const allImages = [...oldImages, ...newImages];
      const dataPost = {
        name: data.get('name') as string,
        description: (data.get('description') as string) || '',
        price: Number(data.get('price')),
        deal: Number(data.get('deal')) || 0,
        stock: Number(data.get('stock')),
        images: allImages,
        category: data.get('category') as string,
        isActive: (data.get('isActive') as string) === 'true',
        specifications,
        variants,
        details,
        guide,
        warnings,
      };

      const res = await updateProduct(id, dataPost);
      if (res.success) {
        toast.success('Cập nhật thành công 🎉');
        refetchProducts();
        setEditModalOpen(false);
      } else {
        toast.error(res.message || 'Cập nhật thất bại ❌');
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;

    const res = await deleteProduct(selectedProduct._id);

    if (!res.success) {
      toast.error(res.message || 'Không thể xóa sản phẩm');
    } else {
      toast.success(res.message || 'Đã xóa sản phẩm');
      refetchProducts();
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">Quản lý sản phẩm</h1>

      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Tìm kiếm theo tên sản phẩm..."
        createButton={{
          label: 'Tạo sản phẩm',
          onClick: handleCreate,
        }}
        meta={{
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
      />

      {/* Create Modal */}
      <ProductModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        onSubmit={handleCreateOrUpdate}
        categories={categories}
      />

      {/* Edit Modal */}
      <ProductModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode="edit"
        onSubmit={handleCreateOrUpdate}
        categories={categories}
        initialData={selectedProduct || undefined}
      />

      {/* Delete Dialog */}
      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa sản phẩm?"
        description={`Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
