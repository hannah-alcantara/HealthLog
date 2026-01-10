import type { Symptom } from '@/lib/schemas/symptom';

/**
 * Filter criteria for symptom search and display.
 *
 * All fields are optional and combined with AND logic.
 * searchText searches across multiple fields (type, body part, notes, triggers).
 */
export interface SymptomFilters {
  /** Text search across symptom fields (case-insensitive) */
  searchText?: string;
  /** Minimum severity level (1-10 inclusive) */
  minSeverity?: number;
  /** Maximum severity level (1-10 inclusive) */
  maxSeverity?: number;
  /** Filter symptoms after this date (inclusive) */
  startDate?: Date;
  /** Filter symptoms before this date (inclusive) */
  endDate?: Date;
  /** Exact body part match (case-insensitive) */
  bodyPart?: string;
}

/**
 * Available sort options for symptom lists.
 */
export type SortOption = 'date-desc' | 'date-asc' | 'severity-desc' | 'severity-asc' | 'type-asc';

/**
 * Filter symptoms based on provided criteria.
 *
 * Applies multiple filter criteria using AND logic. All filters are optional.
 * Text search is case-insensitive and searches across symptomType,
 * bodyPart, notes, and triggers fields.
 *
 * @param symptoms - Array of symptoms to filter
 * @param filters - Filter criteria object
 * @returns Filtered array of symptoms
 *
 * @example
 * ```ts
 * const filtered = filterSymptoms(allSymptoms, {
 *   minSeverity: 7,
 *   startDate: new Date('2024-01-01')
 * });
 * ```
 */
export function filterSymptoms(symptoms: Symptom[], filters: SymptomFilters): Symptom[] {
  return symptoms.filter((symptom) => {
    // Search text filter (searches symptomType, bodyPart, notes, triggers)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const matchesSearch =
        symptom.symptomType.toLowerCase().includes(searchLower) ||
        symptom.bodyPart?.toLowerCase().includes(searchLower) ||
        symptom.notes?.toLowerCase().includes(searchLower) ||
        symptom.triggers?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
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
 * Sort symptoms based on selected option.
 *
 * Creates a shallow copy of the array before sorting (non-mutating).
 *
 * @param symptoms - Array of symptoms to sort
 * @param sortOption - Sort criteria (date or severity, ascending or descending, or alphabetical by type)
 * @returns New sorted array of symptoms
 *
 * @example
 * ```ts
 * const sorted = sortSymptoms(symptoms, 'severity-desc'); // Most severe first
 * ```
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
 * Get unique body parts from symptoms for filter dropdown.
 *
 * Extracts all non-null body parts, deduplicates, and sorts alphabetically.
 * Useful for populating filter UI dropdowns.
 *
 * @param symptoms - Array of symptoms to extract body parts from
 * @returns Sorted array of unique body part strings
 */
export function getUniqueBodyParts(symptoms: Symptom[]): string[] {
  const bodyParts = symptoms
    .map(s => s.bodyPart)
    .filter((part): part is string => part !== null && part !== undefined);

  return Array.from(new Set(bodyParts)).sort();
}

