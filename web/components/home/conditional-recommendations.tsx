'use client';

import { useAuthStore } from '@/store/auth.store';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import to avoid SSR issues with auth check
const RecommendedProperties = dynamic(
  () => import('./recommended-properties'),
  { ssr: false },
);

/**
 * ConditionalRecommendations Component
 *
 * Client-side wrapper that conditionally renders personalized recommendations
 * only for authenticated users who have booking history.
 *
 * This component:
 * - Checks user authentication status from Zustand store
 * - Only renders RecommendedProperties for logged-in users
 * - Returns null for unauthenticated users (no UI flash)
 * - Handles hydration properly with useEffect
 */
export default function ConditionalRecommendations() {
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders on client after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything during SSR or before hydration
  if (!mounted) {
    return null;
  }

  // Only show recommendations for authenticated users
  if (!isAuthenticated) {
    return null;
  }

  return <RecommendedProperties />;
}
