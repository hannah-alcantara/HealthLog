import { renderHook, act, waitFor } from '@testing-library/react';
import { useAllergies } from '@/lib/hooks/use-allergies';
import { allergyService } from '@/lib/storage/medical-history';

jest.mock('@/lib/storage/medical-history', () => ({
  allergyService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('useAllergies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should load allergies on mount', async () => {
    const mockAllergies = [
      {
        id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
        allergen: 'Peanuts',
        severity: 'severe' as const,
        reaction: 'Anaphylaxis',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      },
    ];

    (allergyService.getAll as jest.Mock).mockReturnValue(mockAllergies);

    const { result } = renderHook(() => useAllergies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.allergies).toEqual(mockAllergies);
    expect(result.current.error).toBeNull();
  });

  it('should create an allergy', async () => {
    (allergyService.getAll as jest.Mock).mockReturnValue([]);

    const newAllergy = {
      id: 'b2c3d4e5-f6a7-4901-9bcd-ef1234567890',
      allergen: 'Shellfish',
      severity: 'moderate' as const,
      reaction: null,
      createdAt: '2025-01-10T11:00:00.000Z',
      updatedAt: '2025-01-10T11:00:00.000Z',
    };

    (allergyService.create as jest.Mock).mockReturnValue(newAllergy);

    const { result } = renderHook(() => useAllergies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.create({
        allergen: 'Shellfish',
        severity: 'moderate',
        reaction: null,
      });
    });

    expect(result.current.allergies).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('should update and delete allergies', async () => {
    const allergy = {
      id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
      allergen: 'Peanuts',
      severity: 'severe' as const,
      reaction: null,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    };

    (allergyService.getAll as jest.Mock).mockReturnValue([allergy]);
    (allergyService.update as jest.Mock).mockReturnValue({ ...allergy, severity: 'mild' as const });
    (allergyService.delete as jest.Mock).mockImplementation(() => {});

    const { result } = renderHook(() => useAllergies());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.update(allergy.id, { severity: 'mild' });
    });

    expect(result.current.allergies[0].severity).toBe('mild');

    await act(async () => {
      await result.current.remove(allergy.id);
    });

    expect(result.current.allergies).toHaveLength(0);
  });
});
