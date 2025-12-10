import { conditionService, medicationService, allergyService } from '@/lib/storage/medical-history';
import { appointmentService } from '@/lib/storage/appointments';
import { documentService } from '@/lib/storage/documents';

describe('Storage Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Condition Service', () => {
    it('should create, read, update, and delete conditions', () => {
      expect(conditionService.count()).toBe(0);

      const condition = conditionService.create({
        name: 'Diabetes',
        diagnosisDate: '2020-01-01T00:00:00.000Z',
        notes: 'Type 2',
      });

      expect(condition.id).toBeDefined();
      expect(condition.name).toBe('Diabetes');
      expect(conditionService.count()).toBe(1);

      const retrieved = conditionService.getById(condition.id);
      expect(retrieved).toEqual(condition);

      const updated = conditionService.update(condition.id, { notes: 'Updated notes' });
      expect(updated.notes).toBe('Updated notes');
      expect(updated.updatedAt).not.toBe(condition.updatedAt);

      conditionService.delete(condition.id);
      expect(conditionService.count()).toBe(0);
      expect(conditionService.getById(condition.id)).toBeNull();
    });

    it('should handle multiple conditions', () => {
      const c1 = conditionService.create({ name: 'Condition 1', diagnosisDate: null, notes: null });
      const c2 = conditionService.create({ name: 'Condition 2', diagnosisDate: null, notes: null });

      expect(conditionService.count()).toBe(2);
      expect(conditionService.getAll()).toHaveLength(2);

      conditionService.deleteAll();
      expect(conditionService.count()).toBe(0);
    });
  });

  describe('Medication Service', () => {
    it('should create, read, update, and delete medications', () => {
      const medication = medicationService.create({
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'Daily',
        startDate: '2020-01-01T00:00:00.000Z',
        notes: 'Blood thinner',
      });

      expect(medication.id).toBeDefined();
      expect(medication.name).toBe('Aspirin');
      expect(medicationService.count()).toBe(1);

      const retrieved = medicationService.getById(medication.id);
      expect(retrieved).toEqual(medication);

      const updated = medicationService.update(medication.id, { dosage: '200mg' });
      expect(updated.dosage).toBe('200mg');

      medicationService.delete(medication.id);
      expect(medicationService.count()).toBe(0);
    });

    it('should handle multiple medications', () => {
      medicationService.create({ name: 'Med 1', dosage: '10mg', frequency: 'Daily', startDate: null, notes: null });
      medicationService.create({ name: 'Med 2', dosage: '20mg', frequency: 'Weekly', startDate: null, notes: null });

      expect(medicationService.count()).toBe(2);

      medicationService.deleteAll();
      expect(medicationService.count()).toBe(0);
    });
  });

  describe('Allergy Service', () => {
    it('should create, read, update, and delete allergies', () => {
      const allergy = allergyService.create({
        allergen: 'Peanuts',
        severity: 'severe',
        reaction: 'Anaphylaxis',
      });

      expect(allergy.id).toBeDefined();
      expect(allergy.allergen).toBe('Peanuts');
      expect(allergyService.count()).toBe(1);

      const retrieved = allergyService.getById(allergy.id);
      expect(retrieved).toEqual(allergy);

      const updated = allergyService.update(allergy.id, { severity: 'moderate' });
      expect(updated.severity).toBe('moderate');

      allergyService.delete(allergy.id);
      expect(allergyService.count()).toBe(0);
    });

    it('should handle multiple allergies', () => {
      allergyService.create({ allergen: 'Allergy 1', severity: 'mild', reaction: null });
      allergyService.create({ allergen: 'Allergy 2', severity: null, reaction: null });

      expect(allergyService.count()).toBe(2);

      allergyService.deleteAll();
      expect(allergyService.count()).toBe(0);
    });
  });

  describe('Appointment Service', () => {
    it('should create, read, update, and delete appointments', () => {
      const appointment = appointmentService.create({
        appointmentDate: '2025-01-15T10:30:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Annual checkup',
        notes: 'All good',
      });

      expect(appointment.id).toBeDefined();
      expect(appointment.doctorName).toBe('Dr. Smith');
      expect(appointmentService.count()).toBe(1);

      const retrieved = appointmentService.getById(appointment.id);
      expect(retrieved).toEqual(appointment);

      const updated = appointmentService.update(appointment.id, { notes: 'Updated notes' });
      expect(updated.notes).toBe('Updated notes');

      appointmentService.delete(appointment.id);
      expect(appointmentService.count()).toBe(0);
    });

    it('should handle multiple appointments', () => {
      appointmentService.create({ appointmentDate: '2025-01-15T10:00:00.000Z', doctorName: 'Dr. A', reason: 'Checkup', notes: null });
      appointmentService.create({ appointmentDate: '2025-02-15T14:00:00.000Z', doctorName: 'Dr. B', reason: 'Follow-up', notes: null });

      expect(appointmentService.count()).toBe(2);

      appointmentService.deleteAll();
      expect(appointmentService.count()).toBe(0);
    });
  });

  describe('Document Service', () => {
    it('should upload, read, update, and delete documents', () => {
      const document = documentService.upload({
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024,
        base64Content: 'base64string',
        description: 'Test document',
      });

      expect(document.id).toBeDefined();
      expect(document.filename).toBe('test.pdf');
      expect(documentService.count()).toBe(1);

      const retrieved = documentService.getById(document.id);
      expect(retrieved).toEqual(document);

      const updated = documentService.update(document.id, { description: 'Updated description' });
      expect(updated.description).toBe('Updated description');

      documentService.delete(document.id);
      expect(documentService.count()).toBe(0);
    });

    it('should handle multiple documents', () => {
      documentService.upload({ filename: 'doc1.pdf', mimeType: 'application/pdf', sizeBytes: 1024, base64Content: 'content1', description: null });
      documentService.upload({ filename: 'doc2.jpg', mimeType: 'image/jpeg', sizeBytes: 2048, base64Content: 'content2', description: null });

      expect(documentService.count()).toBe(2);

      documentService.deleteAll();
      expect(documentService.count()).toBe(0);
    });
  });

  describe('Cross-Service Data Isolation', () => {
    it('should isolate data across different services', () => {
      conditionService.create({ name: 'Test Condition', diagnosisDate: null, notes: null });
      medicationService.create({ name: 'Test Med', dosage: '10mg', frequency: 'Daily', startDate: null, notes: null });
      allergyService.create({ allergen: 'Test Allergy', severity: null, reaction: null });
      appointmentService.create({ appointmentDate: '2025-01-15T10:00:00.000Z', doctorName: 'Dr. Test', reason: 'Test', notes: null });
      documentService.upload({ filename: 'test.pdf', mimeType: 'application/pdf', sizeBytes: 1024, base64Content: 'test', description: null });

      expect(conditionService.count()).toBe(1);
      expect(medicationService.count()).toBe(1);
      expect(allergyService.count()).toBe(1);
      expect(appointmentService.count()).toBe(1);
      expect(documentService.count()).toBe(1);

      conditionService.deleteAll();
      expect(conditionService.count()).toBe(0);
      expect(medicationService.count()).toBe(1);
      expect(allergyService.count()).toBe(1);
      expect(appointmentService.count()).toBe(1);
      expect(documentService.count()).toBe(1);

      medicationService.deleteAll();
      allergyService.deleteAll();
      appointmentService.deleteAll();
      documentService.deleteAll();
    });
  });
});
