'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/convex/_generated/api';
import type { Symptom, CreateSymptomInput } from '@/lib/schemas/symptom';
import type { Id } from '@/convex/_generated/dataModel';

/**
 * React hook for managing symptom data with Convex real-time sync.
 *
 * Provides CRUD operations for symptoms with automatic state management,
 * real-time updates, and error handling. Symptoms are automatically sorted
 * by date (newest first) from the backend.
 *
 * @returns Object containing symptoms array, CRUD methods, and state flags
 *
 * @example
 * ```tsx
 * const { symptoms, create, update, remove, loading } = useSymptoms();
 *
 * // Create new symptom
 * await create({ symptomType: 'Headache', severity: 7, loggedAt: Date.now() });
 *
 * // Get recent symptoms
 * const recent = getRecentDays(7);
 * ```
 */
export function useSymptoms() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();

  // Only query when in browser AND auth is loaded AND user is signed in
  const isBrowser = typeof window !== 'undefined';
  const shouldQuery = isBrowser && isAuthLoaded && isSignedIn;

  const symptoms = useQuery(
    api.symptoms.getAll,
    shouldQuery ? {} : 'skip'
  );

  const loading = !isAuthLoaded || symptoms === undefined;

  // Mutations
  const createMutation = useMutation(api.symptoms.create);
  const updateMutation = useMutation(api.symptoms.update);
  const removeMutation = useMutation(api.symptoms.remove);

  const create = useCallback(
    async (input: CreateSymptomInput): Promise<void> => {
      // Filter out undefined fields to prevent them being sent as null over the network
      const cleanInput: any = {
        symptomType: input.symptomType,
        severity: input.severity,
        loggedAt: input.loggedAt,
      };

      if (input.triggers !== undefined) cleanInput.triggers = input.triggers;
      if (input.notes !== undefined) cleanInput.notes = input.notes;

      await createMutation(cleanInput);
    },
    [createMutation]
  );

  const update = useCallback(
    async (id: string, input: Partial<CreateSymptomInput>): Promise<void> => {
      await updateMutation({
        id: id as Id<'symptoms'>,
        ...input,
      });
    },
    [updateMutation]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      await removeMutation({ id: id as Id<'symptoms'> });
    },
    [removeMutation]
  );

  const refresh = useCallback(() => {
    // Convex handles real-time updates automatically, no manual refresh needed
  }, []);

  const getRecentDays = useCallback(
    (days: number): Symptom[] => {
      if (!symptoms) return [];
      const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;
      return symptoms.filter((symptom) => symptom.loggedAt >= cutoffDate);
    },
    [symptoms]
  );

  const getStats = useCallback(() => {
    if (!symptoms || symptoms.length === 0) {
      return {
        total: 0,
        avgSeverity: 0,
        mostCommon: null as string | null,
      };
    }

    const avgSeverity =
      symptoms.reduce((sum, s) => sum + s.severity, 0) / symptoms.length;

    const typeCounts = symptoms.reduce(
      (acc, s) => {
        acc[s.symptomType] = (acc[s.symptomType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostCommon = Object.entries(typeCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] ?? null;

    return {
      total: symptoms.length,
      avgSeverity: Math.round(avgSeverity * 10) / 10,
      mostCommon,
    };
  }, [symptoms]);

  return {
    symptoms: symptoms ?? [],
    loading,
    error: null, // Convex handles errors via mutations throwing
    create,
    update,
    remove,
    refresh,
    getRecentDays,
    getStats,
  };
}
