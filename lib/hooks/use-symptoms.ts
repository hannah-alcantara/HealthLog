'use client';

import { useState, useEffect, useCallback } from 'react';
import { symptomService } from '@/lib/storage/symptoms';
import type { Symptom, CreateSymptomInput } from '@/lib/schemas/symptom';

/**
 * React hook for managing symptom data with localStorage persistence.
 *
 * Provides CRUD operations for symptoms with automatic state management,
 * error handling, and loading states. Symptoms are automatically sorted
 * by date (newest first) after creation and updates.
 *
 * @returns Object containing symptoms array, CRUD methods, and state flags
 *
 * @example
 * ```tsx
 * const { symptoms, create, update, remove, loading, error } = useSymptoms();
 *
 * // Create new symptom
 * await create({ symptomType: 'Headache', severity: 7, category: 'pain' });
 *
 * // Get recent symptoms
 * const recentWeek = getRecentDays(7);
 * ```
 */
export function useSymptoms() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSymptoms = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const data = symptomService.getAllSorted();
      setSymptoms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load symptoms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSymptoms();
  }, [loadSymptoms]);

  const create = useCallback(async (input: CreateSymptomInput): Promise<Symptom> => {
    try {
      setError(null);
      const newSymptom = symptomService.create(input);
      setSymptoms((prev) => [newSymptom, ...prev]); // Add to beginning (newest first)
      return newSymptom;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create symptom';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const update = useCallback(
    async (id: string, input: Partial<CreateSymptomInput>): Promise<Symptom> => {
      try {
        setError(null);
        const updatedSymptom = symptomService.update(id, input);
        setSymptoms((prev) =>
          prev.map((symptom) => (symptom.id === id ? updatedSymptom : symptom))
        );
        // Re-sort after update in case loggedAt changed
        const sorted = symptomService.getAllSorted();
        setSymptoms(sorted);
        return updatedSymptom;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update symptom';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      symptomService.delete(id);
      setSymptoms((prev) => prev.filter((symptom) => symptom.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete symptom';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refresh = useCallback(() => {
    loadSymptoms();
  }, [loadSymptoms]);

  const getRecentDays = useCallback((days: number): Symptom[] => {
    return symptomService.getRecentDays(days);
  }, []);

  const getStats = useCallback(() => {
    return symptomService.getStats();
  }, []);

  return {
    symptoms,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
    getRecentDays,
    getStats,
  };
}
