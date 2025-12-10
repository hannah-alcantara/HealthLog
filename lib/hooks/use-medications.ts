'use client';

import { useState, useEffect, useCallback } from 'react';
import { medicationService } from '@/lib/storage/medical-history';
import type { Medication, CreateMedicationInput } from '@/lib/schemas/medical-history';

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMedications = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const data = medicationService.getAll();
      setMedications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedications();
  }, [loadMedications]);

  const create = useCallback(async (input: CreateMedicationInput): Promise<Medication> => {
    try {
      setError(null);
      const newMedication = medicationService.create(input);
      setMedications((prev) => [...prev, newMedication]);
      return newMedication;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create medication';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const update = useCallback(async (id: string, input: Partial<CreateMedicationInput>): Promise<Medication> => {
    try {
      setError(null);
      const updated = medicationService.update(id, input);
      setMedications((prev) => prev.map((m) => (m.id === id ? updated : m)));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update medication';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      medicationService.delete(id);
      setMedications((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete medication';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refresh = useCallback(() => {
    loadMedications();
  }, [loadMedications]);

  return {
    medications,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  };
}
