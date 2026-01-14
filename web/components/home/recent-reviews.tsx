'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Review } from '@/types/property-site';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Quote, Star } from 'lucide-react';
import Image from 'next/image';

interface RecentReviewsProps {
  reviews: Review[];
}

export default function RecentReviews({ reviews }: RecentReviewsProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="section-padding bg-linear-to-b from-gray-50 to-white">
      <div className="container-padding mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <span className="mb-3 inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-semibold text-amber-600">
            Đánh giá
          </span>
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            Trải Nghiệm Từ Khách Hàng
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Hàng ngàn đánh giá 5 sao từ cộng đồng camping Việt Nam
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map(review => {
            const property =
              typeof review.property === 'object' ? review.property : null;
            const site = typeof review.site === 'object' ? review.site : null;
            const guest = review.guest || review.user;
            const overallRating =
              review.overallRating || review.ratings?.overall || 5;

            return (
              <Card
                key={review._id}
                className="group overflow-hidden border-0 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl"
              >
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <div className="mb-4 flex items-start justify-between">
                    <Quote className="h-10 w-10 text-amber-500 opacity-50" />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(overallRating)
                              ? 'fill-amber-500 text-amber-500'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Review Title */}
                  {review.title && (
                    <h3 className="mb-2 line-clamp-1 text-lg font-semibold">
                      {review.title}
                    </h3>
                  )}

                  {/* Review Comment */}
                  <p className="text-muted-foreground mb-4 line-clamp-4 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Property & Site Info */}
                  {property && (
                    <div className="mb-4 rounded-lg bg-gray-50 p-3">
                      <p className="text-sm font-semibold text-gray-900">
                        {property.name}
                      </p>
                      {site && (
                        <p className="text-xs text-gray-600">
                          {site.name} • {site.accommodationType || 'Camping'}
                        </p>
                      )}
                      {property.location && (
                        <p className="text-xs text-gray-500">
                          {property.location.city}, {property.location.state}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Reviewer Info */}
                  <div className="flex items-center gap-3 border-t pt-4">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={
                          guest?.avatarUrl ||
                          `https://i.pravatar.cc/150?u=${review._id}`
                        }
                        alt={guest?.fullName || guest?.username || 'Anonymous'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {guest?.fullName || guest?.username || 'Khách hàng'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(review.createdAt), 'dd MMMM, yyyy', {
                          locale: vi,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
