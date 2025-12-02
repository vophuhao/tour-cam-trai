import FeaturedDestinations from '@/components/home/featured-destinations';
import FeaturedProducts from '@/components/home/featured-products';
import HeroSection from '@/components/home/hero-section';
import Newsletter from '@/components/home/newsletter';
import RevealOnScroll from '@/components/reveal-on-scroll';
import { StaggerContainer, StaggerItem } from '@/components/stagger-animation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Mountain,
  Quote,
  Shield,
  Star,
  Tent,
  ThumbsUp,
  TrendingUp,
  Users,
  Waves,
  Wind,
} from 'lucide-react';
import Image from 'next/image';

const campsiteTypes = [
  {
    id: 'tent',
    name: 'Cắm Trại Lều',
    icon: Tent,
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
    count: 18,
    description: 'Trải nghiệm camping truyền thống với lều',
  },
  {
    id: 'rv',
    name: 'Khu RV',
    icon: Mountain,
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
    count: 12,
    description: 'Không gian cho xe cắm trại và RV',
  },
  {
    id: 'cabin',
    name: 'Cabin',
    icon: Wind,
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
    count: 15,
    description: 'Nhà gỗ ấm cúng giữa thiên nhiên',
  },
  {
    id: 'glamping',
    name: 'Glamping',
    icon: Waves,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    count: 10,
    description: 'Camping sang trọng với đầy đủ tiện nghi',
  },
];

const mockPromos = [
  {
    id: 1,
    title: 'Giảm 20% Booking Cuối Tuần',
    description: 'Áp dụng cho đặt chỗ từ thứ 6-CN. Miễn phí hủy trước 48h.',
    discount: 20,
    validUntil: '31/12/2025',
    code: 'WEEKEND20',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
  },
  {
    id: 2,
    title: 'Ưu đãi mùa hè 2026',
    description:
      'Giảm đến 30% cho booking sớm trước 1 tháng. Áp dụng tất cả địa điểm.',
    discount: 30,
    validUntil: '15/01/2026',
    code: 'SUMMER30',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
  },
  {
    id: 3,
    title: 'Miễn phí đêm thứ 3',
    description: 'Đặt 2 đêm tặng 1 đêm. Khuyến mãi có hạn cho khách hàng mới.',
    discount: 0,
    validUntil: '28/02/2026',
    code: 'STAY3PAY2',
    image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=800',
  },
];

const mockReviews = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    comment:
      'Địa điểm cắm trại tuyệt vời! View đẹp, sạch sẽ, host thân thiện. Có đầy đủ tiện nghi, wifi mạnh. Gia đình mình đã có kỳ nghỉ cuối tuần thật tuyệt.',
    campsite: 'Mountain View Campsite',
    date: '15/11/2025',
    location: 'Sapa',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    comment:
      'Glamping sang trọng, sạch sẽ, có điều hòa. View hồ tuyệt đẹp, yên tĩnh. Phù hợp cho gia đình có trẻ nhỏ. Giá cả hợp lý, đáng đồng tiền.',
    campsite: 'Lakeside Glamping',
    date: '10/11/2025',
    location: 'Đà Lạt',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    comment:
      'Cabin xinh xắn, ấm áp. Có BBQ pit riêng, view núi tuyệt đẹp. Host nhiệt tình hướng dẫn. Sẽ quay lại vào mùa hè!',
    campsite: 'Forest Cabin Retreat',
    date: '05/11/2025',
    location: 'Đà Lạt',
  },
];

const features = [
  {
    icon: Shield,
    title: 'Booking An Toàn',
    description: 'Thanh toán bảo mật, chính sách hủy linh hoạt, hỗ trợ 24/7',
  },
  {
    icon: Users,
    title: 'Host Tin Cậy',
    description: 'Tất cả host đều được xác minh và đánh giá bởi cộng đồng',
  },
  {
    icon: ThumbsUp,
    title: 'Giá Tốt Nhất',
    description:
      'Không phí ẩn, giá minh bạch, nhiều ưu đãi cho khách hàng thân thiết',
  },
  {
    icon: TrendingUp,
    title: 'Đánh Giá Thực Tế',
    description: 'Hơn 10,000 đánh giá chân thực từ khách hàng đã trải nghiệm',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedDestinations />

      {/* Campsite Types */}
      <section className="section-padding bg-linear-to-b from-white to-gray-50">
        <div className="container-padding mx-auto max-w-7xl">
          <RevealOnScroll>
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">
                Loại hình cắm trại
              </span>
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                Chọn Phong Cách Của Bạn
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Từ camping truyền thống đến glamping sang trọng, tìm trải nghiệm
                phù hợp với bạn
              </p>
            </div>
          </RevealOnScroll>
          <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {campsiteTypes.map(category => {
              const Icon = category.icon;
              return (
                <StaggerItem key={category.id}>
                  <Card className="group cursor-pointer overflow-hidden border-0 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl">
                    <div className="relative h-72">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white">
                        <div className="flex-center mb-4 rounded-full bg-white/20 p-4 backdrop-blur-sm transition-transform group-hover:scale-110">
                          <Icon className="h-12 w-12" />
                        </div>
                        <h3 className="mb-3 text-3xl font-bold">
                          {category.name}
                        </h3>
                        <p className="mb-3 text-center text-sm opacity-90">
                          {category.description}
                        </p>
                        <p className="font-semibold">
                          {category.count} campsites
                        </p>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <FeaturedProducts />

      {/* Special Offers */}
      <section className="section-padding bg-linear-to-b from-gray-50 to-white">
        <div className="container-padding mx-auto max-w-7xl">
          <RevealOnScroll>
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-600">
                Ưu đãi đặc biệt
              </span>
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                Khuyến Mãi Hấp Dẫn
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Tiết kiệm chi phí cho chuyến cắm trại tiếp theo của bạn
              </p>
            </div>
          </RevealOnScroll>
          <StaggerContainer className="grid gap-8 md:grid-cols-3">
            {mockPromos.map(promo => (
              <StaggerItem key={promo.id}>
                <Card className="overflow-hidden border-0 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl">
                  <div className="relative h-56">
                    <Image
                      src={promo.image}
                      alt={promo.title}
                      fill
                      className="object-cover"
                    />
                    {promo.discount > 0 && (
                      <div className="absolute top-4 right-4">
                        <div className="flex-center h-20 w-20 flex-col rounded-full bg-red-500 text-white shadow-xl">
                          <span className="text-3xl font-bold">
                            {promo.discount}%
                          </span>
                          <span className="text-xs">OFF</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="mb-3 text-xl font-bold">{promo.title}</h3>
                    <p className="text-muted-foreground mb-4 text-sm">
                      {promo.description}
                    </p>
                    <div className="mb-4 rounded-lg bg-gray-100 p-3">
                      <p className="text-muted-foreground mb-1 text-xs font-medium">
                        Mã giảm giá:
                      </p>
                      <p className="text-primary font-mono text-lg font-bold">
                        {promo.code}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4" />
                        HSD: {promo.validUntil}
                      </span>
                      <Button>Sử dụng ngay</Button>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="section-padding bg-linear-to-b from-white to-gray-50">
        <div className="container-padding mx-auto max-w-7xl">
          <RevealOnScroll>
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-700">
                Đánh giá từ cộng đồng
              </span>
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                Trải Nghiệm Thực Tế
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Khám phá những câu chuyện camping đáng nhớ từ cộng đồng
              </p>
            </div>
          </RevealOnScroll>
          <StaggerContainer className="grid gap-8 md:grid-cols-3">
            {mockReviews.map(review => (
              <StaggerItem key={review.id}>
                <Card className="relative overflow-hidden border-0 p-8 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl">
                  <Quote className="text-primary/10 absolute top-6 right-6 h-16 w-16" />
                  <div className="relative">
                    <div className="mb-6 flex items-center gap-4">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        width={64}
                        height={64}
                        className="ring-primary/10 rounded-full ring-4"
                      />
                      <div>
                        <h4 className="text-lg font-bold">{review.name}</h4>
                        <div className="mb-1 flex">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {review.location}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed italic">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                    <Separator className="mb-4" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-emerald-600">
                        {review.campsite}
                      </span>
                      <span className="text-muted-foreground">
                        {review.date}
                      </span>
                    </div>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-linear-to-b from-gray-50 to-white">
        <div className="container-padding mx-auto max-w-7xl">
          <RevealOnScroll>
            <div className="mb-12 text-center">
              <span className="mb-3 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-semibold text-emerald-600">
                Vì sao chọn chúng tôi
              </span>
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                Cam Kết Của Chúng Tôi
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Nền tảng đặt chỗ cắm trại đáng tin cậy nhất Việt Nam
              </p>
            </div>
          </RevealOnScroll>
          <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={index}>
                  <Card className="border-0 p-8 text-center shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl">
                    <div className="flex-center mx-auto mb-6 h-20 w-20 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
                      <Icon className="h-10 w-10" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
