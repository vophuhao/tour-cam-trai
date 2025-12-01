'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface SimilarCampsitesProps {
  campsites: Campsite[];
}

export function SimilarCampsites({ campsites }: SimilarCampsitesProps) {
  const formatPrice = (price: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Campsite tương tự gần đây</h2>

      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {campsites.map(campsite => (
            <CarouselItem
              key={campsite._id}
              className="pl-2 md:basis-1/2 md:pl-4 lg:basis-1/3 xl:basis-1/4"
            >
              <Link href={`/campsites/${campsite.slug}`}>
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="relative aspect-video">
                    <Image
                      src={campsite.images[0] || '/placeholder-campsite.jpg'}
                      alt={campsite.name}
                      fill
                      className="object-cover"
                    />
                    {campsite.rating && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold shadow-md">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {campsite.rating.average}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="line-clamp-1 font-semibold">
                      {campsite.name}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {campsite.location.city}, {campsite.location.state}
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {campsite.propertyType}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-4">
                    <div>
                      <span className="text-lg font-bold">
                        {formatPrice(
                          campsite.pricing.basePrice,
                          campsite.pricing.currency,
                        )}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {' '}
                        / đêm
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-12 hidden lg:flex" />
        <CarouselNext className="-right-12 hidden lg:flex" />
      </Carousel>
    </div>
  );
}
