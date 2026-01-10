import { z } from 'zod';

/**
 * Symptom Schema
 * Represents a logged symptom with severity and context
 */
export const symptomSchema = z.object({
  id: z.string().uuid(),
  symptomType: z.string().min(1, 'Symptom type is required').max(200).trim(),
  severity: z.number().min(1, 'Severity must be at least 1').max(10, 'Severity cannot exceed 10'),
  bodyPart: z.string().max(100).nullable(),
  triggers: z.string().max(500).nullable(),
  notes: z.string().max(2000).nullable(),
  loggedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createSymptomSchema = symptomSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Symptom = z.infer<typeof symptomSchema>;
export type CreateSymptomInput = z.infer<typeof createSymptomSchema>;
