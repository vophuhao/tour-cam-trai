import Footer from '@/components/footer';
import Header from '@/components/header';
import { Providers } from '@/components/providers';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Campo',
  description: 'Rời phố về rừng thôi!',
};

// Header loading fallback
function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="hidden gap-6 md:flex">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-16 animate-pulse rounded bg-gray-200"
              />
            ))}
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-10 animate-pulse rounded bg-gray-200" />
            <div className="hidden h-10 w-24 animate-pulse rounded bg-gray-200 md:block" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Suspense fallback={<HeaderSkeleton />}>
            <Header />
          </Suspense>
          {children}
          <Footer />
        </Providers>

        <Toaster position="top-center" />
      </body>
    </html>
  );
}
