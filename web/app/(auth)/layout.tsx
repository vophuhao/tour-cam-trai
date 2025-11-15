import { ModeToggle } from '@/components/mode-toggle';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Mode Toggle */}
      <div className="absolute top-2 right-2 z-10">
        <ModeToggle />
      </div>

      {/* Left Section - Camping Theme (Hidden on mobile) */}
      <section className="bg-primary hidden lg:flex"></section>

      {/* Right Section - Auth Form */}
      <section className="bg-background flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </div>
  );
};

export default Layout;
