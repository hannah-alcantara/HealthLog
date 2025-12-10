import { z } from 'zod';
import { BaseStorage } from './base';
import {
  type Condition,
  type Medication,
  type Allergy,
  type CreateConditionInput,
  type CreateMedicationInput,
  type CreateAllergyInput,
  conditionSchema,
  medicationSchema,
  allergySchema,
} from '../schemas/medical-history';

// Storage instances
const conditionsStorage = new BaseStorage(
  'health-log:conditions',
  z.array(conditionSchema),
  'Condition'
);

const medicationsStorage = new BaseStorage(
  'health-log:medications',
  z.array(medicationSchema),
  'Medication'
);

const allergiesStorage = new BaseStorage(
  'health-log:allergies',
  z.array(allergySchema),
  'Allergy'
);

/**
 * Condition CRUD operations
 */
export const conditionService = {
  getAll(): Condition[] {
    return conditionsStorage.getAll();
  },

  getById(id: string): Condition | null {
    return conditionsStorage.getById(id);
  },

  create(input: CreateConditionInput): Condition {
    const condition: Condition = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return conditionsStorage.create(condition);
  },

  update(id: string, input: Partial<CreateConditionInput>): Condition {
    return conditionsStorage.update(id, input);
  },

  delete(id: string): void {
    conditionsStorage.delete(id);
  },

  deleteAll(): void {
    conditionsStorage.deleteAll();
  },

  count(): number {
    return conditionsStorage.count();
  },
};

/**
 * Medication CRUD operations
 */
export const medicationService = {
  getAll(): Medication[] {
    return medicationsStorage.getAll();
  },

  getById(id: string): Medication | null {
    return medicationsStorage.getById(id);
  },

  create(input: CreateMedicationInput): Medication {
    const medication: Medication = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return medicationsStorage.create(medication);
  },

  update(id: string, input: Partial<CreateMedicationInput>): Medication {
    return medicationsStorage.update(id, input);
  },

  delete(id: string): void {
    medicationsStorage.delete(id);
  },

  deleteAll(): void {
    medicationsStorage.deleteAll();
  },

  count(): number {
    return medicationsStorage.count();
  },
};

/**
 * Allergy CRUD operations
 */
export const allergyService = {
  getAll(): Allergy[] {
    return allergiesStorage.getAll();
  },

  getById(id: string): Allergy | null {
    return allergiesStorage.getById(id);
  },

  create(input: CreateAllergyInput): Allergy {
    const allergy: Allergy = {
      id: crypto.randomUUID(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return allergiesStorage.create(allergy);
  },

  update(id: string, input: Partial<CreateAllergyInput>): Allergy {
    return allergiesStorage.update(id, input);
  },

  delete(id: string): void {
    allergiesStorage.delete(id);
  },

  deleteAll(): void {
    allergiesStorage.deleteAll();
  },

  count(): number {
    return allergiesStorage.count();
  },
};
