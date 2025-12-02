'use client';

import { DataTable } from '@/components/data-table';
import { DeleteAlertDialog } from '@/components/modals/delete-alert-dialog';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { columns } from './columns';
import { LocationModal } from '@/components/modals/location-modal';
import { deleteLocation, getAllLocations } from '@/lib/api';

export default function LocationsPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  const { data: locations = [], refetch } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getAllLocations().then(res => res.data),
  });

  const handleCreate = () => {
    setCreateModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setEditModalOpen(true);
  };

  const handleDelete = (location: Location) => {
    setSelectedLocation(location);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLocation) return;

    const res = await deleteLocation(selectedLocation._id);

    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      refetch();
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">Quản lý địa điểm</h1>

      <DataTable
        columns={columns}
        data={locations as Location[]}
        searchKey="name"
        searchPlaceholder="Tìm kiếm theo tên..."
        createButton={{
          label: 'Tạo địa điểm mới',
          onClick: handleCreate,
        }}
        meta={{
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
      />

      {/* Create Modal */}
      <LocationModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSuccess={() => refetch()}
      />

      {/* Edit Modal */}
      <LocationModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        location={selectedLocation}
        onSuccess={() => refetch()}
      />

      {/* Delete Dialog */}
      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa danh mục?"
        description={`Bạn có chắc chắn muốn xóa danh mục "${selectedLocation?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
