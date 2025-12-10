'use client';

import { useState, useEffect, useCallback } from 'react';
import { allergyService } from '@/lib/storage/medical-history';
import type { Allergy, CreateAllergyInput } from '@/lib/schemas/medical-history';

export function useAllergies() {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllergies = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const data = allergyService.getAll();
      setAllergies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load allergies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllergies();
  }, [loadAllergies]);

  const create = useCallback(async (input: CreateAllergyInput): Promise<Allergy> => {
    try {
      setError(null);
      const newAllergy = allergyService.create(input);
      setAllergies((prev) => [...prev, newAllergy]);
      return newAllergy;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create allergy';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const update = useCallback(async (id: string, input: Partial<CreateAllergyInput>): Promise<Allergy> => {
    try {
      setError(null);
      const updated = allergyService.update(id, input);
      setAllergies((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update allergy';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      allergyService.delete(id);
      setAllergies((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete allergy';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refresh = useCallback(() => {
    loadAllergies();
  }, [loadAllergies]);

  return {
    allergies,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  };
}
