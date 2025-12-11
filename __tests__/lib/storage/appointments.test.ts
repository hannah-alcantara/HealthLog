import { appointmentService } from '@/lib/storage/appointments';
import type { CreateAppointmentInput } from '@/lib/schemas/appointment';

describe('Appointment Storage Service', () => {
  beforeEach(() => {
    localStorage.clear();
    appointmentService.deleteAll();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('create', () => {
    it('should create a new appointment with all fields', () => {
      const input: CreateAppointmentInput = {
        appointmentDate: '2024-01-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Annual checkup',
        symptoms: 'Mild headache',
        notes: 'Blood pressure normal',
        generatedQuestions: ['What is my blood pressure?', 'Should I change medication?'],
      };

      const appointment = appointmentService.create(input);

      expect(appointment.id).toBeDefined();
      expect(appointment.appointmentDate).toBe('2024-01-15T10:00:00.000Z');
      expect(appointment.doctorName).toBe('Dr. Smith');
      expect(appointment.reason).toBe('Annual checkup');
      expect(appointment.symptoms).toBe('Mild headache');
      expect(appointment.notes).toBe('Blood pressure normal');
      expect(appointment.generatedQuestions).toEqual(['What is my blood pressure?', 'Should I change medication?']);
      expect(appointment.createdAt).toBeDefined();
      expect(appointment.updatedAt).toBeDefined();
    });

    it('should create appointment with nullable fields as null', () => {
      const input: CreateAppointmentInput = {
        appointmentDate: '2024-01-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Consultation',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
      };

      const appointment = appointmentService.create(input);

      expect(appointment.symptoms).toBeNull();
      expect(appointment.notes).toBeNull();
      expect(appointment.generatedQuestions).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no appointments exist', () => {
      const appointments = appointmentService.getAll();
      expect(appointments).toEqual([]);
    });

    it('should return all appointments', () => {
      const input1: CreateAppointmentInput = {
        appointmentDate: '2024-01-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Checkup',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
      };

      const input2: CreateAppointmentInput = {
        appointmentDate: '2024-02-20T14:30:00.000Z',
        doctorName: 'Dr. Jones',
        reason: 'Follow-up',
        symptoms: 'Cough',
        notes: null,
        generatedQuestions: null,
      };

      appointmentService.create(input1);
      appointmentService.create(input2);

      const appointments = appointmentService.getAll();
      expect(appointments).toHaveLength(2);
    });
  });

  describe('getAllSorted', () => {
    it('should return appointments sorted by date descending (newest first)', () => {
      const input1: CreateAppointmentInput = {
        appointmentDate: '2024-01-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Checkup',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
      };

      const input2: CreateAppointmentInput = {
        appointmentDate: '2024-03-20T14:30:00.000Z',
        doctorName: 'Dr. Jones',
        reason: 'Follow-up',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
      };

      const input3: CreateAppointmentInput = {
        appointmentDate: '2024-02-10T09:00:00.000Z',
        doctorName: 'Dr. Lee',
        reason: 'Consultation',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
      };

      appointmentService.create(input1);
      appointmentService.create(input2);
      appointmentService.create(input3);

      const sorted = appointmentService.getAllSorted();

      expect(sorted).toHaveLength(3);
      expect(sorted[0].appointmentDate).toBe('2024-03-20T14:30:00.000Z'); // Newest
      expect(sorted[1].appointmentDate).toBe('2024-02-10T09:00:00.000Z'); // Middle
      expect(sorted[2].appointmentDate).toBe('2024-01-15T10:00:00.000Z'); // Oldest
    });
  });

  describe('getById', () => {
    it('should return appointment by id', () => {
      const input: CreateAppointmentInput = {
        appointmentDate: '2024-01-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Checkup',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
      };

      const created = appointmentService.create(input);
      const found = appointmentService.getById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.doctorName).toBe('Dr. Smith');
    });

    it('should return null for non-existent id', () => {
      const found = appointmentService.getById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('update', () => {
    it('should update appointment fields', () => {
      const input: CreateAppointmentInput = {
        appointmentDate: '2024-01-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Checkup',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
      };

      const created = appointmentService.create(input);
      const updated = appointmentService.update(created.id, {
        notes: 'Everything looks good',
        symptoms: 'None reported',
      });

      expect(updated.id).toBe(created.id);
      expect(updated.notes).toBe('Everything looks good');
      expect(updated.symptoms).toBe('None reported');
      expect(updated.doctorName).toBe('Dr. Smith'); // Unchanged field
    });

    it('should update generatedQuestions array', () => {
      const input: CreateAppointmentInput = {
        appointmentDate: '2024-01-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Checkup',
        symptoms: 'Headache',
        notes: null,
        generatedQuestions: null,
      };

      const created = appointmentService.create(input);
      const updated = appointmentService.update(created.id, {
        generatedQuestions: ['Question 1', 'Question 2', 'Question 3'],
      });

      expect(updated.generatedQuestions).toEqual(['Question 1', 'Question 2', 'Question 3']);
    });
  });

  describe('delete', () => {
    it('should delete an appointment', () => {
      const input: CreateAppointmentInput = {
        appointmentDate: '2024-01-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Checkup',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
      };

      const created = appointmentService.create(input);
      appointmentService.delete(created.id);

      const found = appointmentService.getById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('count', () => {
    it('should return 0 when no appointments exist', () => {
      expect(appointmentService.count()).toBe(0);
    });

    it('should return correct count', () => {
      const input1: CreateAppointmentInput = {
        appointmentDate: '2024-01-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Checkup',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
      };

      const input2: CreateAppointmentInput = {
        appointmentDate: '2024-02-20T14:30:00.000Z',
        doctorName: 'Dr. Jones',
        reason: 'Follow-up',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
      };

      appointmentService.create(input1);
      appointmentService.create(input2);

      expect(appointmentService.count()).toBe(2);
    });
  });
});
