'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getUserByUsername } from '@/lib/client-actions';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  CheckCircle2,
  Eye,
  Heart,
  Loader2,
  MapPin,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const username = params.username as string;
  const { user: currentUser } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['user', username],
    queryFn: () => getUserByUsername(username),
    enabled: !!username,
  });

  const profile = data?.data as UserProfile | undefined;
  const isOwnProfile = currentUser?.username === username;

  // Determine active tab
  const getActiveTab = () => {
    if (pathname.includes('/saves')) return 'saves';
    return 'trips';
  };

  const activeTab = getActiveTab();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
          <p className="text-muted-foreground mt-4">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">Không tìm thấy người dùng</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/">Về trang chủ</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberSince = format(new Date(profile.createdAt), 'MMMM yyyy', {
    locale: vi,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Sidebar - Profile Info */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                {/* Avatar */}
                <div className="mb-4 flex flex-col items-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profile.avatarUrl}
                      alt={profile.username}
                    />
                    <AvatarFallback className="text-2xl">
                      {profile.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="mt-3 text-xl font-bold">{profile.username}</h1>
                  {profile.role === 'host' && (
                    <Badge className="mt-1 bg-emerald-100 text-emerald-800">
                      Chủ nhà
                    </Badge>
                  )}
                </div>

                {/* Member Info */}
                <div className="space-y-3 text-sm">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>Camper từ {memberSince}</span>
                  </div>
                  {profile.location && (
                    <div className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {profile.bio ? (
                  <p className="text-muted-foreground mt-4 text-sm">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-muted-foreground mt-4 text-sm italic">
                    Giới thiệu: Giới thiệu bản thân với cộng đồng! Thêm mô tả
                    ngắn...
                  </p>
                )}

                {/* Manage Account Button */}
                {isOwnProfile && (
                  <Button asChild variant="outline" className="mt-4 w-full">
                    <Link href="/u/edit">
                      <Settings className="mr-2 h-4 w-4" />
                      Quản lý tài khoản
                    </Link>
                  </Button>
                )}

                {/* View on backcountry */}
                <Button
                  variant="ghost"
                  className="text-muted-foreground mt-2 w-full"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Xem trên bản đồ
                </Button>
              </CardContent>
            </Card>

            {/* Trusted Camper Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Camper đáng tin cậy</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Email đã xác thực</span>
                    </div>
                  </div>
                  {!profile.isVerified && isOwnProfile && (
                    <Button variant="outline" size="sm" className="w-full">
                      Xác thực email
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Balance Card */}
            {isOwnProfile && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">0₫</span>
                      <span className="text-muted-foreground ml-2 text-sm">
                        Số dư
                      </span>
                    </div>
                    <Button variant="link" className="text-emerald-600">
                      Nhận điểm thưởng
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-2">
            {/* Stats Bar */}
            <div className="mb-6 flex gap-8">
              <Link
                href={`/u/${username}/trips`}
                className={`text-center transition-colors ${
                  activeTab === 'trips'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm">Chuyến đi</div>
              </Link>
              <Link
                href={`/u/${username}/saves`}
                className={`text-center transition-colors ${
                  activeTab === 'saves'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm">Đã lưu</div>
              </Link>
              <div className="text-muted-foreground text-center">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm">Đánh giá</div>
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Tab Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
