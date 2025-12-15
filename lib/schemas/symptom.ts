import { z } from 'zod';

/**
 * Symptom Categories
 */
export const symptomCategories = [
  'pain',
  'digestive',
  'respiratory',
  'neurological',
  'skin',
  'mental-health',
  'other',
] as const;

export const symptomCategoryLabels: Record<typeof symptomCategories[number], string> = {
  pain: 'Pain',
  digestive: 'Digestive',
  respiratory: 'Respiratory',
  neurological: 'Neurological',
  skin: 'Skin',
  'mental-health': 'Mental Health',
  other: 'Other',
};

/**
 * Symptom Schema
 * Represents a logged symptom with severity, category, and context
 */
export const symptomSchema = z.object({
  id: z.string().uuid(),
  symptomType: z.string().min(1, 'Symptom type is required').max(200).trim(),
  category: z.enum(symptomCategories),
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

export type SymptomCategory = typeof symptomCategories[number];
export type Symptom = z.infer<typeof symptomSchema>;
export type CreateSymptomInput = z.infer<typeof createSymptomSchema>;
