import { renderHook, waitFor } from '@testing-library/react';
import { useAppointments } from '@/lib/hooks/use-appointments';
import { appointmentService } from '@/lib/storage/appointments';
import type { CreateAppointmentInput } from '@/lib/schemas/appointment';

jest.mock('@/lib/storage/appointments', () => ({
  appointmentService: {
    getAllSorted: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('useAppointments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should load appointments on mount', async () => {
    const mockAppointments = [
      {
        id: '1',
        appointmentDate: '2024-03-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Checkup',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
        createdAt: '2024-03-01T10:00:00.000Z',
        updatedAt: '2024-03-01T10:00:00.000Z',
      },
    ];

    (appointmentService.getAllSorted as jest.Mock).mockReturnValue(mockAppointments);

    const { result } = renderHook(() => useAppointments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.appointments).toEqual(mockAppointments);
    expect(result.current.error).toBeNull();
  });

  it('should create an appointment', async () => {
    (appointmentService.getAllSorted as jest.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useAppointments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const input: CreateAppointmentInput = {
      appointmentDate: '2024-03-15T10:00:00.000Z',
      doctorName: 'Dr. Smith',
      reason: 'Annual checkup',
      symptoms: 'Headache',
      notes: null,
      generatedQuestions: null,
    };

    const newAppointment = {
      id: '1',
      ...input,
      createdAt: '2024-03-01T10:00:00.000Z',
      updatedAt: '2024-03-01T10:00:00.000Z',
    };

    (appointmentService.create as jest.Mock).mockReturnValue(newAppointment);

    await result.current.create(input);

    expect(appointmentService.create).toHaveBeenCalledWith(input);
    expect(result.current.appointments).toContainEqual(newAppointment);
  });

  it('should update an appointment', async () => {
    const existingAppointment = {
      id: '1',
      appointmentDate: '2024-03-15T10:00:00.000Z',
      doctorName: 'Dr. Smith',
      reason: 'Checkup',
      symptoms: null,
      notes: null,
      generatedQuestions: null,
      createdAt: '2024-03-01T10:00:00.000Z',
      updatedAt: '2024-03-01T10:00:00.000Z',
    };

    (appointmentService.getAllSorted as jest.Mock).mockReturnValue([existingAppointment]);

    const { result } = renderHook(() => useAppointments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updatedAppointment = {
      ...existingAppointment,
      notes: 'All tests normal',
      updatedAt: '2024-03-02T10:00:00.000Z',
    };

    (appointmentService.update as jest.Mock).mockReturnValue(updatedAppointment);
    (appointmentService.getAllSorted as jest.Mock).mockReturnValue([updatedAppointment]);

    await result.current.update('1', { notes: 'All tests normal' });

    expect(appointmentService.update).toHaveBeenCalledWith('1', { notes: 'All tests normal' });
    expect(result.current.appointments[0].notes).toBe('All tests normal');
  });

  it('should delete an appointment', async () => {
    const existingAppointment = {
      id: '1',
      appointmentDate: '2024-03-15T10:00:00.000Z',
      doctorName: 'Dr. Smith',
      reason: 'Checkup',
      symptoms: null,
      notes: null,
      generatedQuestions: null,
      createdAt: '2024-03-01T10:00:00.000Z',
      updatedAt: '2024-03-01T10:00:00.000Z',
    };

    (appointmentService.getAllSorted as jest.Mock).mockReturnValue([existingAppointment]);

    const { result } = renderHook(() => useAppointments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.remove('1');

    expect(appointmentService.delete).toHaveBeenCalledWith('1');
    expect(result.current.appointments).toHaveLength(0);
  });

  it('should handle errors when loading appointments', async () => {
    const errorMessage = 'Failed to load';
    (appointmentService.getAllSorted as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    const { result } = renderHook(() => useAppointments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.appointments).toEqual([]);
  });

  it('should refresh appointments', async () => {
    const initialAppointments = [
      {
        id: '1',
        appointmentDate: '2024-03-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Checkup',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
        createdAt: '2024-03-01T10:00:00.000Z',
        updatedAt: '2024-03-01T10:00:00.000Z',
      },
    ];

    (appointmentService.getAllSorted as jest.Mock).mockReturnValue(initialAppointments);

    const { result } = renderHook(() => useAppointments());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updatedAppointments = [
      ...initialAppointments,
      {
        id: '2',
        appointmentDate: '2024-04-20T14:00:00.000Z',
        doctorName: 'Dr. Jones',
        reason: 'Follow-up',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
        createdAt: '2024-04-01T10:00:00.000Z',
        updatedAt: '2024-04-01T10:00:00.000Z',
      },
    ];

    (appointmentService.getAllSorted as jest.Mock).mockReturnValue(updatedAppointments);

    result.current.refresh();

    await waitFor(() => {
      expect(result.current.appointments).toHaveLength(2);
    });
  });
});
