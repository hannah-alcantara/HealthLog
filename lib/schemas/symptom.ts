import { z } from 'zod';

/**
 * Symptom Zod Schema for client-side validation (Convex)
 *
 * Mirrors the Convex schema in convex/schema.ts but adds client-side validation rules.
 *
 * Validation Rules:
 * - symptomType: 1-200 characters, trimmed, required
 * - severity: Integer 1-10, required
 * - bodyPart: Max 100 characters, trimmed, optional
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

  bodyPart: z
    .string()
    .max(100, 'Body part must be 100 characters or less')
    .trim()
    .optional(),

  triggers: z
    .string()
    .max(500, 'Triggers must be 500 characters or less')
    .trim()
    .optional(),

  notes: z
    .string()
    .max(2000, 'Notes must be 2000 characters or less')
    .trim()
    .optional(),

  loggedAt: z
    .number()
    .positive('Logged date must be a valid timestamp'),
});

/**
 * TypeScript type inferred from symptom schema
 * Use this for form data and component props
 */
export type CreateSymptomInput = z.infer<typeof symptomSchema>;

/**
 * Symptom entity with Convex database fields
 * Includes Convex-generated fields: _id, _creationTime, userId
 */
export interface Symptom extends CreateSymptomInput {
  _id: string;
  _creationTime: number;
  userId: string;
}
