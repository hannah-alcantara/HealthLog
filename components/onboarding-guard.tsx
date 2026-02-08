'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useOnboarding } from '@/lib/hooks/use-onboarding';

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { needsOnboarding, loading } = useOnboarding();

  useEffect(() => {
    // Don't check onboarding if auth isn't loaded or user isn't signed in
    if (!isAuthLoaded || !isSignedIn) {
      return;
    }

    // Don't redirect if already on onboarding page or still loading
    if (loading || pathname === '/onboarding') {
      return;
    }

    // Check if user needs onboarding
    if (needsOnboarding()) {
      router.push('/onboarding');
    }
  }, [isAuthLoaded, isSignedIn, loading, pathname, router, needsOnboarding]);

  // Don't show loading for unauthenticated users
  if (!isAuthLoaded || !isSignedIn) {
    return <>{children}</>;
  }

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
