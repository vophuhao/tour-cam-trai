import FeaturedDestinations from '@/components/home/featured-destinations';
import FeaturedProducts from '@/components/home/featured-products';
import FeaturedTours from '@/components/home/featured-tours';
import HeroSection from '@/components/home/hero-section';
import Newsletter from '@/components/home/newsletter';
import SearchSection from '@/components/home/search-section';
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

const tourCategories = [
  {
    id: 'mountain',
    name: 'Núi',
    icon: Mountain,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    count: 15,
    description: 'Chinh phục đỉnh núi, cắm trại trên cao',
  },
  {
    id: 'forest',
    name: 'Rừng',
    icon: Wind,
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    count: 12,
    description: 'Khám phá rừng nhiệt đới, trải nghiệm hoang dã',
  },
  {
    id: 'beach',
    name: 'Biển',
    icon: Waves,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
    count: 18,
    description: 'Cắm trại bên bờ biển, ngắm sao đêm',
  },
  {
    id: 'lake',
    name: 'Hồ',
    icon: Tent,
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
    count: 8,
    description: 'Cắm trại ven hồ, câu cá, đốt lửa trại',
  },
];

const mockPromos = [
  {
    id: 1,
    title: 'Giảm 20% Tour Đà Lạt',
    description:
      'Áp dụng cho đoàn từ 4 người trở lên. Bao gồm đầy đủ thiết bị cắm trại chuyên nghiệp.',
    discount: 20,
    validUntil: '31/12/2025',
    code: 'DALAT20',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
  },
  {
    id: 2,
    title: 'Ưu đãi mùa hè - Phú Quốc',
    description:
      'Giảm đến 30% cho booking sớm trước 1 tháng. Tour 3N2Đ trọn gói.',
    discount: 30,
    validUntil: '15/01/2026',
    code: 'SUMMER30',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
  },
  {
    id: 3,
    title: 'Combo cắm trại + Thiết bị',
    description:
      'Miễn phí thuê thiết bị khi đặt tour. Bao gồm lều, túi ngủ, bếp gas.',
    discount: 0,
    validUntil: '28/02/2026',
    code: 'COMBO2026',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800',
  },
];

const mockReviews = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    avatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    comment:
      'Trải nghiệm tuyệt vời! Đội ngũ hướng dẫn nhiệt tình, chuyên nghiệp. Địa điểm đẹp, thiết bị đầy đủ. Chắc chắn sẽ quay lại trong những chuyến đi tiếp theo.',
    tour: 'Tour Sapa 3N2Đ',
    date: '15/11/2025',
    location: 'Sapa',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    comment:
      'Dịch vụ chuyên nghiệp từ A-Z. Thiết bị cắm trại rất tốt, sạch sẽ. Gia đình mình rất hài lòng với chuyến đi này. Giá cả hợp lý, đáng đồng tiền bát gạo.',
    tour: 'Tour Đà Lạt 2N1Đ',
    date: '10/11/2025',
    location: 'Đà Lạt',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rating: 4,
    comment:
      'Phong cảnh đẹp, không khí trong lành. Hoạt động team building rất vui. Một trải nghiệm đáng nhớ cùng bạn bè!',
    tour: 'Tour Tây Nguyên 4N3Đ',
    date: '05/11/2025',
    location: 'Tây Nguyên',
  },
];

const features = [
  {
    icon: Shield,
    title: 'An toàn & Bảo hiểm',
    description:
      'Đảm bảo an toàn 100% cho mọi chuyến đi với bảo hiểm du lịch toàn diện',
  },
  {
    icon: Users,
    title: 'Hướng dẫn viên chuyên nghiệp',
    description: 'Đội ngũ HDV giàu kinh nghiệm, nhiệt tình, am hiểu địa phương',
  },
  {
    icon: ThumbsUp,
    title: 'Giá tốt nhất',
    description:
      'Cam kết giá tour tốt nhất thị trường, hoàn tiền nếu tìm được giá rẻ hơn',
  },
  {
    icon: TrendingUp,
    title: '10,000+ Khách hàng',
    description: 'Được tin tưởng và lựa chọn bởi hàng nghìn khách hàng mỗi năm',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <SearchSection />
      <FeaturedDestinations />

      {/* Tour Categories */}
      <section className="section-padding bg-linear-to-b from-white to-gray-50">
        <div className="container-padding mx-auto max-w-7xl">
          <RevealOnScroll>
            <div className="mb-12 text-center">
              <span className="bg-primary/10 text-primary mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold">
                Danh mục
              </span>
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                Phân Loại Tour Theo Địa Hình
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Chọn loại tour phù hợp với sở thích và mức độ thử thách bạn mong
                muốn
              </p>
            </div>
          </RevealOnScroll>
          <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {tourCategories.map(category => {
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
                        <p className="font-semibold">{category.count} tours</p>
                      </div>
                    </div>
                  </Card>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <FeaturedTours />
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
                Đừng bỏ lỡ những chương trình ưu đãi tốt nhất trong tháng
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
              <span className="bg-primary/10 text-primary mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold">
                Đánh giá
              </span>
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                Khách Hàng Nói Gì Về Chúng Tôi
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Hàng nghìn khách hàng đã tin tưởng và có trải nghiệm tuyệt vời
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
                      <span className="text-primary font-semibold">
                        {review.tour}
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
              <span className="bg-primary/10 text-primary mb-3 inline-block rounded-full px-4 py-1 text-sm font-semibold">
                Vì sao chọn chúng tôi
              </span>
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                Cam Kết Của Chúng Tôi
              </h2>
              <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                Những lý do khiến hàng nghìn khách hàng tin tưởng lựa chọn
              </p>
            </div>
          </RevealOnScroll>
          <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={index}>
                  <Card className="border-0 p-8 text-center shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl">
                    <div className="flex-center from-primary mx-auto mb-6 h-20 w-20 rounded-full bg-linear-to-br to-green-400 text-white shadow-lg">
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
