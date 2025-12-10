import { z } from 'zod';

/**
 * Generic localStorage-based CRUD operations for health data entities
 */

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class QuotaExceededError extends StorageError {
  constructor() {
    super('Storage quota exceeded. Please delete some entries or documents.');
    this.name = 'QuotaExceededError';
  }
}

export class NotFoundError extends StorageError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id "${id}" not found`);
    this.name = 'NotFoundError';
  }
}

/**
 * Check if localStorage is available
 */
export function checkStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generic base storage class for CRUD operations
 */
export class BaseStorage<T extends { id: string }> {
  constructor(
    private storageKey: string,
    private schema: z.ZodArray<z.ZodType<T>>,
    private entityName: string
  ) {}

  /**
   * Load all entities from localStorage
   */
  protected load(): T[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return this.schema.parse(parsed);
    } catch (error) {
      if (error instanceof z.ZodError || error instanceof SyntaxError) {
        console.error(`Corrupted ${this.entityName} data, resetting:`, error);
        localStorage.removeItem(this.storageKey);
        return [];
      }
      throw error;
    }
  }

  /**
   * Save all entities to localStorage
   */
  protected save(entities: T[]): void {
    try {
      const json = JSON.stringify(entities);
      localStorage.setItem(this.storageKey, json);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new QuotaExceededError();
      }
      throw error;
    }
  }

  /**
   * Get all entities
   */
  getAll(): T[] {
    return this.load();
  }

  /**
   * Get entity by ID
   */
  getById(id: string): T | null {
    const entities = this.load();
    return entities.find((e) => e.id === id) || null;
  }

  /**
   * Create a new entity
   */
  create(entity: T): T {
    const entities = this.load();
    entities.push(entity);
    this.save(entities);
    return entity;
  }

  /**
   * Update an existing entity
   */
  update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): T {
    const entities = this.load();
    const index = entities.findIndex((e) => e.id === id);

    if (index === -1) {
      throw new NotFoundError(this.entityName, id);
    }

    const updated = {
      ...entities[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    } as T;

    entities[index] = updated;
    this.save(entities);

    return updated;
  }

  /**
   * Delete an entity by ID
   */
  delete(id: string): void {
    const entities = this.load();
    const filtered = entities.filter((e) => e.id !== id);

    if (filtered.length === entities.length) {
      throw new NotFoundError(this.entityName, id);
    }

    this.save(filtered);
  }

  /**
   * Delete all entities
   */
  deleteAll(): void {
    localStorage.removeItem(this.storageKey);
  }

  /**
   * Count total entities
   */
  count(): number {
    return this.load().length;
  }
}
