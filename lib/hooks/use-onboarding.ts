'use client';

import { useState, useEffect } from 'react';
import { onboardingService } from '@/lib/storage/onboarding';
import type { OnboardingStatus } from '@/lib/schemas/onboarding';

export function useOnboarding() {
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = () => {
      const currentStatus = onboardingService.get();
      setStatus(currentStatus);
      setLoading(false);
    };

    loadStatus();
  }, []);

  const updateStep = (step: OnboardingStatus['step']) => {
    onboardingService.updateStep(step);
    setStatus(onboardingService.get());
  };

  const complete = () => {
    onboardingService.complete();
    setStatus(onboardingService.get());
  };

  const skip = () => {
    onboardingService.skip();
    setStatus(onboardingService.get());
  };

  const reset = () => {
    onboardingService.reset();
    setStatus(onboardingService.get());
  };

  const needsOnboarding = () => {
    return onboardingService.needsOnboarding();
  };

  return {
    status,
    loading,
    updateStep,
    complete,
    skip,
    reset,
    needsOnboarding,
  };
}
