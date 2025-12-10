import { z } from 'zod';

/**
 * Condition Schema
 * Represents a diagnosed health condition
 */
export const conditionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Condition name is required').max(200).trim(),
  diagnosisDate: z.string().datetime().nullable(),
  notes: z.string().max(1000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createConditionSchema = conditionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Condition = z.infer<typeof conditionSchema>;
export type CreateConditionInput = z.infer<typeof createConditionSchema>;

/**
 * Medication Schema
 * Represents a prescription or OTC medication
 */
export const medicationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Medication name is required').max(200).trim(),
  dosage: z.string().min(1, 'Dosage is required').max(100).trim(),
  frequency: z.string().min(1, 'Frequency is required').max(100).trim(),
  startDate: z.string().datetime().nullable(),
  notes: z.string().max(1000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createMedicationSchema = medicationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Medication = z.infer<typeof medicationSchema>;
export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;

/**
 * Allergy Schema
 * Represents a known allergen with severity and reaction info
 */
export const allergySeveritySchema = z.enum(['mild', 'moderate', 'severe']);

export const allergySchema = z.object({
  id: z.string().uuid(),
  allergen: z.string().min(1, 'Allergen name is required').max(200).trim(),
  severity: allergySeveritySchema.nullable(),
  reaction: z.string().max(500).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createAllergySchema = allergySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AllergySeverity = z.infer<typeof allergySeveritySchema>;
export type Allergy = z.infer<typeof allergySchema>;
export type CreateAllergyInput = z.infer<typeof createAllergySchema>;
