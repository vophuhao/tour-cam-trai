'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, Loader2, MapPin, Star, Tent } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface SavedCampsite {
  _id: string;
  name: string;
  slug?: string;
  images?: string[];
  location?: {
    city: string;
    state: string;
  };
  pricing?: {
    basePrice: number;
  };
  averageRating?: number;
  totalReviews?: number;
}

// TODO: Replace with actual API when available
const getUserSavedCampsites = async (): Promise<SavedCampsite[]> => {
  // Placeholder - will be replaced with actual API call
  return [];
};

export default function SavesPage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();
  const isOwnProfile = currentUser?.username === username;

  const { data: savedCampsites = [], isLoading } = useQuery({
    queryKey: ['user-saves', username],
    queryFn: () => getUserSavedCampsites(),
    enabled: isOwnProfile,
  });

  if (!isOwnProfile) {
    return (
      <div className="py-12 text-center">
        <Bookmark className="text-muted-foreground mx-auto h-12 w-12" />
        <h2 className="mt-4 text-lg font-semibold">Danh sách riêng tư</h2>
        <p className="text-muted-foreground mt-2">
          Bạn không thể xem danh sách đã lưu của người dùng khác
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  const CampsiteCard = ({ campsite }: { campsite: SavedCampsite }) => (
    <Card className="group overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={campsite.images?.[0] || '/placeholder-campsite.jpg'}
          alt={campsite.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
        {/* Unsave Button */}
        <button className="absolute top-3 right-3 rounded-full bg-white/80 p-2 transition-colors hover:bg-white">
          <Bookmark className="h-4 w-4 fill-emerald-500 text-emerald-500" />
        </button>
      </div>
      <CardContent className="p-4">
        <h3 className="line-clamp-1 text-lg font-semibold">{campsite.name}</h3>

        {/* Location */}
        <p className="text-muted-foreground mt-1 flex items-center gap-1 text-sm">
          <MapPin className="h-3 w-3" />
          {campsite.location?.city}, {campsite.location?.state}
        </p>

        {/* Rating */}
        {campsite.averageRating && (
          <div className="mt-2 flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              {campsite.averageRating.toFixed(1)}
            </span>
            {campsite.totalReviews && (
              <span className="text-muted-foreground">
                ({campsite.totalReviews} đánh giá)
              </span>
            )}
          </div>
        )}

        {/* Price */}
        {campsite.pricing?.basePrice && (
          <p className="mt-2 font-semibold text-emerald-600">
            {campsite.pricing.basePrice.toLocaleString('vi-VN')}đ
            <span className="text-muted-foreground text-sm font-normal">
              /đêm
            </span>
          </p>
        )}

        {/* View Button */}
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link href={`/campsites/${campsite.slug || campsite._id}`}>
            Xem chi tiết
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {savedCampsites.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedCampsites.map(campsite => (
            <CampsiteCard key={campsite._id} campsite={campsite} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Tent className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-4 font-semibold">Chưa lưu địa điểm nào</h3>
            <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm">
              Lưu các địa điểm cắm trại yêu thích để dễ dàng tìm lại sau. Nhấn
              vào biểu tượng bookmark trên mỗi địa điểm để lưu.
            </p>
            <Button
              asChild
              className="mt-4 bg-emerald-500 hover:bg-emerald-600"
            >
              <Link href="/search">Khám phá địa điểm</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
