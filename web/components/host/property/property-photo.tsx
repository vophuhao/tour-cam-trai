/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Image as ImageIcon, 
  Star,
  Upload
} from "lucide-react";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PropertyPhotosProps {
  data: File[];
  onChange: (data: File[]) => void;
}

export function PropertyPhotos({ data, onChange }: PropertyPhotosProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [captions, setCaptions] = useState<Map<number, string>>(new Map());
  const [coverIndex, setCoverIndex] = useState(0);

  // Create preview URLs when data changes
  useEffect(() => {
    if (!Array.isArray(data)) {
      setPreviewUrls([]);
      return;
    }

    // Revoke old URLs
    previewUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // Ignore
      }
    });
    
    // Create new URLs
    const newUrls = data.map(file => {
      try {
        return URL.createObjectURL(file);
      } catch (e) {
        return "";
      }
    }).filter(url => url !== "");
    
    setPreviewUrls(newUrls);

    return () => {
      newUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore
        }
      });
    };
  }, [data]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const currentData = Array.isArray(data) ? data : [];

    if (currentData.length + acceptedFiles.length > 20) {
      toast.error("Tối đa 20 ảnh cho mỗi property");
      return;
    }

    const oversizedFiles = acceptedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error("Một số ảnh vượt quá 10MB");
      return;
    }

    onChange([...currentData, ...acceptedFiles]);
    toast.success(`Đã thêm ${acceptedFiles.length} ảnh`);
  }, [data, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true,
  });

  const removePhoto = (index: number) => {
    if (!Array.isArray(data)) return;

    const newFiles = data.filter((_, i) => i !== index);
    onChange(newFiles);

    const newCaptions = new Map<number, string>();
    captions.forEach((caption, idx) => {
      if (idx < index) {
        newCaptions.set(idx, caption);
      } else if (idx > index) {
        newCaptions.set(idx - 1, caption);
      }
    });
    setCaptions(newCaptions);

    if (index === coverIndex && newFiles.length > 0) {
      setCoverIndex(0);
    } else if (index < coverIndex) {
      setCoverIndex(prev => prev - 1);
    }
  };

  const setCoverPhoto = (index: number) => {
    setCoverIndex(index);
    toast.success("Đã đặt ảnh làm ảnh bìa");
  };

  const updateCaption = (index: number, caption: string) => {
    const newCaptions = new Map(captions);
    newCaptions.set(index, caption);
    setCaptions(newCaptions);
  };

  const getPhotoMetadata = useCallback(() => {
    if (!Array.isArray(data)) return [];
    
    return data.map((file, index) => ({
      file,
      caption: captions.get(index) || "",
      isCover: index === coverIndex,
      order: index,
    }));
  }, [data, captions, coverIndex]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      (window as any).__propertyPhotosMetadata = getPhotoMetadata;
    }
  }, [data, captions, coverIndex, getPhotoMetadata]);

  const photos = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Hình ảnh Property
        </h3>
        <p className="text-sm text-gray-500">
          Thêm ảnh chất lượng cao về property của bạn (tối đa 20 ảnh)
        </p>
        <p className="text-xs text-amber-600 mt-1">
          ⚠️ Ảnh sẽ được upload khi bạn hoàn tất tạo property
        </p>
      </div>

      {/* Upload Area - Same style as campsite */}
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
          isDragActive
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 hover:border-emerald-500',
        )}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            'mb-4 h-12 w-12',
            isDragActive ? 'text-emerald-600' : 'text-gray-400',
          )}
        />
        <p className="text-center text-lg font-medium">
          {isDragActive ? 'Thả ảnh vào đây...' : 'Kéo/thả hoặc click để chọn ảnh'}
        </p>
        <p className="text-gray-500 mt-2 text-sm">
          PNG, JPG, WEBP (tối đa 10MB mỗi ảnh)
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {photos.length}/20 ảnh đã chọn
        </p>
      </div>

      {/* Image Grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div
              key={`${index}-${photos[index]?.name}`}
              className="relative group rounded-lg overflow-hidden border bg-gray-100"
            >
              {/* Image */}
              <div className="relative aspect-square">
                <Image
                  src={url}
                  alt={`Photo ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                
                {/* Cover Badge */}
                {index === coverIndex && (
                  <Badge className="absolute top-2 left-2 bg-emerald-600 gap-1 z-10">
                    <Star className="h-3 w-3 fill-white" />
                    Ảnh bìa
                  </Badge>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index !== coverIndex && (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setCoverPhoto(index)}
                      className="text-xs"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      Đặt bìa
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Caption Input */}
              <div className="p-3 bg-white">
                <Input
                  value={captions.get(index) || ""}
                  onChange={(e) => updateCaption(index, e.target.value)}
                  placeholder="Mô tả ảnh..."
                  maxLength={200}
                  className="text-xs h-8"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {photos[index]?.name} • {(photos[index]?.size / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {previewUrls.length === 0 && (
        <div className="text-gray-500 rounded-lg border border-dashed p-8 text-center">
          Chưa có ảnh nào được chọn
        </div>
      )}
    </div>
  );
}