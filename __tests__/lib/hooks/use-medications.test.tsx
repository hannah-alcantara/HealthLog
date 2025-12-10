import { renderHook, act, waitFor } from '@testing-library/react';
import { useMedications } from '@/lib/hooks/use-medications';
import { medicationService } from '@/lib/storage/medical-history';

jest.mock('@/lib/storage/medical-history', () => ({
  medicationService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('useMedications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should load medications on mount', async () => {
    const mockMedications = [
      {
        id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
        name: 'Aspirin',
        dosage: '100mg',
        frequency: 'Daily',
        startDate: null,
        notes: null,
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      },
    ];

    (medicationService.getAll as jest.Mock).mockReturnValue(mockMedications);

    const { result } = renderHook(() => useMedications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.medications).toEqual(mockMedications);
    expect(result.current.error).toBeNull();
  });

  it('should create a medication', async () => {
    (medicationService.getAll as jest.Mock).mockReturnValue([]);

    const newMedication = {
      id: 'b2c3d4e5-f6a7-4901-9bcd-ef1234567890',
      name: 'Ibuprofen',
      dosage: '200mg',
      frequency: 'As needed',
      startDate: null,
      notes: null,
      createdAt: '2025-01-10T11:00:00.000Z',
      updatedAt: '2025-01-10T11:00:00.000Z',
    };

    (medicationService.create as jest.Mock).mockReturnValue(newMedication);

    const { result } = renderHook(() => useMedications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.create({
        name: 'Ibuprofen',
        dosage: '200mg',
        frequency: 'As needed',
        startDate: null,
        notes: null,
      });
    });

    expect(result.current.medications).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('should update and delete medications', async () => {
    const medication = {
      id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
      name: 'Aspirin',
      dosage: '100mg',
      frequency: 'Daily',
      startDate: null,
      notes: null,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    };

    (medicationService.getAll as jest.Mock).mockReturnValue([medication]);
    (medicationService.update as jest.Mock).mockReturnValue({ ...medication, dosage: '200mg' });
    (medicationService.delete as jest.Mock).mockImplementation(() => {});

    const { result } = renderHook(() => useMedications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.update(medication.id, { dosage: '200mg' });
    });

    expect(result.current.medications[0].dosage).toBe('200mg');

    await act(async () => {
      await result.current.remove(medication.id);
    });

    expect(result.current.medications).toHaveLength(0);
  });
});
