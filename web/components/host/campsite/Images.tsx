'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { DropzoneInputProps, DropzoneRootProps } from 'react-dropzone';

interface Step2Props {
    getRootProps: () => DropzoneRootProps;
    getInputProps: () => DropzoneInputProps;
    isDragActive: boolean;
    previewUrls: string[];
    currentImageIndex: number;
    setCurrentImageIndex: (index: number) => void;
    removeImage: (index: number) => void;
}

export function Step2Images({
    getRootProps,
    getInputProps,
    isDragActive,
    previewUrls,
    currentImageIndex,
    setCurrentImageIndex,
    removeImage,
}: Step2Props) {
    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
                    isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary',
                )}
            >
                <input {...getInputProps()} />
                <Upload
                    className={cn(
                        'mb-4 h-12 w-12',
                        isDragActive ? 'text-primary' : 'text-muted-foreground',
                    )}
                />
                <p className="text-center text-lg font-medium">
                    {isDragActive ? 'Thả ảnh vào đây...' : 'Kéo/thả hoặc click để chọn ảnh'}
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                    PNG, JPG, WEBP (tối đa 20 ảnh)
                </p>
            </div>

            {previewUrls.length > 0 && (
                <div className="relative">
                    <Image
                        src={previewUrls[currentImageIndex]}
                        alt="Preview"
                        width={800}
                        height={400}
                        className="h-96 w-full rounded-lg border object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                        <span className="rounded-full bg-black/70 px-4 py-2 text-sm text-white">
                            {currentImageIndex + 1}/{previewUrls.length}
                        </span>
                        <Button
                            type="button"
                            size="icon"
                            variant="destructive"
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
                                className="absolute top-1/2 left-4 -translate-y-1/2"
                                onClick={() =>
                                    setCurrentImageIndex(
                                        (currentImageIndex - 1 + previewUrls.length) % previewUrls.length,
                                    )
                                }
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="absolute top-1/2 right-4 -translate-y-1/2"
                                onClick={() =>
                                    setCurrentImageIndex((currentImageIndex + 1) % previewUrls.length)
                                }
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </>
                    )}
                </div>
            )}

            {previewUrls.length === 0 && (
                <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
                    Chưa có ảnh nào được chọn
                </div>
            )}
        </div>
    );
}