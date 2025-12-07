import { ModeToggle } from '@/components/mode-toggle';
import Image from 'next/image';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Mode Toggle */}
      <div className="absolute top-2 right-2 z-10">
        <ModeToggle />
      </div>

      {/* Left Section - Camping Theme (Hidden on mobile) */}
      <section className="bg-background relative hidden h-full w-full overflow-hidden lg:flex">
        <div className="relative h-full w-full rounded-r-3xl">
          <Image
            src="/assets/images/auth-banner.jpg"
            alt="banner"
            fill
            className="rounded-r-3xl object-cover"
          />
        </div>
      </section>

      {/* Right Section - Auth Form */}
      <section className="bg-background flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </div>
  );
};

export default Layout;
