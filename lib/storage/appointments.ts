import { z } from 'zod';
import { BaseStorage } from './base';
import {
  type Appointment,
  type CreateAppointmentInput,
  appointmentSchema,
} from '../schemas/appointment';

// Storage instance
const appointmentsStorage = new BaseStorage(
  'health-log:appointments',
  z.array(appointmentSchema),
  'Appointment'
);

/**
 * Appointment CRUD operations
 */
export const appointmentService = {
  getAll(): Appointment[] {
    return appointmentsStorage.getAll();
  },

  getById(id: string): Appointment | null {
    return appointmentsStorage.getById(id);
  },

  create(input: CreateAppointmentInput): Appointment {
    const appointment: Appointment = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return appointmentsStorage.create(appointment);
  },

  update(id: string, input: Partial<CreateAppointmentInput>): Appointment {
    return appointmentsStorage.update(id, input);
  },

  delete(id: string): void {
    appointmentsStorage.delete(id);
  },

  deleteAll(): void {
    appointmentsStorage.deleteAll();
  },

  count(): number {
    return appointmentsStorage.count();
  },
};
