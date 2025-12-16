import type { Symptom } from '@/lib/schemas/symptom';

export interface SymptomFilters {
  searchText?: string;
  category?: string;
  minSeverity?: number;
  maxSeverity?: number;
  startDate?: Date;
  endDate?: Date;
  bodyPart?: string;
}

export type SortOption = 'date-desc' | 'date-asc' | 'severity-desc' | 'severity-asc' | 'type-asc';

/**
 * Filter symptoms based on provided criteria
 */
export function filterSymptoms(symptoms: Symptom[], filters: SymptomFilters): Symptom[] {
  return symptoms.filter((symptom) => {
    // Search text filter (searches symptomType, category, bodyPart, notes, triggers)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const matchesSearch =
        symptom.symptomType.toLowerCase().includes(searchLower) ||
        symptom.category.toLowerCase().includes(searchLower) ||
        symptom.bodyPart?.toLowerCase().includes(searchLower) ||
        symptom.notes?.toLowerCase().includes(searchLower) ||
        symptom.triggers?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Category filter
    if (filters.category && symptom.category !== filters.category) {
      return false;
    }

    // Severity range filter
    if (filters.minSeverity !== undefined && symptom.severity < filters.minSeverity) {
      return false;
    }
    if (filters.maxSeverity !== undefined && symptom.severity > filters.maxSeverity) {
      return false;
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      const symptomDate = new Date(symptom.loggedAt);

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        if (symptomDate < start) return false;
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (symptomDate > end) return false;
      }
    }

    // Body part filter
    if (filters.bodyPart && symptom.bodyPart !== filters.bodyPart) {
      return false;
    }

    return true;
  });
}

/**
 * Sort symptoms based on selected option
 */
export function sortSymptoms(symptoms: Symptom[], sortOption: SortOption): Symptom[] {
  const sorted = [...symptoms];

  switch (sortOption) {
    case 'date-desc':
      return sorted.sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());

    case 'date-asc':
      return sorted.sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

    case 'severity-desc':
      return sorted.sort((a, b) => b.severity - a.severity);

    case 'severity-asc':
      return sorted.sort((a, b) => a.severity - b.severity);

    case 'type-asc':
      return sorted.sort((a, b) => a.symptomType.localeCompare(b.symptomType));

    default:
      return sorted;
  }
}

/**
 * Get unique body parts from symptoms
 */
export function getUniqueBodyParts(symptoms: Symptom[]): string[] {
  const bodyParts = symptoms
    .map(s => s.bodyPart)
    .filter((part): part is string => part !== null && part !== undefined);

  return Array.from(new Set(bodyParts)).sort();
}

/**
 * Get unique categories from symptoms
 */
export function getUniqueCategories(symptoms: Symptom[]): string[] {
  const categories = symptoms.map(s => s.category);
  return Array.from(new Set(categories)).sort();
}
