import { z } from 'zod';

/**
 * Appointment Zod Schema for client-side validation (Convex)
 *
 * Mirrors the Convex schema in convex/schema.ts but adds client-side validation rules.
 *
 * Validation Rules:
 * - date: Unix timestamp (milliseconds), required
 * - doctorName: 1-200 characters, trimmed, required
 * - reason: 1-500 characters, trimmed, required
 * - symptoms: Max 2000 characters, trimmed, optional
 * - notes: Max 2000 characters, trimmed, optional
 * - generatedQuestions: Array of strings, optional
 */
export const appointmentSchema = z.object({
  date: z
    .number()
    .positive('Appointment date must be a valid timestamp'),

  doctorName: z
    .string()
    .min(1, 'Doctor name is required')
    .max(200, 'Doctor name must be 200 characters or less')
    .trim(),

  reason: z
    .string()
    .min(1, 'Reason for visit is required')
    .max(500, 'Reason must be 500 characters or less')
    .trim(),

  symptoms: z
    .string()
    .max(2000, 'Symptoms must be 2000 characters or less')
    .trim()
    .optional(),

  notes: z
    .string()
    .max(2000, 'Notes must be 2000 characters or less')
    .trim()
    .optional(),

  generatedQuestions: z
    .array(z.string())
    .optional(),
});

/**
 * TypeScript type inferred from appointment schema
 * Use this for form data and component props
 */
export type CreateAppointmentInput = z.infer<typeof appointmentSchema>;

/**
 * Appointment entity with Convex database fields
 * Includes Convex-generated fields: _id, _creationTime, userId
 */
export interface Appointment extends CreateAppointmentInput {
  _id: string;
  _creationTime: number;
  userId: string;
}
