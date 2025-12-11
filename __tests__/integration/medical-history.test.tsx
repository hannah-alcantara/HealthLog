import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MedicalHistoryPage from '@/app/medical-history/page';

// Mock the storage services
jest.mock('@/lib/storage/medical-history', () => ({
  conditionService: {
    getAll: jest.fn(() => []),
    create: jest.fn((input) => ({
      id: 'test-id-1',
      ...input,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    })),
    update: jest.fn(),
    delete: jest.fn(),
  },
  medicationService: {
    getAll: jest.fn(() => []),
    create: jest.fn((input) => ({
      id: 'test-id-2',
      ...input,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    })),
    update: jest.fn(),
    delete: jest.fn(),
  },
  allergyService: {
    getAll: jest.fn(() => []),
    create: jest.fn((input) => ({
      id: 'test-id-3',
      ...input,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    })),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Medical History Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render the medical history page with all tabs', async () => {
    render(<MedicalHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Medical History')).toBeInTheDocument();
    });

    expect(screen.getByText(/Conditions/)).toBeInTheDocument();
    expect(screen.getByText(/Medications/)).toBeInTheDocument();
    expect(screen.getByText(/Allergies/)).toBeInTheDocument();
  });

  it('should show empty state for conditions', async () => {
    render(<MedicalHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText(/No conditions recorded/)).toBeInTheDocument();
    });
  });

  it('should open add condition dialog when clicking Add Condition button', async () => {
    const user = userEvent.setup();
    render(<MedicalHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Add Condition')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Condition/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/Condition Name/i)).toBeInTheDocument();
    });
  });

  it('should switch between tabs', async () => {
    const user = userEvent.setup();
    render(<MedicalHistoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Medical History')).toBeInTheDocument();
    });

    // Click on Medications tab
    const medicationsTab = screen.getByRole('button', { name: /Medications/ });
    await user.click(medicationsTab);

    await waitFor(() => {
      expect(screen.getByText(/No medications recorded/)).toBeInTheDocument();
    });

    // Click on Allergies tab
    const allergiesTab = screen.getByRole('button', { name: /Allergies/ });
    await user.click(allergiesTab);

    await waitFor(() => {
      expect(screen.getByText(/No allergies recorded/)).toBeInTheDocument();
    });
  });

  it('should handle form validation errors', async () => {
    const user = userEvent.setup();
    render(<MedicalHistoryPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Condition/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Condition/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const saveButton = within(screen.getByRole('dialog')).getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Condition name is required/i)).toBeInTheDocument();
    });
  });
});
