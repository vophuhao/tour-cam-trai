'use client';

import { DataTable } from '@/components/admin/data-table';
import { DeleteAlertDialog } from '@/components/modals/delete-alert-dialog';
import { PropertyModal } from '@/components/modals/property-modal';
import { deleteProperty, getPropertiesForAdmin } from '@/lib/client-actions';
import { Property } from '@/types/property-site';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { columns } from './columns';

export default function PropertiesPage() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );

  const { data: properties = [], refetch } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: () => getPropertiesForAdmin().then(res => res.data || []),
  });

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setEditModalOpen(true);
  };

  const handleDelete = (property: Property) => {
    setSelectedProperty(property);
    setDeleteDialogOpen(true);
  };

  const handleViewSites = (property: Property) => {
    router.push(`/admin/properties/${property._id}/sites`);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProperty) return;

    const res = await deleteProperty(selectedProperty._id);

    if (!res.success) {
      toast.error(res.message || 'Xóa property thất bại');
    } else {
      toast.success(res.message || 'Xóa property thành công');
      refetch();
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Quản lý Properties</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý các property và sites của bạn
        </p>
      </div>

      <DataTable
        columns={columns}
        data={properties}
        searchKey="name"
        searchPlaceholder="Tìm kiếm property..."
        createButton={{
          label: 'Tạo Property',
          onClick: handleCreate,
        }}
        meta={{
          onEdit: handleEdit,
          onDelete: handleDelete,
          onViewSites: handleViewSites,
        }}
      />

      {/* Create Modal */}
      <PropertyModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => {
          refetch();
          setCreateModalOpen(false);
        }}
      />

      {/* Edit Modal */}
      <PropertyModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        property={selectedProperty}
        onSuccess={() => {
          refetch();
          setEditModalOpen(false);
        }}
      />

      {/* Delete Dialog */}
      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa property?"
        description={`Bạn có chắc chắn muốn xóa property "${selectedProperty?.name}"? Tất cả sites thuộc property này cũng sẽ bị xóa. Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
