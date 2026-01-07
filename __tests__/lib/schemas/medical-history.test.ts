import {
  conditionSchema,
  createConditionSchema,
  medicationSchema,
  createMedicationSchema,
  allergySchema,
  allergySeveritySchema,
  createAllergySchema,
  type Condition,
  type CreateConditionInput,
  type Medication,
  type CreateMedicationInput,
  type Allergy,
  type CreateAllergyInput,
} from '@/lib/schemas/medical-history';

describe('Condition Schema', () => {
  const validCondition: Condition = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Type 2 Diabetes',
    diagnosisDate: '2020-03-15T00:00:00.000Z',
    notes: 'Managing with metformin and diet',
    createdAt: '2025-01-10T14:30:00.000Z',
    updatedAt: '2025-01-10T14:30:00.000Z',
  };

  describe('conditionSchema', () => {
    it('should validate a complete condition object', () => {
      expect(() => conditionSchema.parse(validCondition)).not.toThrow();
    });

    it('should validate condition with null diagnosisDate', () => {
      const condition = { ...validCondition, diagnosisDate: null };
      expect(() => conditionSchema.parse(condition)).not.toThrow();
    });

    it('should validate condition with null notes', () => {
      const condition = { ...validCondition, notes: null };
      expect(() => conditionSchema.parse(condition)).not.toThrow();
    });

    it('should trim condition name', () => {
      const condition = { ...validCondition, name: '  Hypertension  ' };
      const result = conditionSchema.parse(condition);
      expect(result.name).toBe('Hypertension');
    });

    it('should reject invalid UUID', () => {
      const condition = { ...validCondition, id: 'not-a-uuid' };
      expect(() => conditionSchema.parse(condition)).toThrow();
    });

    it('should reject empty name', () => {
      const condition = { ...validCondition, name: '' };
      expect(() => conditionSchema.parse(condition)).toThrow('Condition name is required');
    });

    it('should reject name exceeding 200 characters', () => {
      const condition = { ...validCondition, name: 'a'.repeat(201) };
      expect(() => conditionSchema.parse(condition)).toThrow();
    });

    it('should reject invalid diagnosisDate format', () => {
      const condition = { ...validCondition, diagnosisDate: '2020-03-15' };
      expect(() => conditionSchema.parse(condition)).toThrow();
    });

    it('should reject notes exceeding 1000 characters', () => {
      const condition = { ...validCondition, notes: 'a'.repeat(1001) };
      expect(() => conditionSchema.parse(condition)).toThrow();
    });

    it('should reject invalid createdAt format', () => {
      const condition = { ...validCondition, createdAt: 'invalid-date' };
      expect(() => conditionSchema.parse(condition)).toThrow();
    });

    it('should reject missing required fields', () => {
      const condition = { name: 'Test' };
      expect(() => conditionSchema.parse(condition)).toThrow();
    });
  });

  describe('createConditionSchema', () => {
    const validInput: CreateConditionInput = {
      name: 'Hypertension',
      diagnosisDate: '2021-05-10T00:00:00.000Z',
      notes: 'Controlled with lifestyle changes',
    };

    it('should validate valid create input', () => {
      expect(() => createConditionSchema.parse(validInput)).not.toThrow();
    });

    it('should validate input with null fields', () => {
      const input = { name: 'Asthma', diagnosisDate: null, notes: null };
      expect(() => createConditionSchema.parse(input)).not.toThrow();
    });

    it('should reject input with id field', () => {
      const input = { ...validInput, id: 'some-uuid' };
      const result = createConditionSchema.parse(input);
      expect(result).not.toHaveProperty('id');
    });

    it('should reject empty name', () => {
      const input = { ...validInput, name: '' };
      expect(() => createConditionSchema.parse(input)).toThrow();
    });
  });
});

describe('Medication Schema', () => {
  const validMedication: Medication = {
    id: 'b2c3d4e5-f6a7-4901-bcde-f12345678901',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    startDate: '2020-06-01T00:00:00.000Z',
    notes: 'Take with meals',
    createdAt: '2025-01-10T14:30:00.000Z',
    updatedAt: '2025-01-10T14:30:00.000Z',
  };

  describe('medicationSchema', () => {
    it('should validate a complete medication object', () => {
      expect(() => medicationSchema.parse(validMedication)).not.toThrow();
    });

    it('should validate medication with null startDate', () => {
      const medication = { ...validMedication, startDate: null };
      expect(() => medicationSchema.parse(medication)).not.toThrow();
    });

    it('should validate medication with null notes', () => {
      const medication = { ...validMedication, notes: null };
      expect(() => medicationSchema.parse(medication)).not.toThrow();
    });

    it('should trim medication name, dosage, and frequency', () => {
      const medication = {
        ...validMedication,
        name: '  Aspirin  ',
        dosage: '  100mg  ',
        frequency: '  Daily  ',
      };
      const result = medicationSchema.parse(medication);
      expect(result.name).toBe('Aspirin');
      expect(result.dosage).toBe('100mg');
      expect(result.frequency).toBe('Daily');
    });

    it('should reject invalid UUID', () => {
      const medication = { ...validMedication, id: 'invalid' };
      expect(() => medicationSchema.parse(medication)).toThrow();
    });

    it('should reject empty name', () => {
      const medication = { ...validMedication, name: '' };
      expect(() => medicationSchema.parse(medication)).toThrow('Medication name is required');
    });

    it('should reject empty dosage', () => {
      const medication = { ...validMedication, dosage: '' };
      expect(() => medicationSchema.parse(medication)).toThrow('Dosage is required');
    });

    it('should reject empty frequency', () => {
      const medication = { ...validMedication, frequency: '' };
      expect(() => medicationSchema.parse(medication)).toThrow('Frequency is required');
    });

    it('should reject name exceeding 200 characters', () => {
      const medication = { ...validMedication, name: 'a'.repeat(201) };
      expect(() => medicationSchema.parse(medication)).toThrow();
    });

    it('should reject dosage exceeding 100 characters', () => {
      const medication = { ...validMedication, dosage: 'a'.repeat(101) };
      expect(() => medicationSchema.parse(medication)).toThrow();
    });

    it('should reject frequency exceeding 100 characters', () => {
      const medication = { ...validMedication, frequency: 'a'.repeat(101) };
      expect(() => medicationSchema.parse(medication)).toThrow();
    });

    it('should reject notes exceeding 1000 characters', () => {
      const medication = { ...validMedication, notes: 'a'.repeat(1001) };
      expect(() => medicationSchema.parse(medication)).toThrow();
    });

    it('should reject invalid startDate format', () => {
      const medication = { ...validMedication, startDate: '2020-06-01' };
      expect(() => medicationSchema.parse(medication)).toThrow();
    });
  });

  describe('createMedicationSchema', () => {
    const validInput: CreateMedicationInput = {
      name: 'Ibuprofen',
      dosage: '200mg',
      frequency: 'As needed',
      startDate: null,
      notes: null,
    };

    it('should validate valid create input', () => {
      expect(() => createMedicationSchema.parse(validInput)).not.toThrow();
    });

    it('should validate input with all optional fields', () => {
      const input = {
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Daily',
        startDate: '2021-01-01T00:00:00.000Z',
        notes: 'Blood thinner',
      };
      expect(() => createMedicationSchema.parse(input)).not.toThrow();
    });

    it('should reject input with id field', () => {
      const input = { ...validInput, id: 'some-uuid' };
      const result = createMedicationSchema.parse(input);
      expect(result).not.toHaveProperty('id');
    });

    it('should reject empty required fields', () => {
      const input = { name: '', dosage: '', frequency: '' };
      expect(() => createMedicationSchema.parse(input)).toThrow();
    });
  });
});

describe('Allergy Schema', () => {
  const validAllergy: Allergy = {
    id: 'c3d4e5f6-a7b8-4012-8def-123456789012',
    allergen: 'Penicillin',
    severity: 'severe',
    reaction: 'Anaphylaxis',
    createdAt: '2025-01-10T14:30:00.000Z',
    updatedAt: '2025-01-10T14:30:00.000Z',
  };

  describe('allergySeveritySchema', () => {
    it('should validate "mild" severity', () => {
      expect(() => allergySeveritySchema.parse('mild')).not.toThrow();
    });

    it('should validate "moderate" severity', () => {
      expect(() => allergySeveritySchema.parse('moderate')).not.toThrow();
    });

    it('should validate "severe" severity', () => {
      expect(() => allergySeveritySchema.parse('severe')).not.toThrow();
    });

    it('should reject invalid severity value', () => {
      expect(() => allergySeveritySchema.parse('critical')).toThrow();
    });
  });

  describe('allergySchema', () => {
    it('should validate a complete allergy object', () => {
      expect(() => allergySchema.parse(validAllergy)).not.toThrow();
    });

    it('should validate allergy with null severity', () => {
      const allergy = { ...validAllergy, severity: null };
      expect(() => allergySchema.parse(allergy)).not.toThrow();
    });

    it('should validate allergy with null reaction', () => {
      const allergy = { ...validAllergy, reaction: null };
      expect(() => allergySchema.parse(allergy)).not.toThrow();
    });

    it('should validate allergy with "mild" severity', () => {
      const allergy = { ...validAllergy, severity: 'mild' as const };
      expect(() => allergySchema.parse(allergy)).not.toThrow();
    });

    it('should validate allergy with "moderate" severity', () => {
      const allergy = { ...validAllergy, severity: 'moderate' as const };
      expect(() => allergySchema.parse(allergy)).not.toThrow();
    });

    it('should trim allergen name', () => {
      const allergy = { ...validAllergy, allergen: '  Peanuts  ' };
      const result = allergySchema.parse(allergy);
      expect(result.allergen).toBe('Peanuts');
    });

    it('should reject invalid UUID', () => {
      const allergy = { ...validAllergy, id: 'not-uuid' };
      expect(() => allergySchema.parse(allergy)).toThrow();
    });

    it('should reject empty allergen', () => {
      const allergy = { ...validAllergy, allergen: '' };
      expect(() => allergySchema.parse(allergy)).toThrow('Allergen name is required');
    });

    it('should reject allergen exceeding 200 characters', () => {
      const allergy = { ...validAllergy, allergen: 'a'.repeat(201) };
      expect(() => allergySchema.parse(allergy)).toThrow();
    });

    it('should reject invalid severity value', () => {
      const allergy = { ...validAllergy, severity: 'critical' as unknown as 'mild' };
      expect(() => allergySchema.parse(allergy)).toThrow();
    });

    it('should reject reaction exceeding 500 characters', () => {
      const allergy = { ...validAllergy, reaction: 'a'.repeat(501) };
      expect(() => allergySchema.parse(allergy)).toThrow();
    });

    it('should reject invalid createdAt format', () => {
      const allergy = { ...validAllergy, createdAt: 'invalid' };
      expect(() => allergySchema.parse(allergy)).toThrow();
    });
  });

  describe('createAllergySchema', () => {
    const validInput: CreateAllergyInput = {
      allergen: 'Shellfish',
      severity: 'moderate',
      reaction: 'Hives and swelling',
    };

    it('should validate valid create input', () => {
      expect(() => createAllergySchema.parse(validInput)).not.toThrow();
    });

    it('should validate input with null fields', () => {
      const input = { allergen: 'Latex', severity: null, reaction: null };
      expect(() => createAllergySchema.parse(input)).not.toThrow();
    });

    it('should validate input with all severity levels', () => {
      const mild = { ...validInput, severity: 'mild' as const };
      const moderate = { ...validInput, severity: 'moderate' as const };
      const severe = { ...validInput, severity: 'severe' as const };

      expect(() => createAllergySchema.parse(mild)).not.toThrow();
      expect(() => createAllergySchema.parse(moderate)).not.toThrow();
      expect(() => createAllergySchema.parse(severe)).not.toThrow();
    });

    it('should reject input with id field', () => {
      const input = { ...validInput, id: 'some-uuid' };
      const result = createAllergySchema.parse(input);
      expect(result).not.toHaveProperty('id');
    });

    it('should reject empty allergen', () => {
      const input = { ...validInput, allergen: '' };
      expect(() => createAllergySchema.parse(input)).toThrow();
    });
  });
});
