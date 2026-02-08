'use client';

import { useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import type { Appointment, CreateAppointmentInput } from '@/lib/schemas/appointment';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * React hook for managing appointment data with Convex real-time sync.
 *
 * Provides CRUD operations for appointments with automatic state management,
 * real-time updates, and error handling. Appointments are automatically sorted
 * by date from the backend.
 *
 * @returns Object containing appointments array, CRUD methods, and state flags
 *
 * @example
 * ```tsx
 * const { appointments, create, update, remove, loading } = useAppointments();
 *
 * // Create new appointment
 * await create({
 *   doctorName: 'Dr. Smith',
 *   date: Date.now(),
 *   reason: 'Check-up',
 *   symptoms: 'Persistent headaches'
 * });
 * ```
 */
export function useAppointments() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();

  // Only query when in browser AND auth is loaded AND user is signed in
  const isBrowser = typeof window !== 'undefined';
  const shouldQuery = isBrowser && isAuthLoaded && isSignedIn;

  const appointments = useQuery(
    api.appointments.getAll,
    shouldQuery ? {} : 'skip'
  );

  const loading = !isAuthLoaded || appointments === undefined;

  // Mutations
  const createMutation = useMutation(api.appointments.create);
  const updateMutation = useMutation(api.appointments.update);
  const removeMutation = useMutation(api.appointments.remove);

  const create = useCallback(
    async (input: CreateAppointmentInput): Promise<void> => {
      await createMutation(input);
    },
    [createMutation]
  );

  const update = useCallback(
    async (id: string, input: Partial<CreateAppointmentInput>): Promise<void> => {
      await updateMutation({
        id: id as Id<'appointments'>,
        ...input,
      });
    },
    [updateMutation]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      await removeMutation({ id: id as Id<'appointments'> });
    },
    [removeMutation]
  );

  const refresh = useCallback(() => {
    // Convex handles real-time updates automatically
  }, []);

  return {
    appointments: appointments ?? [],
    loading,
    error: null, // Convex handles errors via mutations throwing
    create,
    update,
    remove,
    refresh,
  };
}
