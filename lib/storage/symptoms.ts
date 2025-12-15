import { z } from 'zod';
import { BaseStorage } from './base';
import {
  type Symptom,
  type CreateSymptomInput,
  symptomSchema,
} from '../schemas/symptom';

// Storage instance
const symptomsStorage = new BaseStorage(
  'health-log:symptoms',
  z.array(symptomSchema),
  'Symptom'
);

/**
 * Symptom CRUD operations
 */
export const symptomService = {
  getAll(): Symptom[] {
    return symptomsStorage.getAll();
  },

  getById(id: string): Symptom | null {
    return symptomsStorage.getById(id);
  },

  create(input: CreateSymptomInput): Symptom {
    const symptom: Symptom = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return symptomsStorage.create(symptom);
  },

  update(id: string, input: Partial<CreateSymptomInput>): Symptom {
    return symptomsStorage.update(id, input);
  },

  delete(id: string): void {
    symptomsStorage.delete(id);
  },

  deleteAll(): void {
    symptomsStorage.deleteAll();
  },

  count(): number {
    return symptomsStorage.count();
  },

  /**
   * Get all symptoms sorted by loggedAt in descending order (newest first)
   */
  getAllSorted(): Symptom[] {
    const symptoms = symptomsStorage.getAll();
    return symptoms.sort((a, b) => {
      const dateA = new Date(a.loggedAt).getTime();
      const dateB = new Date(b.loggedAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  },

  /**
   * Get symptoms within a date range
   */
  getByDateRange(startDate: Date, endDate: Date): Symptom[] {
    const symptoms = this.getAllSorted();
    return symptoms.filter((symptom) => {
      const loggedDate = new Date(symptom.loggedAt);
      return loggedDate >= startDate && loggedDate <= endDate;
    });
  },

  /**
   * Get symptoms from the last N days
   */
  getRecentDays(days: number): Symptom[] {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return this.getByDateRange(startDate, endDate);
  },

  /**
   * Get symptom statistics
   */
  getStats(): {
    total: number;
    averageSeverity: number;
    mostCommonSymptom: string | null;
    mostCommonCategory: string | null;
  } {
    const symptoms = symptomsStorage.getAll();

    if (symptoms.length === 0) {
      return {
        total: 0,
        averageSeverity: 0,
        mostCommonSymptom: null,
        mostCommonCategory: null,
      };
    }

    // Calculate average severity
    const totalSeverity = symptoms.reduce((sum, s) => sum + s.severity, 0);
    const averageSeverity = Math.round((totalSeverity / symptoms.length) * 10) / 10;

    // Find most common symptom type
    const symptomCounts: Record<string, number> = {};
    symptoms.forEach((s) => {
      symptomCounts[s.symptomType] = (symptomCounts[s.symptomType] || 0) + 1;
    });
    const mostCommonSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Find most common category
    const categoryCounts: Record<string, number> = {};
    symptoms.forEach((s) => {
      categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
    });
    const mostCommonCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      total: symptoms.length,
      averageSeverity,
      mostCommonSymptom,
      mostCommonCategory,
    };
  },
};
