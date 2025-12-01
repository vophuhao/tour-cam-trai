'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Expand } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface CampsiteGalleryProps {
  images: string[];
  name: string;
}

export function CampsiteGallery({ images, name }: CampsiteGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images.slice(0, 5);
  const hasMore = images.length > 5;

  return (
    <div className="relative">
      {/* Desktop Grid Layout */}
      <div className="container hidden py-4 md:grid md:h-[500px] md:grid-cols-4 md:grid-rows-2 md:gap-2">
        {/* Main large image */}
        <div
          className="group relative col-span-2 row-span-2 cursor-pointer"
          onClick={() => {
            setCurrentIndex(0);
            setIsOpen(true);
          }}
        >
          <Image
            src={displayImages[0] || '/placeholder-campsite.jpg'}
            alt={`${name} - Photo 1`}
            fill
            className="rounded-l-lg object-cover"
            priority
          />
          <div className="absolute inset-0 rounded-l-lg bg-black/0 transition-all group-hover:bg-black/10" />
        </div>

        {/* Small images grid */}
        {displayImages.slice(1, 5).map((image, index) => (
          <div
            key={index}
            className={cn(
              'group relative cursor-pointer',
              index === 3 && 'overflow-hidden rounded-br-lg',
              index === 1 && 'overflow-hidden rounded-tr-lg',
            )}
            onClick={() => {
              setCurrentIndex(index + 1);
              setIsOpen(true);
            }}
          >
            <Image
              src={image || '/placeholder-campsite.jpg'}
              alt={`${name} - Photo ${index + 2}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 transition-all group-hover:bg-black/10" />

            {/* Show all photos button */}
            {index === 3 && hasMore && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold hover:bg-white/90">
                  <Expand className="h-4 w-4" />
                  Xem tất cả {images.length} ảnh
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden">
        <Carousel className="w-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative aspect-video">
                  <Image
                    src={image || '/placeholder-campsite.jpg'}
                    alt={`${name} - Photo ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 cursor-pointer" />
          <CarouselNext className="right-4 cursor-pointer" />
        </Carousel>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="h-auto max-w-[85vw] overflow-hidden border-0 bg-transparent p-0">
          <VisuallyHidden.Root asChild>
            <DialogTitle>{name} - Gallery</DialogTitle>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root asChild>
            <DialogDescription>Photo gallery for {name}</DialogDescription>
          </VisuallyHidden.Root>

          <div className="relative flex h-full w-full items-center justify-center">
            <Carousel
              opts={{
                startIndex: currentIndex,
                loop: true,
              }}
              className="h-full w-full"
            >
              <CarouselContent className="h-full">
                {images.map((image, index) => (
                  <CarouselItem
                    key={index}
                    className="flex items-center justify-center"
                  >
                    <div
                      className="relative w-full"
                      style={{ height: 'calc(95vh - 80px)' }}
                    >
                      <Image
                        src={image || '/placeholder-campsite.jpg'}
                        alt={`${name} - Photo ${index + 1}`}
                        fill
                        className="rounded-2xl object-cover"
                        sizes="95vw"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 cursor-pointer bg-white/90 hover:bg-white" />
              <CarouselNext className="right-4 cursor-pointer bg-white/90 hover:bg-white" />
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
