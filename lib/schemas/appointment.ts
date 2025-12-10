import { z } from 'zod';

/**
 * Appointment Schema
 * Represents a past medical visit with doctor, date, reason, and notes
 */
export const appointmentSchema = z.object({
  id: z.string().uuid(),
  appointmentDate: z.string().datetime(),
  doctorName: z.string().min(1, 'Doctor name is required').max(200).trim(),
  reason: z.string().min(1, 'Reason for visit is required').max(500).trim(),
  notes: z.string().max(2000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createAppointmentSchema = appointmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Appointment = z.infer<typeof appointmentSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
