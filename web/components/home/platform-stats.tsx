import { Award, Star, Tent, Users } from 'lucide-react';
import RevealOnScroll from '../reveal-on-scroll';
import { StaggerContainer, StaggerItem } from '../stagger-animation';
import { Card } from '../ui/card';

interface PlatformStatsProps {
  stats: {
    totalProperties: number;
    totalBookings: number;
    totalReviews: number;
    averageRating: number;
  };
}

/**
 * PlatformStats Component (Server Component)
 * Displays key platform statistics with animations
 */
export default function PlatformStats({ stats }: PlatformStatsProps) {
  const displayStats = [
    {
      icon: Tent,
      label: 'Địa điểm cắm trại',
      value: `${stats.totalProperties}+`,
      color: 'emerald',
    },
    {
      icon: Users,
      label: 'Lượt đặt chỗ',
      value: `${(stats.totalBookings / 1000).toFixed(0)}K+`,
      color: 'blue',
    },
    {
      icon: Star,
      label: 'Đánh giá',
      value: `${(stats.totalReviews / 1000).toFixed(0)}K+`,
      color: 'yellow',
    },
    {
      icon: Award,
      label: 'Điểm trung bình',
      value: stats.averageRating.toFixed(1),
      color: 'purple',
    },
  ];

  return (
    <section className="section-padding bg-emerald-600">
      <div className="container-padding mx-auto max-w-7xl">
        <RevealOnScroll>
          <div className="mb-12 text-center text-white">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">
              Được Hàng Ngàn Người Tin Tưởng
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-emerald-100">
              Nền tảng đặt chỗ cắm trại hàng đầu Việt Nam
            </p>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={index}>
                <Card className="border-0 bg-white/10 p-8 text-center backdrop-blur-sm transition-all hover:-translate-y-2 hover:bg-white/20">
                  <div className="flex-center mx-auto mb-6 h-20 w-20 rounded-full bg-white/20">
                    <Icon className="h-10 w-10 text-white" />
                  </div>
                  <div className="mb-2 text-5xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-lg text-emerald-100">{stat.label}</div>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
