'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Car,
  Clock,
  MapPin,
  PawPrint,
  Star,
  Users,
} from 'lucide-react';

interface CampsiteOverviewProps {
  campsite: Campsite;
}

const propertyTypeLabels: Record<string, string> = {
  tent: 'Lều cắm trại',
  rv: 'RV/Caravan',
  cabin: 'Cabin',
  glamping: 'Glamping',
  treehouse: 'Nhà trên cây',
  yurt: 'Lều Mông Cổ',
  other: 'Khác',
};

export function CampsiteOverview({ campsite }: CampsiteOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{campsite.name}</h1>
        {campsite.tagline && (
          <p className="text-muted-foreground mt-2 text-lg">
            {campsite.tagline}
          </p>
        )}
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>
            {campsite.location.city}, {campsite.location.state}
          </span>
        </div>
        {campsite.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{campsite.rating.average}</span>
            <span className="text-muted-foreground">
              ({campsite.rating.count} đánh giá)
            </span>
          </div>
        )}
        <Badge variant="outline">
          {propertyTypeLabels[campsite.propertyType]}
        </Badge>
      </div>

      {/* Host Info */}
      <div className="flex items-center gap-4 rounded-lg border p-4">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={campsite.host.avatar}
            alt={campsite.host.name || campsite.host.email}
          />
          <AvatarFallback>
            {(campsite.host.name || campsite.host.email)
              .charAt(0)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">
            Chủ nhà: {campsite.host.name || campsite.host.email.split('@')[0]}
          </p>
          <p className="text-muted-foreground text-sm">{campsite.host.email}</p>
        </div>
      </div>

      {/* Capacity Info */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="flex items-center gap-2">
          <Users className="text-muted-foreground h-5 w-5" />
          <div>
            <p className="text-sm font-medium">
              Tối đa {campsite.capacity.maxGuests} khách
            </p>
          </div>
        </div>
        {campsite.capacity.maxVehicles && (
          <div className="flex items-center gap-2">
            <Car className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-sm font-medium">
                {campsite.capacity.maxVehicles} xe
              </p>
            </div>
          </div>
        )}
        {campsite.rules.allowPets && campsite.capacity.maxPets && (
          <div className="flex items-center gap-2">
            <PawPrint className="text-muted-foreground h-5 w-5" />
            <div>
              <p className="text-sm font-medium">
                Tối đa {campsite.capacity.maxPets} thú cưng
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs: Description & Rules */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="description">Mô tả</TabsTrigger>
          <TabsTrigger value="rules">Quy định</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4 space-y-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{campsite.description}</p>
          </div>
        </TabsContent>

        <TabsContent value="rules" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Clock className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="font-medium">Giờ nhận phòng</p>
                  <p className="text-muted-foreground text-sm">
                    Sau {campsite.rules.checkInTime}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="font-medium">Giờ trả phòng</p>
                  <p className="text-muted-foreground text-sm">
                    Trước {campsite.rules.checkOutTime}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="text-muted-foreground mt-1 h-5 w-5" />
                <div>
                  <p className="font-medium">Số đêm tối thiểu</p>
                  <p className="text-muted-foreground text-sm">
                    {campsite.rules.minNights} đêm
                  </p>
                </div>
              </div>
              {campsite.rules.maxNights && (
                <div className="flex items-start gap-3">
                  <Calendar className="text-muted-foreground mt-1 h-5 w-5" />
                  <div>
                    <p className="font-medium">Số đêm tối đa</p>
                    <p className="text-muted-foreground text-sm">
                      {campsite.rules.maxNights} đêm
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Rules */}
            {campsite.rules.customRules &&
              campsite.rules.customRules.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 font-medium">Quy định khác:</p>
                  <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                    {campsite.rules.customRules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Restrictions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {!campsite.rules.allowPets && (
                <Badge variant="secondary">Không cho phép thú cưng</Badge>
              )}
              {!campsite.rules.allowChildren && (
                <Badge variant="secondary">Không cho phép trẻ em</Badge>
              )}
              {!campsite.rules.allowSmoking && (
                <Badge variant="secondary">Không hút thuốc</Badge>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
