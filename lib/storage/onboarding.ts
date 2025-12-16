import { OnboardingStatus, onboardingStatusSchema, defaultOnboardingStatus } from '@/lib/schemas/onboarding';

const STORAGE_KEY = 'onboarding_status';

/**
 * Onboarding storage service
 */
export const onboardingService = {
  /**
   * Get onboarding status
   */
  get(): OnboardingStatus {
    if (typeof window === 'undefined') {
      return defaultOnboardingStatus;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return defaultOnboardingStatus;
      }

      const parsed = JSON.parse(stored);
      return onboardingStatusSchema.parse(parsed);
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
      return defaultOnboardingStatus;
    }
  },

  /**
   * Save onboarding status
   */
  save(status: OnboardingStatus): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const validated = onboardingStatusSchema.parse(status);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      throw error;
    }
  },

  /**
   * Mark onboarding as completed
   */
  complete(): void {
    const status: OnboardingStatus = {
      completed: true,
      skipped: false,
      completedAt: new Date().toISOString(),
      step: 'complete',
    };
    this.save(status);
  },

  /**
   * Mark onboarding as skipped
   */
  skip(): void {
    const status: OnboardingStatus = {
      completed: false,
      skipped: true,
      completedAt: new Date().toISOString(),
      step: 'complete',
    };
    this.save(status);
  },

  /**
   * Update current step
   */
  updateStep(step: OnboardingStatus['step']): void {
    const current = this.get();
    this.save({ ...current, step });
  },

  /**
   * Reset onboarding status
   */
  reset(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Check if user needs onboarding
   */
  needsOnboarding(): boolean {
    const status = this.get();
    return !status.completed && !status.skipped;
  },
};
