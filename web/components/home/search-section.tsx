'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, MapPin, Search, Tent } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SearchSection() {
  const router = useRouter();
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [tourType, setTourType] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (location) params.set('location', location);
    if (duration) params.set('duration', duration);
    if (tourType) params.set('category', tourType);

    router.push(`/tours?${params.toString()}`);
  };
  return (
    <section className="border-b bg-linear-to-b from-white to-gray-50 py-12 shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <h3 className="mb-6 text-center text-2xl font-bold">
              Tìm Tour Hoàn Hảo Cho Bạn
            </h3>
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <MapPin className="text-primary h-4 w-4" />
                  Địa điểm
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn điểm đến" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sapa">Sapa</SelectItem>
                    <SelectItem value="Đà Lạt">Đà Lạt</SelectItem>
                    <SelectItem value="Phú Quốc">Phú Quốc</SelectItem>
                    <SelectItem value="Tây Nguyên">Tây Nguyên</SelectItem>
                    <SelectItem value="Hạ Long">Hạ Long</SelectItem>
                    <SelectItem value="Ninh Bình">Ninh Bình</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Clock className="text-primary h-4 w-4" />
                  Thời gian
                </label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1-2 ngày</SelectItem>
                    <SelectItem value="3-4">3-4 ngày</SelectItem>
                    <SelectItem value="5-7">5-7 ngày</SelectItem>
                    <SelectItem value="7">Trên 7 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Tent className="text-primary h-4 w-4" />
                  Loại tour
                </label>
                <Select value={tourType} onValueChange={setTourType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mountain">Núi rừng</SelectItem>
                    <SelectItem value="beach">Biển đảo</SelectItem>
                    <SelectItem value="adventure">
                      Phiêu lưu mạo hiểm
                    </SelectItem>
                    <SelectItem value="relaxation">
                      Thư giãn nghỉ dưỡng
                    </SelectItem>
                    <SelectItem value="cultural">Khám phá văn hóa</SelectItem>
                    <SelectItem value="eco">Sinh thái</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full shadow-md" onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  Tìm kiếm
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
