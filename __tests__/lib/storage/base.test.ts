import { z } from 'zod';
import {
  BaseStorage,
  checkStorageAvailable,
  StorageError,
  QuotaExceededError,
  NotFoundError,
} from '@/lib/storage/base';

// Test entity schema
const testEntitySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

type TestEntity = z.infer<typeof testEntitySchema>;

const testEntitiesSchema = z.array(testEntitySchema);

describe('Storage Errors', () => {
  it('should create StorageError with correct properties', () => {
    const error = new StorageError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('StorageError');
    expect(error).toBeInstanceOf(Error);
  });

  it('should create QuotaExceededError with correct properties', () => {
    const error = new QuotaExceededError();
    expect(error.message).toBe('Storage quota exceeded. Please delete some entries or documents.');
    expect(error.name).toBe('QuotaExceededError');
    expect(error).toBeInstanceOf(StorageError);
  });

  it('should create NotFoundError with correct properties', () => {
    const error = new NotFoundError('TestEntity', '123');
    expect(error.message).toBe('TestEntity with id "123" not found');
    expect(error.name).toBe('NotFoundError');
    expect(error).toBeInstanceOf(StorageError);
  });
});

describe('checkStorageAvailable', () => {
  it('should return true when localStorage is available', () => {
    expect(checkStorageAvailable()).toBe(true);
  });

  it('should return false when localStorage throws error', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = jest.fn(() => {
      throw new Error('Storage unavailable');
    });

    expect(checkStorageAvailable()).toBe(false);

    Storage.prototype.setItem = originalSetItem;
  });
});

describe('BaseStorage', () => {
  let storage: BaseStorage<TestEntity>;
  const storageKey = 'test:entities';
  const validUuid1 = 'a1b2c3d4-e5f6-4789-8abc-def012345678';
  const validUuid2 = 'b2c3d4e5-f6a7-4901-9bcd-ef1234567890';
  const validUuid3 = 'c3d4e5f6-a7b8-4012-abcd-123456789012';

  beforeEach(() => {
    localStorage.clear();
    storage = new BaseStorage(storageKey, testEntitiesSchema, 'TestEntity');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getAll', () => {
    it('should return empty array when no data exists', () => {
      expect(storage.getAll()).toEqual([]);
    });

    it('should return all entities', () => {
      const entities: TestEntity[] = [
        {
          id: validUuid1,
          name: 'Entity 1',
          createdAt: '2025-01-10T10:00:00.000Z',
          updatedAt: '2025-01-10T10:00:00.000Z',
        },
        {
          id: validUuid2,
          name: 'Entity 2',
          createdAt: '2025-01-10T11:00:00.000Z',
          updatedAt: '2025-01-10T11:00:00.000Z',
        },
      ];

      localStorage.setItem(storageKey, JSON.stringify(entities));

      expect(storage.getAll()).toEqual(entities);
    });

    it('should reset storage and return empty array when data is corrupted', () => {
      localStorage.setItem(storageKey, 'invalid json');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(storage.getAll()).toEqual([]);
      expect(localStorage.getItem(storageKey)).toBeNull();

      consoleErrorSpy.mockRestore();
    });

    it('should reset storage when Zod validation fails', () => {
      const invalidData = [{ id: 'not-a-uuid', name: 'Test' }];
      localStorage.setItem(storageKey, JSON.stringify(invalidData));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(storage.getAll()).toEqual([]);
      expect(localStorage.getItem(storageKey)).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getById', () => {
    it('should return null when entity does not exist', () => {
      expect(storage.getById(validUuid1)).toBeNull();
    });

    it('should return entity by id', () => {
      const entity: TestEntity = {
        id: validUuid1,
        name: 'Test Entity',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      };

      localStorage.setItem(storageKey, JSON.stringify([entity]));

      expect(storage.getById(entity.id)).toEqual(entity);
    });

    it('should return correct entity when multiple exist', () => {
      const entities: TestEntity[] = [
        {
          id: validUuid1,
          name: 'Entity 1',
          createdAt: '2025-01-10T10:00:00.000Z',
          updatedAt: '2025-01-10T10:00:00.000Z',
        },
        {
          id: validUuid2,
          name: 'Entity 2',
          createdAt: '2025-01-10T11:00:00.000Z',
          updatedAt: '2025-01-10T11:00:00.000Z',
        },
      ];

      localStorage.setItem(storageKey, JSON.stringify(entities));

      expect(storage.getById(validUuid2)).toEqual(entities[1]);
    });
  });

  describe('create', () => {
    it('should create new entity', () => {
      const entity: TestEntity = {
        id: validUuid1,
        name: 'New Entity',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      };

      const result = storage.create(entity);

      expect(result).toEqual(entity);
      expect(storage.getAll()).toEqual([entity]);
    });

    it('should add entity to existing entities', () => {
      const existing: TestEntity = {
        id: validUuid1,
        name: 'Existing',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      };

      const newEntity: TestEntity = {
        id: validUuid2,
        name: 'New',
        createdAt: '2025-01-10T11:00:00.000Z',
        updatedAt: '2025-01-10T11:00:00.000Z',
      };

      storage.create(existing);
      storage.create(newEntity);

      expect(storage.getAll()).toEqual([existing, newEntity]);
    });

    it('should throw QuotaExceededError when storage quota is exceeded', () => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });

      const entity: TestEntity = {
        id: validUuid1,
        name: 'Test',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      };

      expect(() => storage.create(entity)).toThrow(QuotaExceededError);

      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('update', () => {
    it('should update existing entity', () => {
      const entity: TestEntity = {
        id: validUuid1,
        name: 'Original',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      };

      storage.create(entity);

      const updated = storage.update(entity.id, { name: 'Updated' });

      expect(updated.name).toBe('Updated');
      expect(updated.id).toBe(entity.id);
      expect(updated.createdAt).toBe(entity.createdAt);
      expect(updated.updatedAt).not.toBe(entity.updatedAt);
    });

    it('should throw NotFoundError when entity does not exist', () => {
      expect(() => storage.update(validUuid1, { name: 'Test' })).toThrow(
        NotFoundError
      );
    });

    it('should update correct entity when multiple exist', () => {
      const entities: TestEntity[] = [
        {
          id: validUuid1,
          name: 'Entity 1',
          createdAt: '2025-01-10T10:00:00.000Z',
          updatedAt: '2025-01-10T10:00:00.000Z',
        },
        {
          id: validUuid2,
          name: 'Entity 2',
          createdAt: '2025-01-10T11:00:00.000Z',
          updatedAt: '2025-01-10T11:00:00.000Z',
        },
      ];

      entities.forEach((e) => storage.create(e));

      storage.update(validUuid2, { name: 'Updated Entity 2' });

      const all = storage.getAll();
      expect(all[0].name).toBe('Entity 1');
      expect(all[1].name).toBe('Updated Entity 2');
    });
  });

  describe('delete', () => {
    it('should delete entity by id', () => {
      const entity: TestEntity = {
        id: validUuid1,
        name: 'To Delete',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      };

      storage.create(entity);
      storage.delete(entity.id);

      expect(storage.getAll()).toEqual([]);
    });

    it('should throw NotFoundError when entity does not exist', () => {
      expect(() => storage.delete(validUuid1)).toThrow(NotFoundError);
    });

    it('should delete only specified entity', () => {
      const entities: TestEntity[] = [
        {
          id: validUuid1,
          name: 'Entity 1',
          createdAt: '2025-01-10T10:00:00.000Z',
          updatedAt: '2025-01-10T10:00:00.000Z',
        },
        {
          id: validUuid2,
          name: 'Entity 2',
          createdAt: '2025-01-10T11:00:00.000Z',
          updatedAt: '2025-01-10T11:00:00.000Z',
        },
      ];

      entities.forEach((e) => storage.create(e));
      storage.delete(validUuid1);

      expect(storage.getAll()).toEqual([entities[1]]);
    });
  });

  describe('deleteAll', () => {
    it('should delete all entities', () => {
      const entities: TestEntity[] = [
        {
          id: validUuid1,
          name: 'Entity 1',
          createdAt: '2025-01-10T10:00:00.000Z',
          updatedAt: '2025-01-10T10:00:00.000Z',
        },
        {
          id: validUuid2,
          name: 'Entity 2',
          createdAt: '2025-01-10T11:00:00.000Z',
          updatedAt: '2025-01-10T11:00:00.000Z',
        },
      ];

      entities.forEach((e) => storage.create(e));
      storage.deleteAll();

      expect(storage.getAll()).toEqual([]);
      expect(localStorage.getItem(storageKey)).toBeNull();
    });

    it('should handle deleting when no data exists', () => {
      expect(() => storage.deleteAll()).not.toThrow();
      expect(storage.getAll()).toEqual([]);
    });
  });

  describe('count', () => {
    it('should return 0 when no entities exist', () => {
      expect(storage.count()).toBe(0);
    });

    it('should return correct count', () => {
      const entities: TestEntity[] = [
        {
          id: validUuid1,
          name: 'Entity 1',
          createdAt: '2025-01-10T10:00:00.000Z',
          updatedAt: '2025-01-10T10:00:00.000Z',
        },
        {
          id: validUuid2,
          name: 'Entity 2',
          createdAt: '2025-01-10T11:00:00.000Z',
          updatedAt: '2025-01-10T11:00:00.000Z',
        },
      ];

      entities.forEach((e) => storage.create(e));

      expect(storage.count()).toBe(2);
    });
  });
});
