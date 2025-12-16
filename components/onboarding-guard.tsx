'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useOnboarding } from '@/lib/hooks/use-onboarding';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { needsOnboarding, loading } = useOnboarding();

  useEffect(() => {
    // Don't redirect if already on onboarding page or still loading
    if (loading || pathname === '/onboarding') {
      return;
    }

    // Check if user needs onboarding
    if (needsOnboarding()) {
      router.push('/onboarding');
    }
  }, [loading, pathname, router, needsOnboarding]);

  // Show loading state while checking onboarding status
  if (loading && pathname !== '/onboarding') {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
