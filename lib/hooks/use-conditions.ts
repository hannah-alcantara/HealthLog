'use client';

import { useState, useEffect, useCallback } from 'react';
import { conditionService } from '@/lib/storage/medical-history';
import type { Condition, CreateConditionInput } from '@/lib/schemas/medical-history';

export function useConditions() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConditions = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      const data = conditionService.getAll();
      setConditions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conditions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConditions();
  }, [loadConditions]);

  const create = useCallback(async (input: CreateConditionInput): Promise<Condition> => {
    try {
      setError(null);
      const newCondition = conditionService.create(input);
      setConditions((prev) => [...prev, newCondition]);
      return newCondition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create condition';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const update = useCallback(async (id: string, input: Partial<CreateConditionInput>): Promise<Condition> => {
    try {
      setError(null);
      const updated = conditionService.update(id, input);
      setConditions((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update condition';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      conditionService.delete(id);
      setConditions((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete condition';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const refresh = useCallback(() => {
    loadConditions();
  }, [loadConditions]);

  return {
    conditions,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
  };
}
