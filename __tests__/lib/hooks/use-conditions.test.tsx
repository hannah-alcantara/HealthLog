import { renderHook, act, waitFor } from '@testing-library/react';
import { useConditions } from '@/lib/hooks/use-conditions';
import { conditionService } from '@/lib/storage/medical-history';

// Mock the service
jest.mock('@/lib/storage/medical-history', () => ({
  conditionService: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('useConditions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should load conditions on mount', async () => {
    const mockConditions = [
      {
        id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
        name: 'Diabetes',
        diagnosisDate: '2020-01-01T00:00:00.000Z',
        notes: 'Type 2',
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      },
    ];

    (conditionService.getAll as jest.Mock).mockReturnValue(mockConditions);

    const { result } = renderHook(() => useConditions());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conditions).toEqual(mockConditions);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading error', async () => {
    (conditionService.getAll as jest.Mock).mockImplementation(() => {
      throw new Error('Load failed');
    });

    const { result } = renderHook(() => useConditions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Load failed');
    expect(result.current.conditions).toEqual([]);
  });

  it('should create a condition', async () => {
    (conditionService.getAll as jest.Mock).mockReturnValue([]);

    const newCondition = {
      id: 'b2c3d4e5-f6a7-4901-9bcd-ef1234567890',
      name: 'Hypertension',
      diagnosisDate: null,
      notes: null,
      createdAt: '2025-01-10T11:00:00.000Z',
      updatedAt: '2025-01-10T11:00:00.000Z',
    };

    (conditionService.create as jest.Mock).mockReturnValue(newCondition);

    const { result } = renderHook(() => useConditions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.create({ name: 'Hypertension', diagnosisDate: null, notes: null });
    });

    expect(result.current.conditions).toHaveLength(1);
    expect(result.current.conditions[0]).toEqual(newCondition);
    expect(result.current.error).toBeNull();
  });

  it('should handle create error', async () => {
    (conditionService.getAll as jest.Mock).mockReturnValue([]);
    (conditionService.create as jest.Mock).mockImplementation(() => {
      throw new Error('Create failed');
    });

    const { result } = renderHook(() => useConditions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.create({ name: 'Test', diagnosisDate: null, notes: null });
      });
    }).rejects.toThrow('Create failed');

    expect(result.current.error).toBe('Create failed');
  });

  it('should update a condition', async () => {
    const condition = {
      id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
      name: 'Diabetes',
      diagnosisDate: '2020-01-01T00:00:00.000Z',
      notes: 'Type 2',
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    };

    (conditionService.getAll as jest.Mock).mockReturnValue([condition]);

    const updatedCondition = { ...condition, notes: 'Updated notes', updatedAt: '2025-01-10T12:00:00.000Z' };
    (conditionService.update as jest.Mock).mockReturnValue(updatedCondition);

    const { result } = renderHook(() => useConditions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.update(condition.id, { notes: 'Updated notes' });
    });

    expect(result.current.conditions[0].notes).toBe('Updated notes');
    expect(result.current.error).toBeNull();
  });

  it('should handle update error', async () => {
    const condition = {
      id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
      name: 'Diabetes',
      diagnosisDate: null,
      notes: null,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    };

    (conditionService.getAll as jest.Mock).mockReturnValue([condition]);
    (conditionService.update as jest.Mock).mockImplementation(() => {
      throw new Error('Update failed');
    });

    const { result } = renderHook(() => useConditions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.update(condition.id, { notes: 'Test' });
      });
    }).rejects.toThrow('Update failed');

    expect(result.current.error).toBe('Update failed');
  });

  it('should delete a condition', async () => {
    const condition = {
      id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
      name: 'Diabetes',
      diagnosisDate: null,
      notes: null,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    };

    (conditionService.getAll as jest.Mock).mockReturnValue([condition]);
    (conditionService.delete as jest.Mock).mockImplementation(() => {});

    const { result } = renderHook(() => useConditions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conditions).toHaveLength(1);

    await act(async () => {
      await result.current.remove(condition.id);
    });

    expect(result.current.conditions).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('should handle delete error', async () => {
    const condition = {
      id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
      name: 'Diabetes',
      diagnosisDate: null,
      notes: null,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    };

    (conditionService.getAll as jest.Mock).mockReturnValue([condition]);
    (conditionService.delete as jest.Mock).mockImplementation(() => {
      throw new Error('Delete failed');
    });

    const { result } = renderHook(() => useConditions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(async () => {
      await act(async () => {
        await result.current.remove(condition.id);
      });
    }).rejects.toThrow('Delete failed');

    expect(result.current.error).toBe('Delete failed');
  });

  it('should refresh conditions', async () => {
    const initialConditions = [
      {
        id: 'a1b2c3d4-e5f6-4789-8abc-def012345678',
        name: 'Diabetes',
        diagnosisDate: null,
        notes: null,
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      },
    ];

    const refreshedConditions = [
      ...initialConditions,
      {
        id: 'b2c3d4e5-f6a7-4901-9bcd-ef1234567890',
        name: 'Hypertension',
        diagnosisDate: null,
        notes: null,
        createdAt: '2025-01-10T11:00:00.000Z',
        updatedAt: '2025-01-10T11:00:00.000Z',
      },
    ];

    (conditionService.getAll as jest.Mock).mockReturnValueOnce(initialConditions).mockReturnValueOnce(refreshedConditions);

    const { result } = renderHook(() => useConditions());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.conditions).toHaveLength(1);

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.conditions).toHaveLength(2);
    });
  });
});
