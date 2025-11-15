'use client';

import { DataTable } from '@/components/data-table';
import { DeleteAlertDialog } from '@/components/modals/delete-alert-dialog';
import TourFormModal from '@/components/modals/tour-modal';
import {
  createTour,
  deleteTour,
  getAllTours,
  updateTour,
  uploadMedia,
} from '@/lib/client-actions';
import { parseJsonField } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { columns } from './columns';

export default function TourPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);

  // Fetch tours with React Query
  const { data: tours = [], refetch: refetchTours } = useQuery({
    queryKey: ['tours'],
    queryFn: async () => getAllTours().then(res => res.data || []),
  });

  const handleCreate = () => {
    setSelectedTour(null);
    setCreateModalOpen(true);
  };

  const handleEdit = (tour: Tour) => {
    setSelectedTour(tour);
    setEditModalOpen(true);
  };

  const handleDelete = (tour: Tour) => {
    setSelectedTour(tour);
    setDeleteDialogOpen(true);
  };

  // Create or update handler
  const handleCreateOrUpdate = async (data: FormData) => {
    try {
      const oldImages = data.getAll('oldImages') as string[];
      const newFiles = data.getAll('images') as File[];

      let uploadedImages: string[] = [];
      if (newFiles.length > 0) {
        const uploadForm = new FormData();
        newFiles.forEach(file => uploadForm.append('files', file));
        const uploadRes = await uploadMedia(uploadForm);
        uploadedImages = uploadRes.data as string[];
      }

      const allImages = [...oldImages, ...uploadedImages];

      const payload: Record<string, unknown> = {
        name: data.get('name') as string,
        description: (data.get('description') as string) || '',
        durationDays: Number(data.get('durationDays')),
        durationNights: Number(data.get('durationNights')),
        stayType: data.get('stayType') as string,
        transportation: data.get('transportation') as string,
        departurePoint: data.get('departurePoint') as string,
        departureFrequency: (data.get('departureFrequency') as string) || '',
        targetAudience: (data.get('targetAudience') as string) || '',
        isActive: (data.get('isActive') as string) === 'true',
        images: allImages,
        itinerary: parseJsonField(data, 'itinerary'),
        priceOptions: parseJsonField(data, 'priceOptions'),
        servicesIncluded: parseJsonField(data, 'servicesIncluded'),
        servicesExcluded: parseJsonField(data, 'servicesExcluded'),
        notes: parseJsonField(data, 'notes'),
      };

      const tourId = data.get('_id') as string | null;

      if (tourId) {
        const res = await updateTour(
          tourId,
          payload as Parameters<typeof updateTour>[1],
        );
        if (res.success) {
          toast.success('Cập nhật tour thành công 🎉');
          refetchTours();
          setEditModalOpen(false);
        } else {
          toast.error(res.message || 'Cập nhật thất bại ❌');
        }
      } else {
        const res = await createTour(
          payload as Parameters<typeof createTour>[0],
        );
        if (res.success) {
          toast.success('Tạo tour thành công 🎉');
          refetchTours();
          setCreateModalOpen(false);
        } else {
          toast.error(res.message || 'Tạo tour thất bại ❌');
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Lỗi khi lưu tour';
      toast.error(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedTour?._id) return;

    const res = await deleteTour(selectedTour._id);

    if (!res.success) {
      toast.error(res.message || 'Không thể xóa tour');
    } else {
      toast.success(res.message || 'Đã xóa tour');
      refetchTours();
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-4 text-2xl font-bold">Quản lý Tour</h1>

      <DataTable
        columns={columns}
        data={tours}
        searchKey="name"
        searchPlaceholder="Tìm kiếm theo tên tour..."
        createButton={{
          label: 'Tạo tour',
          onClick: handleCreate,
        }}
        meta={{
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
      />

      {/* Create Modal */}
      <TourFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        onSubmit={handleCreateOrUpdate}
      />

      {/* Edit Modal */}
      <TourFormModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        mode="edit"
        onSubmit={handleCreateOrUpdate}
        initialData={selectedTour || undefined}
      />

      {/* Delete Dialog */}
      <DeleteAlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa tour?"
        description={`Bạn có chắc chắn muốn xóa tour "${selectedTour?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
