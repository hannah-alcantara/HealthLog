import {
  appointmentSchema,
  createAppointmentSchema,
  type Appointment,
  type CreateAppointmentInput,
} from '@/lib/schemas/appointment';

describe('Appointment Schema', () => {
  const validAppointment: Appointment = {
    id: 'd4e5f6a7-b8c9-4123-9abc-def012345678',
    appointmentDate: '2025-01-15T10:30:00.000Z',
    doctorName: 'Dr. Jane Smith',
    reason: 'Annual checkup',
    notes: 'Blood pressure normal, weight stable',
    createdAt: '2025-01-10T14:30:00.000Z',
    updatedAt: '2025-01-10T14:30:00.000Z',
  };

  describe('appointmentSchema', () => {
    it('should validate a complete appointment object', () => {
      expect(() => appointmentSchema.parse(validAppointment)).not.toThrow();
    });

    it('should validate appointment with null notes', () => {
      const appointment = { ...validAppointment, notes: null };
      expect(() => appointmentSchema.parse(appointment)).not.toThrow();
    });

    it('should trim doctorName and reason', () => {
      const appointment = {
        ...validAppointment,
        doctorName: '  Dr. John Doe  ',
        reason: '  Follow-up visit  ',
      };
      const result = appointmentSchema.parse(appointment);
      expect(result.doctorName).toBe('Dr. John Doe');
      expect(result.reason).toBe('Follow-up visit');
    });

    it('should reject invalid UUID', () => {
      const appointment = { ...validAppointment, id: 'invalid-uuid' };
      expect(() => appointmentSchema.parse(appointment)).toThrow();
    });

    it('should reject empty doctorName', () => {
      const appointment = { ...validAppointment, doctorName: '' };
      expect(() => appointmentSchema.parse(appointment)).toThrow('Doctor name is required');
    });

    it('should reject empty reason', () => {
      const appointment = { ...validAppointment, reason: '' };
      expect(() => appointmentSchema.parse(appointment)).toThrow('Reason for visit is required');
    });

    it('should reject doctorName exceeding 200 characters', () => {
      const appointment = { ...validAppointment, doctorName: 'a'.repeat(201) };
      expect(() => appointmentSchema.parse(appointment)).toThrow();
    });

    it('should reject reason exceeding 500 characters', () => {
      const appointment = { ...validAppointment, reason: 'a'.repeat(501) };
      expect(() => appointmentSchema.parse(appointment)).toThrow();
    });

    it('should reject notes exceeding 2000 characters', () => {
      const appointment = { ...validAppointment, notes: 'a'.repeat(2001) };
      expect(() => appointmentSchema.parse(appointment)).toThrow();
    });

    it('should reject invalid appointmentDate format', () => {
      const appointment = { ...validAppointment, appointmentDate: '2025-01-15' };
      expect(() => appointmentSchema.parse(appointment)).toThrow();
    });

    it('should reject invalid createdAt format', () => {
      const appointment = { ...validAppointment, createdAt: 'not-a-datetime' };
      expect(() => appointmentSchema.parse(appointment)).toThrow();
    });

    it('should reject invalid updatedAt format', () => {
      const appointment = { ...validAppointment, updatedAt: 'invalid' };
      expect(() => appointmentSchema.parse(appointment)).toThrow();
    });

    it('should reject missing required fields', () => {
      const appointment = { appointmentDate: '2025-01-15T10:30:00.000Z' };
      expect(() => appointmentSchema.parse(appointment)).toThrow();
    });
  });

  describe('createAppointmentSchema', () => {
    const validInput: CreateAppointmentInput = {
      appointmentDate: '2025-02-10T14:00:00.000Z',
      doctorName: 'Dr. Michael Brown',
      reason: 'Vaccination appointment',
      notes: 'Flu shot administered',
    };

    it('should validate valid create input', () => {
      expect(() => createAppointmentSchema.parse(validInput)).not.toThrow();
    });

    it('should validate input with null notes', () => {
      const input = { ...validInput, notes: null };
      expect(() => createAppointmentSchema.parse(input)).not.toThrow();
    });

    it('should validate input with long notes (within limit)', () => {
      const input = { ...validInput, notes: 'a'.repeat(2000) };
      expect(() => createAppointmentSchema.parse(input)).not.toThrow();
    });

    it('should reject input with id field', () => {
      const input = { ...validInput, id: 'some-uuid' };
      const result = createAppointmentSchema.parse(input);
      expect(result).not.toHaveProperty('id');
    });

    it('should reject input with createdAt field', () => {
      const input = { ...validInput, createdAt: '2025-01-10T14:30:00.000Z' };
      const result = createAppointmentSchema.parse(input);
      expect(result).not.toHaveProperty('createdAt');
    });

    it('should reject input with updatedAt field', () => {
      const input = { ...validInput, updatedAt: '2025-01-10T14:30:00.000Z' };
      const result = createAppointmentSchema.parse(input);
      expect(result).not.toHaveProperty('updatedAt');
    });

    it('should reject empty required fields', () => {
      const input = {
        appointmentDate: '',
        doctorName: '',
        reason: '',
        notes: null,
      };
      expect(() => createAppointmentSchema.parse(input)).toThrow();
    });

    it('should reject invalid appointmentDate format', () => {
      const input = { ...validInput, appointmentDate: '2025-02-10' };
      expect(() => createAppointmentSchema.parse(input)).toThrow();
    });

    it('should trim doctorName and reason in input', () => {
      const input = {
        ...validInput,
        doctorName: '  Dr. Sarah Lee  ',
        reason: '  Consultation  ',
      };
      const result = createAppointmentSchema.parse(input);
      expect(result.doctorName).toBe('Dr. Sarah Lee');
      expect(result.reason).toBe('Consultation');
    });
  });
});
