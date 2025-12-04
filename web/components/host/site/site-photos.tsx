"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon, Star } from "lucide-react";

import { toast } from "sonner";
import { uploadMedia } from "@/lib/client-actions";

interface SitePhotosProps {
  data: Array<{
    url: string;
    caption?: string;
    isPrimary: boolean;
  }>;
  onChange: (data: any) => void;
}

export function SitePhotos({ data, onChange }: SitePhotosProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "sites");

        const response = await uploadMedia(formData);
        return {
          url: response.data.url,
          caption: "",
          isPrimary: data.length === 0,
        };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      onChange([...data, ...uploadedPhotos]);
      toast.success(`Upload thành công ${uploadedPhotos.length} ảnh!`);
    } catch (error) {
      toast.error("Có lỗi khi upload ảnh");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = data.filter((_, i) => i !== index);
    if (data[index].isPrimary && newPhotos.length > 0) {
      newPhotos[0].isPrimary = true;
    }
    onChange(newPhotos);
  };

  const setPrimaryPhoto = (index: number) => {
    const newPhotos = data.map((photo, i) => ({
      ...photo,
      isPrimary: i === index,
    }));
    onChange(newPhotos);
  };

  const updateCaption = (index: number, caption: string) => {
    const newPhotos = [...data];
    newPhotos[index].caption = caption;
    onChange(newPhotos);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hình ảnh Site
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Thêm ít nhất 3 ảnh chất lượng cao về site này
        </p>
      </div>

      <div>
        <Label
          htmlFor="site-photo-upload"
          className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {uploading ? "Đang upload..." : "Click để chọn ảnh site"}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG lên đến 10MB mỗi ảnh</p>
          </div>
          <input
            id="site-photo-upload"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </Label>
      </div>

      {data.length > 0 && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              📸 Mẹo chụp ảnh site:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Chụp từ nhiều góc độ khác nhau</li>
              <li>Chụp vào ban ngày, ánh sáng tự nhiên</li>
              <li>Thể hiện kích thước và không gian site</li>
              <li>Chụp các tiện nghi nổi bật (lò lửa, bàn, view...)</li>
              <li>Tránh chụp khi có rác hoặc lộn xộn</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.map((photo, index) => (
              <Card key={index} className="relative group overflow-hidden">
                <div className="aspect-square relative">
                  <img
                    src={photo.url}
                    alt={photo.caption || `Site photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all">
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {photo.isPrimary && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" />
                      Ảnh chính
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2 bg-white">
                  <Input
                    type="text"
                    value={photo.caption || ""}
                    onChange={(e) => updateCaption(index, e.target.value)}
                    placeholder="Mô tả ảnh..."
                    className="text-sm"
                  />
                  {!photo.isPrimary && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setPrimaryPhoto(index)}
                      className="w-full text-xs"
                    >
                      <Star className="mr-1 h-3 w-3" />
                      Đặt làm ảnh chính
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="text-sm text-gray-600 text-center">
            Đã có {data.length} ảnh
            {data.length < 3 && (
              <span className="text-orange-600 ml-1">
                (Cần thêm {3 - data.length} ảnh nữa)
              </span>
            )}
          </div>
        </>
      )}

      {data.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Chưa có ảnh nào</p>
          <p className="text-xs text-gray-500">Upload ảnh để khách có thể hình dung site của bạn</p>
        </div>
      )}
    </div>
  );
}