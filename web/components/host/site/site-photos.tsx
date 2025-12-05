// ...existing code...
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Image as ImageIcon, Star } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SitePhotosProps {
  // accepts array of File OR array of objects like { url, caption, isCover, _id, ... }
  data: any[];
  onChange: (files: any[]) => void;
}

export function SitePhotos({ data, onChange }: SitePhotosProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [captions, setCaptions] = useState<Map<number, string>>(new Map());
  const [coverIndex, setCoverIndex] = useState(0);
  const generatedUrlsRef = useRef<string[]>([]);

  // build one-to-one previewUrls array so indices align with data
  useEffect(() => {
    // revoke previous generated object URLs
    generatedUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
    generatedUrlsRef.current = [];

    if (!Array.isArray(data) || data.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = data.map((item) => {
      if (item instanceof File) {
        try {
          const u = URL.createObjectURL(item);
          generatedUrlsRef.current.push(u);
          return u;
        } catch {
          return "";
        }
      }
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && item.url) return item.url;
      return "";
    });

    setPreviewUrls(urls);
    return () => {
      generatedUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
      generatedUrlsRef.current = [];
    };
  }, [data]);

  // initialize captions map from incoming data
  useEffect(() => {
    const next = new Map<number, string>();
    if (Array.isArray(data)) {
      data.forEach((item, idx) => {
        if (item && typeof item === "object" && typeof item.caption === "string") {
          next.set(idx, item.caption);
        }
      });
    }
    setCaptions(next);
    // run when urls or file names change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify((data || []).map(d => (d && (d.url || d.name)) ? (d.url ?? d.name) : d))]);

  // set coverIndex from incoming data if there is an isCover marker
  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setCoverIndex(0);
      return;
    }
    const idx = data.findIndex((it) => it && typeof it === "object" && (it.isCover === true || it?.is_cover === true));
    if (idx >= 0) setCoverIndex(idx);
  }, [data]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const current = Array.isArray(data) ? data : [];

    if (current.length + acceptedFiles.length > 20) {
      toast.error("Tối đa 20 ảnh cho mỗi site");
      return;
    }

    const oversized = acceptedFiles.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      toast.error("Một số ảnh vượt quá 10MB");
      return;
    }

    onChange([...current, ...acceptedFiles]);
    toast.success(`Đã thêm ${acceptedFiles.length} ảnh`);
  }, [data, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: true,
  });

  const removePhoto = (index: number) => {
    console.log("SitePhotos.removePhoto", { index, length: Array.isArray(data) ? data.length : 0 });
    if (!Array.isArray(data)) return;

    // create new array for parent
    const newFiles = data.filter((_, i) => i !== index);
    // notify parent
    onChange([...newFiles]);
    console.log("SitePhotos.onChange called -> new length:", newFiles.length);

    // optimistic UI: remove preview URL if we created one
    setPreviewUrls((prev) => {
      // revoke object URL if it's in generatedUrlsRef
      const genUrl = generatedUrlsRef.current[index];
      if (genUrl) {
        try { URL.revokeObjectURL(genUrl); } catch {}
        // remove from generatedUrlsRef
        generatedUrlsRef.current.splice(index, 1);
      }
      return prev.filter((_, i) => i !== index);
    });

    // adjust captions map
    const newCaptions = new Map<number, string>();
    captions.forEach((val, key) => {
      if (key < index) newCaptions.set(key, val);
      else if (key > index) newCaptions.set(key - 1, val);
    });
    setCaptions(newCaptions);

    // adjust cover index
    if (index === coverIndex && newFiles.length > 0) {
      setCoverIndex(0);
    } else if (index < coverIndex) {
      setCoverIndex((c) => Math.max(0, c - 1));
    } else if (newFiles.length === 0) {
      setCoverIndex(0);
    }
  };

  const setCoverPhoto = (index: number) => {
    setCoverIndex(index);
    toast.success("Đã đặt ảnh làm ảnh bìa");
  };

  const updateCaption = (index: number, caption: string) => {
    const next = new Map(captions);
    next.set(index, caption);
    setCaptions(next);
  };

  const getPhotoMetadata = useCallback(() => {
    if (!Array.isArray(data)) return [];
    return data.map((item, idx) => ({
      file: item instanceof File ? item : undefined,
      url: (item && typeof item === "object" && item.url) ? item.url : (typeof item === "string" ? item : undefined),
      caption: captions.get(idx) || "",
      isCover: idx === coverIndex,
      order: idx,
      raw: item,
    }));
  }, [data, captions, coverIndex]);

  // expose metadata getter for uploader
  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      (window as any).__sitePhotosMetadata = getPhotoMetadata;
    } else {
      try { delete (window as any).__sitePhotosMetadata; } catch {}
    }
  }, [data, captions, coverIndex, getPhotoMetadata]);

  const photos = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Hình ảnh Site</h3>
        <p className="text-sm text-gray-500">
          Thêm ảnh chất lượng cao về site (tối đa 20 ảnh). Ảnh sẽ được upload khi hoàn tất tạo site.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragActive ? "border-emerald-500 bg-emerald-50" : "border-gray-300 hover:border-emerald-500"
        )}
      >
        <input {...getInputProps()} />
        <Upload className={cn("mb-4 h-10 w-10", isDragActive ? "text-emerald-600" : "text-gray-400")} />
        <p className="text-center text-lg font-medium">
          {isDragActive ? "Thả ảnh vào đây..." : "Kéo/thả hoặc click để chọn ảnh"}
        </p>
        <p className="text-gray-500 mt-2 text-sm">PNG, JPG, WEBP (tối đa 10MB mỗi ảnh)</p>
        <p className="text-xs text-gray-400 mt-1">{photos.length}/20 ảnh đã chọn</p>
      </div>

      {previewUrls.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => {
            const item = photos[index];
            const name = item instanceof File
              ? item.name
              : (item && (item.url || item.name) ? (item.url ?? item.name).split("/").pop() : "");
            const sizeText = item instanceof File ? `${(item.size / 1024 / 1024).toFixed(1)}MB` : "-";
            const keyId = (item && typeof item === "object" && (item._id || item.url)) ? (item._id ?? item.url) : `${index}`;

            return (
              <Card key={`${keyId}-${index}`} className="relative group overflow-hidden">
                <div className="relative aspect-square bg-gray-100">
                  {url ? (
                    <Image src={url} alt={`Photo ${index + 1}`} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full text-gray-300">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-30 pointer-events-auto">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={(e) => { e.stopPropagation(); console.log("delete click", index); removePhoto(index); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {index === coverIndex && (
                    <Badge className="absolute top-2 left-2 bg-amber-500 text-white z-10">
                      <Star className="h-3 w-3" />
                      Ảnh bìa
                    </Badge>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2 pointer-events-none group-hover:pointer-events-auto">
                    {index !== coverIndex && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={(e) => { e.stopPropagation(); setCoverPhoto(index); }}
                      >
                        <Star className="h-3 w-3 mr-1" /> Đặt bìa
                      </Button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-white">
                  <Input
                    value={captions.get(index) || ""}
                    onChange={(e) => updateCaption(index, e.target.value)}
                    placeholder="Mô tả ảnh..."
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {name} • {sizeText}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Chưa có ảnh nào</p>
          <p className="text-xs text-gray-500">Upload ảnh để khách có thể hình dung site của bạn</p>
        </div>
      )}

    </div>
  );
}
