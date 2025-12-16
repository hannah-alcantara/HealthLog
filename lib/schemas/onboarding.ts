import { z } from 'zod';

/**
 * Onboarding status schema
 */
export const onboardingStatusSchema = z.object({
  completed: z.boolean(),
  skipped: z.boolean(),
  completedAt: z.string().datetime().nullable(),
  step: z.enum(['welcome', 'conditions', 'medications', 'allergies', 'complete']),
});

export type OnboardingStatus = z.infer<typeof onboardingStatusSchema>;

/**
 * Default onboarding status
 */
export const defaultOnboardingStatus: OnboardingStatus = {
  completed: false,
  skipped: false,
  completedAt: null,
  step: 'welcome',
};
