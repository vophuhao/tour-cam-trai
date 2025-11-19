'use client';

import { DataTable } from '@/components/data-table';
import { CategoryModal } from '@/components/modals/category-modal';
import { DeleteAlertDialog } from '@/components/modals/delete-alert-dialog';
import { deleteCategory, getAllCategories } from '@/lib/client-actions';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { columns } from './columns';

export default function CategoriesPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const { data: categories = [], refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getAllCategories().then(res => res.data),
  });

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setEditModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    const res = await deleteCategory(selectedCategory._id);

    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      refetch();
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">Quản lý danh mục</h1>

      <DataTable
        columns={columns}
        data={categories}
        searchKey="name"
        searchPlaceholder="Tìm kiếm theo tên..."
        createButton={{
          label: 'Tạo danh mục',
          onClick: handleCreate,
        }}
        meta={{
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
      />

      {/* Create Modal */}
      <CategoryModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => refetch()}
      />

      {/* Edit Modal */}
      <CategoryModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        category={selectedCategory}
        onSuccess={() => refetch()}
      />

      {/* Delete Dialog */}
      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa danh mục?"
        description={`Bạn có chắc chắn muốn xóa danh mục "${selectedCategory?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
