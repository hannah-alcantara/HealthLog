/**
 * Storage Service Contracts
 *
 * TypeScript interfaces defining the contracts for storage services and custom hooks.
 * These interfaces ensure consistent CRUD operations across all entity types.
 */

/**
 * Generic CRUD operations for any entity type
 */
export interface StorageService<T, TCreate> {
  /**
   * Load all entities from storage
   * @returns Array of entities, empty array if none exist
   * @throws Error if storage is unavailable or data is corrupted
   */
  load(): T[];

  /**
   * Create a new entity
   * @param input - Data for creating the entity (without id, createdAt, updatedAt)
   * @returns The created entity with auto-generated fields
   * @throws Error if validation fails or storage quota exceeded
   */
  create(input: TCreate): T;

  /**
   * Update an existing entity
   * @param id - Entity ID to update
   * @param updates - Partial updates to apply
   * @returns The updated entity
   * @throws Error if entity not found, validation fails, or storage quota exceeded
   */
  update(id: string, updates: Partial<TCreate>): T;

  /**
   * Delete an entity
   * @param id - Entity ID to delete
   * @throws Error if entity not found
   */
  delete(id: string): void;

  /**
   * Find a single entity by ID
   * @param id - Entity ID to find
   * @returns The entity if found, undefined otherwise
   */
  findById(id: string): T | undefined;

  /**
   * Save an array of entities to storage
   * @param entities - Array of entities to save
   * @throws Error if storage quota exceeded
   */
  save(entities: T[]): void;
}

/**
 * Condition storage service interface
 */
export interface ConditionStorageService extends StorageService<Condition, CreateConditionInput> {}

/**
 * Medication storage service interface
 */
export interface MedicationStorageService extends StorageService<Medication, CreateMedicationInput> {}

/**
 * Allergy storage service interface
 */
export interface AllergyStorageService extends StorageService<Allergy, CreateAllergyInput> {}

/**
 * Appointment storage service interface
 */
export interface AppointmentStorageService extends StorageService<Appointment, CreateAppointmentInput> {
  /**
   * Load appointments sorted by date (most recent first)
   * @returns Array of appointments sorted by appointmentDate descending
   */
  loadSorted(): Appointment[];
}

/**
 * Document storage service interface
 */
export interface DocumentStorageService {
  /**
   * Load all documents from storage
   * @returns Array of documents, empty array if none exist
   * @throws Error if storage is unavailable or data is corrupted
   */
  load(): Document[];

  /**
   * Upload a new document
   * @param input - Document data including base64-encoded content
   * @returns The uploaded document with auto-generated fields
   * @throws Error if validation fails or storage quota exceeded
   */
  upload(input: UploadDocumentInput): Document;

  /**
   * Delete a document
   * @param id - Document ID to delete
   * @throws Error if document not found
   */
  delete(id: string): void;

  /**
   * Find a single document by ID
   * @param id - Document ID to find
   * @returns The document if found, undefined otherwise
   */
  findById(id: string): Document | undefined;

  /**
   * Convert a File object to base64 string
   * @param file - File to convert
   * @returns Promise resolving to base64-encoded string
   */
  fileToBase64(file: File): Promise<string>;

  /**
   * Convert base64 string back to Blob
   * @param base64 - Base64-encoded string
   * @param mimeType - MIME type of the blob
   * @returns Blob object
   */
  base64ToBlob(base64: string, mimeType: string): Blob;

  /**
   * Validate file before upload
   * @param file - File to validate
   * @returns Validation result with error message if invalid
   */
  validateFile(file: File): { valid: boolean; error?: string };
}

/**
 * Custom hook return type for entity management
 */
export interface UseEntityResult<T, TCreate> {
  /**
   * Array of entities
   */
  entities: T[];

  /**
   * Loading state (true while initial load is in progress)
   */
  loading: boolean;

  /**
   * Error message if any operation failed
   */
  error: string | null;

  /**
   * Create a new entity
   * @param input - Data for creating the entity
   */
  create(input: TCreate): void;

  /**
   * Update an existing entity
   * @param id - Entity ID to update
   * @param updates - Partial updates to apply
   */
  update(id: string, updates: Partial<TCreate>): void;

  /**
   * Delete an entity
   * @param id - Entity ID to delete
   */
  remove(id: string): void;

  /**
   * Refresh entities from storage (useful after external changes)
   */
  refresh(): void;
}

/**
 * Custom hook for managing conditions
 */
export interface UseConditions extends UseEntityResult<Condition, CreateConditionInput> {}

/**
 * Custom hook for managing medications
 */
export interface UseMedications extends UseEntityResult<Medication, CreateMedicationInput> {}

/**
 * Custom hook for managing allergies
 */
export interface UseAllergies extends UseEntityResult<Allergy, CreateAllergyInput> {}

/**
 * Custom hook for managing appointments
 */
export interface UseAppointments extends UseEntityResult<Appointment, CreateAppointmentInput> {
  /**
   * Appointments sorted by date (most recent first)
   */
  sortedAppointments: Appointment[];
}

/**
 * Custom hook for managing documents
 */
export interface UseDocuments {
  /**
   * Array of documents
   */
  documents: Document[];

  /**
   * Loading state (true while initial load is in progress)
   */
  loading: boolean;

  /**
   * Error message if any operation failed
   */
  error: string | null;

  /**
   * Upload a new document
   * @param file - File to upload
   * @param description - Optional description
   */
  upload(file: File, description?: string): Promise<void>;

  /**
   * Delete a document
   * @param id - Document ID to delete
   */
  remove(id: string): void;

  /**
   * Get a blob URL for viewing a document
   * @param id - Document ID
   * @returns Blob URL for viewing, or null if document not found
   */
  getViewUrl(id: string): string | null;

  /**
   * Refresh documents from storage
   */
  refresh(): void;
}

/**
 * Dashboard aggregation interface
 */
export interface DashboardStats {
  /**
   * Total count of active conditions
   */
  conditionsCount: number;

  /**
   * Total count of active medications
   */
  medicationsCount: number;

  /**
   * Total count of active allergies
   */
  allergiesCount: number;

  /**
   * Total count of appointments
   */
  appointmentsCount: number;

  /**
   * Total count of documents
   */
  documentsCount: number;
}

/**
 * Recent activity item for dashboard
 */
export interface RecentActivity {
  /**
   * Unique identifier for the activity
   */
  id: string;

  /**
   * Type of entity
   */
  type: 'condition' | 'medication' | 'allergy' | 'appointment' | 'document';

  /**
   * Display title for the activity
   */
  title: string;

  /**
   * Timestamp of the activity
   */
  timestamp: string;

  /**
   * Action performed (created, updated)
   */
  action: 'created' | 'updated';
}

/**
 * Custom hook for dashboard data
 */
export interface UseDashboard {
  /**
   * Summary statistics across all sections
   */
  stats: DashboardStats;

  /**
   * Recent activity items (most recent 5)
   */
  recentActivity: RecentActivity[];

  /**
   * Loading state
   */
  loading: boolean;

  /**
   * Refresh dashboard data
   */
  refresh(): void;
}

/**
 * Storage utility functions
 */
export interface StorageUtils {
  /**
   * Check if localStorage is available
   * @returns true if localStorage is available and functional
   */
  isStorageAvailable(): boolean;

  /**
   * Get approximate storage usage in bytes
   * @returns Approximate size of all health-log data in localStorage
   */
  getStorageSize(): number;

  /**
   * Clear all health-log data from localStorage
   * @returns true if successful
   */
  clearAllData(): boolean;

  /**
   * Export all data as JSON
   * @returns JSON string containing all entities
   */
  exportData(): string;

  /**
   * Import data from JSON
   * @param json - JSON string containing entities
   * @returns Result with success status and error message if failed
   */
  importData(json: string): { success: boolean; error?: string };
}

// Type imports (these would come from lib/schemas/*)
// In actual implementation, these imports would be:
// import type { Condition, CreateConditionInput } from '@/lib/schemas/condition';
// import type { Medication, CreateMedicationInput } from '@/lib/schemas/medication';
// etc.

// Placeholder types for this contract file
type Condition = any;
type CreateConditionInput = any;
type Medication = any;
type CreateMedicationInput = any;
type Allergy = any;
type CreateAllergyInput = any;
type Appointment = any;
type CreateAppointmentInput = any;
type Document = any;
type UploadDocumentInput = any;