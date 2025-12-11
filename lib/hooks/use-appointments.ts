'use client';

import { useState, useEffect, useCallback } from 'react';
import { appointmentService } from '@/lib/storage/appointments';
import type { Appointment, CreateAppointmentInput } from '@/lib/schemas/appointment';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const data = appointmentService.getAllSorted();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const create = useCallback(async (input: CreateAppointmentInput): Promise<Appointment> => {
    try {
      setError(null);
      const newAppointment = appointmentService.create(input);
      setAppointments((prev) => [newAppointment, ...prev]); // Add to beginning (newest first)
      return newAppointment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const update = useCallback(
    async (id: string, input: Partial<CreateAppointmentInput>): Promise<Appointment> => {
      try {
        setError(null);
        const updatedAppointment = appointmentService.update(id, input);
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment.id === id ? updatedAppointment : appointment
          )
        );
        // Re-sort after update in case appointmentDate changed
        const sorted = appointmentService.getAllSorted();
        setAppointments(sorted);
        return updatedAppointment;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update appointment';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      appointmentService.delete(id);
      setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete appointment';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refresh = useCallback(() => {
    loadAppointments();
  }, [loadAppointments]);

  return {
    appointments,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  };
}
