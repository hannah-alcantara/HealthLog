import { z } from 'zod';

/**
 * Symptom Zod Schema for client-side validation (Convex)
 *
 * Mirrors the Convex schema in convex/schema.ts but adds client-side validation rules.
 *
 * Validation Rules:
 * - symptomType: 1-200 characters, trimmed, required
 * - severity: Integer 1-10, required
 * - triggers: Max 500 characters, trimmed, optional
 * - notes: Max 2000 characters, trimmed, optional
 * - loggedAt: Unix timestamp (milliseconds), required
 */
export const symptomSchema = z.object({
  symptomType: z
    .string()
    .min(1, 'Symptom type is required')
    .max(200, 'Symptom type must be 200 characters or less')
    .trim(),

  severity: z
    .number()
    .int('Severity must be a whole number')
    .min(1, 'Severity must be at least 1')
    .max(10, 'Severity cannot exceed 10'),

  triggers: z
    .string()
    .max(500, 'Triggers must be 500 characters or less')
    .trim()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val)
    .optional(),

  notes: z
    .string()
    .max(2000, 'Notes must be 2000 characters or less')
    .trim()
    .or(z.literal(''))
    .transform(val => val === '' ? undefined : val)
    .optional(),

  loggedAt: z
    .number()
    .positive('Logged date must be a valid timestamp'),
});

/**
 * Form schema - same as symptomSchema, used for form validation
 * Use this for react-hook-form with date pickers
 */
export const createSymptomSchema = symptomSchema;

/**
 * TypeScript type inferred from symptom schema
 * Use this for Convex mutations
 */
export type CreateSymptomInput = {
  symptomType: string;
  severity: number;
  triggers?: string;
  notes?: string;
  loggedAt: number;
};

/**
 * TypeScript type for form inputs (before transformation)
 */
export type CreateSymptomFormInput = {
  symptomType: string;
  severity: number;
  triggers?: string | null;
  notes?: string | null;
  loggedAt: string;
};

/**
 * Symptom entity with Convex database fields
 * Includes Convex-generated fields: _id, _creationTime, userId
 */
export interface Symptom extends CreateSymptomInput {
  _id: string;
  _creationTime: number;
  userId: string;
}
