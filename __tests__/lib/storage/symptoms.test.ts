import { symptomService } from '@/lib/storage/symptoms';
import type { CreateSymptomInput } from '@/lib/schemas/symptom';

describe('Symptom Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
    symptomService.deleteAll();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('CRUD Operations', () => {
    it('should create a symptom with generated ID and timestamps', () => {
      const input: CreateSymptomInput = {
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-15T10:00:00.000Z',
      };

      const symptom = symptomService.create(input);

      expect(symptom.id).toBeDefined();
      expect(symptom.symptomType).toBe('Headache');
      expect(symptom.severity).toBe(7);
      expect(symptom.category).toBe('pain');
      expect(symptom.createdAt).toBeDefined();
      expect(symptom.updatedAt).toBeDefined();
    });

    it('should retrieve all symptoms', () => {
      const input1: CreateSymptomInput = {
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-15T10:00:00.000Z',
      };

      const input2: CreateSymptomInput = {
        symptomType: 'Nausea',
        severity: 5,
        category: 'digestive',
        loggedAt: '2024-01-16T10:00:00.000Z',
      };

      symptomService.create(input1);
      symptomService.create(input2);

      const symptoms = symptomService.getAll();
      expect(symptoms).toHaveLength(2);
    });

    it('should retrieve symptom by ID', () => {
      const input: CreateSymptomInput = {
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-15T10:00:00.000Z',
      };

      const created = symptomService.create(input);
      const retrieved = symptomService.getById(created.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.symptomType).toBe('Headache');
    });

    it('should return null for non-existent ID', () => {
      const symptom = symptomService.getById('non-existent-id');
      expect(symptom).toBeNull();
    });

    it('should update a symptom', () => {
      const input: CreateSymptomInput = {
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-15T10:00:00.000Z',
      };

      const created = symptomService.create(input);
      const updated = symptomService.update(created.id, {
        severity: 9,
        notes: 'Got worse throughout the day',
      });

      expect(updated.severity).toBe(9);
      expect(updated.notes).toBe('Got worse throughout the day');
      expect(updated.symptomType).toBe('Headache'); // Unchanged
    });

    it('should delete a symptom', () => {
      const input: CreateSymptomInput = {
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-15T10:00:00.000Z',
      };

      const created = symptomService.create(input);
      symptomService.delete(created.id);

      const retrieved = symptomService.getById(created.id);
      expect(retrieved).toBeNull();
    });

    it('should delete all symptoms', () => {
      symptomService.create({
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-15T10:00:00.000Z',
      });
      symptomService.create({
        symptomType: 'Nausea',
        severity: 5,
        category: 'digestive',
        loggedAt: '2024-01-16T10:00:00.000Z',
      });

      symptomService.deleteAll();

      expect(symptomService.getAll()).toHaveLength(0);
    });

    it('should count symptoms', () => {
      expect(symptomService.count()).toBe(0);

      symptomService.create({
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-15T10:00:00.000Z',
      });

      expect(symptomService.count()).toBe(1);

      symptomService.create({
        symptomType: 'Nausea',
        severity: 5,
        category: 'digestive',
        loggedAt: '2024-01-16T10:00:00.000Z',
      });

      expect(symptomService.count()).toBe(2);
    });
  });

  describe('Sorting and Filtering', () => {
    const createTestSymptoms = () => {
      // Create symptoms with different dates
      symptomService.create({
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-10T10:00:00.000Z',
      });
      symptomService.create({
        symptomType: 'Nausea',
        severity: 5,
        category: 'digestive',
        loggedAt: '2024-01-15T10:00:00.000Z',
      });
      symptomService.create({
        symptomType: 'Fatigue',
        severity: 6,
        category: 'energy',
        loggedAt: '2024-01-20T10:00:00.000Z',
      });
    };

    it('should return symptoms sorted by date (newest first)', () => {
      createTestSymptoms();
      const symptoms = symptomService.getAllSorted();

      expect(symptoms).toHaveLength(3);
      expect(symptoms[0].symptomType).toBe('Fatigue'); // 2024-01-20
      expect(symptoms[1].symptomType).toBe('Nausea'); // 2024-01-15
      expect(symptoms[2].symptomType).toBe('Headache'); // 2024-01-10
    });

    it('should filter symptoms by date range', () => {
      createTestSymptoms();
      const startDate = new Date('2024-01-12');
      const endDate = new Date('2024-01-18');

      const symptoms = symptomService.getByDateRange(startDate, endDate);

      expect(symptoms).toHaveLength(1);
      expect(symptoms[0].symptomType).toBe('Nausea');
    });

    it('should get symptoms from recent days', () => {
      createTestSymptoms();
      // Mock current date to 2024-01-21
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-21'));

      const recentSymptoms = symptomService.getRecentDays(7);

      // Should include Fatigue (Jan 20) but not Nausea (Jan 15) or Headache (Jan 10)
      expect(recentSymptoms).toHaveLength(1);
      expect(recentSymptoms[0].symptomType).toBe('Fatigue');

      jest.useRealTimers();
    });

    it('should get all symptoms when requesting many recent days', () => {
      createTestSymptoms();
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-21'));

      const recentSymptoms = symptomService.getRecentDays(30);

      expect(recentSymptoms).toHaveLength(3);

      jest.useRealTimers();
    });
  });

  describe('Statistics', () => {
    it('should return empty stats when no symptoms exist', () => {
      const stats = symptomService.getStats();

      expect(stats).toEqual({
        total: 0,
        averageSeverity: 0,
        mostCommonSymptom: null,
        mostCommonCategory: null,
      });
    });

    it('should calculate average severity correctly', () => {
      symptomService.create({
        symptomType: 'Headache',
        severity: 8,
        category: 'pain',
        loggedAt: '2024-01-10T10:00:00.000Z',
      });
      symptomService.create({
        symptomType: 'Nausea',
        severity: 4,
        category: 'digestive',
        loggedAt: '2024-01-11T10:00:00.000Z',
      });
      symptomService.create({
        symptomType: 'Fatigue',
        severity: 6,
        category: 'energy',
        loggedAt: '2024-01-12T10:00:00.000Z',
      });

      const stats = symptomService.getStats();

      expect(stats.total).toBe(3);
      expect(stats.averageSeverity).toBe(6); // (8 + 4 + 6) / 3 = 6
    });

    it('should identify most common symptom type', () => {
      symptomService.create({
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-10T10:00:00.000Z',
      });
      symptomService.create({
        symptomType: 'Headache',
        severity: 5,
        category: 'pain',
        loggedAt: '2024-01-11T10:00:00.000Z',
      });
      symptomService.create({
        symptomType: 'Nausea',
        severity: 6,
        category: 'digestive',
        loggedAt: '2024-01-12T10:00:00.000Z',
      });

      const stats = symptomService.getStats();

      expect(stats.mostCommonSymptom).toBe('Headache');
    });

    it('should identify most common category', () => {
      symptomService.create({
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-10T10:00:00.000Z',
      });
      symptomService.create({
        symptomType: 'Back pain',
        severity: 5,
        category: 'pain',
        loggedAt: '2024-01-11T10:00:00.000Z',
      });
      symptomService.create({
        symptomType: 'Nausea',
        severity: 6,
        category: 'digestive',
        loggedAt: '2024-01-12T10:00:00.000Z',
      });

      const stats = symptomService.getStats();

      expect(stats.mostCommonCategory).toBe('pain');
    });

    it('should round average severity to 1 decimal place', () => {
      symptomService.create({
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-10T10:00:00.000Z',
      });
      symptomService.create({
        symptomType: 'Nausea',
        severity: 5,
        category: 'digestive',
        loggedAt: '2024-01-11T10:00:00.000Z',
      });

      const stats = symptomService.getStats();

      expect(stats.averageSeverity).toBe(6); // (7 + 5) / 2 = 6.0
    });
  });

  describe('Edge Cases', () => {
    it('should handle symptoms with optional fields', () => {
      const symptom = symptomService.create({
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-15T10:00:00.000Z',
        bodyPart: 'head',
        triggers: 'bright lights',
        notes: 'Started after looking at screen',
      });

      expect(symptom.bodyPart).toBe('head');
      expect(symptom.triggers).toBe('bright lights');
      expect(symptom.notes).toBe('Started after looking at screen');
    });

    it('should handle updating to null optional fields', () => {
      const symptom = symptomService.create({
        symptomType: 'Headache',
        severity: 7,
        category: 'pain',
        loggedAt: '2024-01-15T10:00:00.000Z',
        notes: 'Initial note',
      });

      const updated = symptomService.update(symptom.id, {
        notes: null,
      });

      expect(updated.notes).toBeNull();
    });
  });
});
