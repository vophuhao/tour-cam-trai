/* eslint-disable @next/next/no-img-element */
'use client';

import { Star, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import AdminReply from './admin-reply';

interface RatingItemProps {
  rating: {
    _id: string;
    user: {
      _id: string;
      username: string;
      avatarUrl?: string;
      isVerified?: boolean;
    };
    rating: number;
    review?: string;
    files?: string[];
    adminReply?: {
      message: string;
      repliedAt: Date;
    };
    createdAt: Date;
  };
}

export default function RatingItem({ rating }: RatingItemProps) {
  return (
    <div className="border-b last:border-b-0 py-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="w-12 h-12 border-2 border-gray-200">
          <AvatarImage src={rating.user.avatarUrl} alt={rating.user.username} />
          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
            {rating.user.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-gray-900">{rating.user.username}</span>
            {rating.user.isVerified && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
           
          </div>

          {/* Rating Stars */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true, locale: vi })}
            </span>
          </div>

          {/* Review Text */}
          {rating.review && (
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{rating.review}</p>
          )}

          {/* Images */}
          {rating.files && rating.files.length > 0 && (
            <div className="flex gap-2 mb-3">
              {rating.files.map((file, index) => (
                <div
                  key={index}
                  className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <img
                    src={file}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Admin Reply */}
          {rating.adminReply && <AdminReply reply={rating.adminReply} />}
        </div>
      </div>
    </div>
  );
}