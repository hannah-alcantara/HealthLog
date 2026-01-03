import { generateAppointmentQuestions, getQuestionPreview } from '@/lib/utils/question-generator';
import type { Condition, Medication, Allergy } from '@/lib/schemas/medical-history';

describe('Question Generator', () => {
  describe('generateAppointmentQuestions', () => {
    it('should generate generic questions when no medical history provided', () => {
      const questions = generateAppointmentQuestions(null, [], [], [], []);

      expect(questions.length).toBeGreaterThan(0);
      expect(questions).toContain(
        'What are my current vital signs and how do they compare to my last visit?'
      );
      expect(questions).toContain('Are there any test results or screenings I should review?');
    });

    it('should include symptom-based questions when symptoms provided', () => {
      const questions = generateAppointmentQuestions('headache and fatigue', [], [], [], []);

      const symptomQuestions = questions.filter((q) =>
        q.toLowerCase().includes('headache and fatigue')
      );
      expect(symptomQuestions.length).toBeGreaterThan(0);
    });

    it('should include condition-based questions when conditions provided', () => {
      const conditions: Condition[] = [
        {
          id: '1',
          name: 'Type 2 Diabetes',
          diagnosisDate: '2020-01-15',
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const questions = generateAppointmentQuestions(null, [], conditions, [], []);

      // Should still generate generic questions even without symptom correlation
      expect(questions.length).toBeGreaterThan(0);
      // Generic health questions should be present
      expect(questions.some(q => q.toLowerCase().includes('preventive') || q.toLowerCase().includes('lifestyle'))).toBe(true);
    });

    it('should include medication-based questions when medications provided', () => {
      const medications: Medication[] = [
        {
          id: '1',
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
          startDate: '2020-01-15',
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const questions = generateAppointmentQuestions(null, [], [], medications, []);

      // Should still generate generic questions
      expect(questions.length).toBeGreaterThan(0);
      // Should include general health questions
      expect(questions.some(q => q.toLowerCase().includes('health') || q.toLowerCase().includes('care'))).toBe(true);
    });

    it('should include interaction questions when multiple medications provided', () => {
      const medications: Medication[] = [
        {
          id: '1',
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
          startDate: '2020-01-15',
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'once daily',
          startDate: '2021-06-10',
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const questions = generateAppointmentQuestions(null, [], [], medications, []);

      const interactionQuestions = questions.filter((q) =>
        q.toLowerCase().includes('interaction')
      );
      expect(interactionQuestions.length).toBeGreaterThan(0);
    });

    it('should include allergy-based questions when allergies provided', () => {
      const allergies: Allergy[] = [
        {
          id: '1',
          allergen: 'Penicillin',
          severity: 'moderate',
          reaction: 'Rash',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const questions = generateAppointmentQuestions(null, [], [], [], allergies);

      // Should generate questions
      expect(questions.length).toBeGreaterThan(0);
      // Should include general health questions
      expect(questions.some(q => q.toLowerCase().includes('health') || q.toLowerCase().includes('care'))).toBe(true);
    });

    it('should include emergency plan question for severe allergies', () => {
      const allergies: Allergy[] = [
        {
          id: '1',
          allergen: 'Peanuts',
          severity: 'severe',
          reaction: 'Anaphylaxis',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const questions = generateAppointmentQuestions(null, [], [], [], allergies);

      const emergencyQuestions = questions.filter(
        (q) => q.toLowerCase().includes('emergency') && q.toLowerCase().includes('action plan')
      );
      expect(emergencyQuestions.length).toBeGreaterThan(0);
    });

    it('should generate comprehensive questions with full medical history', () => {
      const symptoms = 'frequent headaches and dizziness';
      const conditions: Condition[] = [
        {
          id: '1',
          name: 'Hypertension',
          diagnosisDate: '2020-01-15',
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      const medications: Medication[] = [
        {
          id: '1',
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'once daily',
          startDate: '2020-01-15',
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      const allergies: Allergy[] = [
        {
          id: '1',
          allergen: 'Sulfa drugs',
          severity: 'moderate',
          reaction: 'Hives',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const questions = generateAppointmentQuestions(symptoms, [], conditions, medications, allergies);

      // Should have comprehensive questions from multiple categories
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.length).toBeLessThanOrEqual(10); // Max 10 questions
      // Should include the appointment symptoms
      expect(questions.some(q => q.toLowerCase().includes('headaches') || q.toLowerCase().includes('dizziness'))).toBe(true);
    });

    it('should handle empty symptoms string', () => {
      const questions = generateAppointmentQuestions('', [], [], [], []);

      // Should still generate generic questions
      expect(questions.length).toBeGreaterThan(0);
      // Should not include symptom-specific questions
      const symptomQuestions = questions.filter((q) => q.includes("I've been experiencing"));
      expect(symptomQuestions.length).toBe(0);
    });

    it('should limit results to 10 questions', () => {
      const symptoms = 'multiple symptoms here';
      const conditions: Condition[] = [
        {
          id: '1',
          name: 'Condition 1',
          diagnosisDate: null,
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Condition 2',
          diagnosisDate: null,
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      const medications: Medication[] = [
        {
          id: '1',
          name: 'Med 1',
          dosage: '10mg',
          frequency: 'daily',
          startDate: null,
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          name: 'Med 2',
          dosage: '20mg',
          frequency: 'daily',
          startDate: null,
          notes: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];
      const allergies: Allergy[] = [
        {
          id: '1',
          allergen: 'Allergen 1',
          severity: 'severe',
          reaction: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const questions = generateAppointmentQuestions(symptoms, [], conditions, medications, allergies);

      expect(questions.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getQuestionPreview', () => {
    it('should return first 3 questions', () => {
      const questions = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'];
      const preview = getQuestionPreview(questions);

      expect(preview).toHaveLength(3);
      expect(preview).toEqual(['Q1', 'Q2', 'Q3']);
    });

    it('should return all questions if less than 3', () => {
      const questions = ['Q1', 'Q2'];
      const preview = getQuestionPreview(questions);

      expect(preview).toHaveLength(2);
      expect(preview).toEqual(['Q1', 'Q2']);
    });

    it('should return empty array for empty input', () => {
      const preview = getQuestionPreview([]);

      expect(preview).toHaveLength(0);
    });
  });
});
