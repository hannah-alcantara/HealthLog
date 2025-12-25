import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SymptomsList } from '@/components/symptoms/symptoms-list';
import type { Symptom } from '@/lib/schemas/symptom';

describe('SymptomsList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAdd = jest.fn();

  const mockSymptoms: Symptom[] = [
    {
      id: '1',
      symptomType: 'Headache',
      category: 'neurological',
      severity: 7,
      bodyPart: 'Head',
      triggers: 'Stress, lack of sleep',
      notes: 'Sharp pain on left side',
      loggedAt: '2024-01-15T10:30:00.000Z',
    },
    {
      id: '2',
      symptomType: 'Fatigue',
      category: 'general',
      severity: 4,
      bodyPart: undefined,
      triggers: undefined,
      notes: undefined,
      loggedAt: '2024-01-14T14:00:00.000Z',
    },
    {
      id: '3',
      symptomType: 'Severe migraine',
      category: 'pain',
      severity: 10,
      bodyPart: 'Head',
      triggers: 'Bright lights',
      notes: 'Worst pain ever experienced',
      loggedAt: '2024-01-13T08:15:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.confirm
    global.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the title and add button', () => {
      render(
        <SymptomsList
          symptoms={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      expect(screen.getByText('Symptom Log')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log new symptom/i })).toBeInTheDocument();
    });

    it('should render empty state when no symptoms', () => {
      render(
        <SymptomsList
          symptoms={[]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      expect(
        screen.getByText(/no symptoms logged yet/i)
      ).toBeInTheDocument();
    });

    it('should render all symptoms in the list', () => {
      render(
        <SymptomsList
          symptoms={mockSymptoms}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      expect(screen.getByText('Headache')).toBeInTheDocument();
      expect(screen.getByText('Fatigue')).toBeInTheDocument();
      expect(screen.getByText('Severe migraine')).toBeInTheDocument();
    });

    it('should display symptom details correctly', () => {
      render(
        <SymptomsList
          symptoms={[mockSymptoms[0]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      expect(screen.getByText('Headache')).toBeInTheDocument();
      expect(screen.getByText('Severity: 7/10')).toBeInTheDocument();
      expect(screen.getByText('Neurological')).toBeInTheDocument();
      expect(screen.getByText('📍 Head')).toBeInTheDocument();
      expect(screen.getByText('Stress, lack of sleep')).toBeInTheDocument();
      expect(screen.getByText('Sharp pain on left side')).toBeInTheDocument();
    });

    it('should not render optional fields when they are undefined', () => {
      render(
        <SymptomsList
          symptoms={[mockSymptoms[1]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      expect(screen.getByText('Fatigue')).toBeInTheDocument();
      expect(screen.getByText('Severity: 4/10')).toBeInTheDocument();
      expect(screen.queryByText(/triggers/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/notes/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/📍/)).not.toBeInTheDocument();
    });
  });

  describe('Severity Colors', () => {
    it('should show green color for low severity (1-3)', () => {
      const lowSeveritySymptom: Symptom = {
        ...mockSymptoms[0],
        severity: 2,
      };

      const { container } = render(
        <SymptomsList
          symptoms={[lowSeveritySymptom]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      const severityBadge = screen.getByText('Severity: 2/10');
      expect(severityBadge).toHaveClass('text-green-600');
      expect(severityBadge).toHaveClass('bg-green-100');
    });

    it('should show yellow color for medium severity (4-6)', () => {
      const { container } = render(
        <SymptomsList
          symptoms={[mockSymptoms[1]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      const severityBadge = screen.getByText('Severity: 4/10');
      expect(severityBadge).toHaveClass('text-yellow-600');
      expect(severityBadge).toHaveClass('bg-yellow-100');
    });

    it('should show red color for high severity (7-10)', () => {
      const { container } = render(
        <SymptomsList
          symptoms={[mockSymptoms[2]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      const severityBadge = screen.getByText('Severity: 10/10');
      expect(severityBadge).toHaveClass('text-red-600');
      expect(severityBadge).toHaveClass('bg-red-100');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      render(
        <SymptomsList
          symptoms={[mockSymptoms[0]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      // Date format should be "Jan 15, 2024, 10:30 AM" or similar based on locale
      expect(screen.getByText(/Jan 15, 2024/i)).toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    it('should call onAdd when Log New Symptom button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SymptomsList
          symptoms={mockSymptoms}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      const addButton = screen.getByRole('button', { name: /log new symptom/i });
      await user.click(addButton);

      expect(mockOnAdd).toHaveBeenCalledTimes(1);
    });

    it('should call onEdit with symptom when Edit button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SymptomsList
          symptoms={[mockSymptoms[0]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledTimes(1);
      expect(mockOnEdit).toHaveBeenCalledWith(mockSymptoms[0]);
    });

    it('should show confirmation dialog before deleting', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm');

      render(
        <SymptomsList
          symptoms={[mockSymptoms[0]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete this symptom log?'
      );
    });

    it('should call onDelete with symptom id when confirmed', async () => {
      const user = userEvent.setup();
      global.confirm = jest.fn(() => true);

      render(
        <SymptomsList
          symptoms={[mockSymptoms[0]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });

    it('should not call onDelete when confirmation is cancelled', async () => {
      const user = userEvent.setup();
      global.confirm = jest.fn(() => false);

      render(
        <SymptomsList
          symptoms={[mockSymptoms[0]]}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Symptoms', () => {
    it('should render edit and delete buttons for each symptom', () => {
      render(
        <SymptomsList
          symptoms={mockSymptoms}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

      expect(editButtons).toHaveLength(3);
      expect(deleteButtons).toHaveLength(3);
    });

    it('should call onEdit with correct symptom when editing different symptoms', async () => {
      const user = userEvent.setup();

      render(
        <SymptomsList
          symptoms={mockSymptoms}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      const editButtons = screen.getAllByRole('button', { name: /edit/i });

      await user.click(editButtons[0]);
      expect(mockOnEdit).toHaveBeenCalledWith(mockSymptoms[0]);

      await user.click(editButtons[1]);
      expect(mockOnEdit).toHaveBeenCalledWith(mockSymptoms[1]);

      await user.click(editButtons[2]);
      expect(mockOnEdit).toHaveBeenCalledWith(mockSymptoms[2]);

      expect(mockOnEdit).toHaveBeenCalledTimes(3);
    });
  });

  describe('Category Display', () => {
    it('should display category labels correctly', () => {
      render(
        <SymptomsList
          symptoms={mockSymptoms}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAdd={mockOnAdd}
        />
      );

      expect(screen.getByText('Neurological')).toBeInTheDocument();
      expect(screen.getByText('Pain')).toBeInTheDocument();
      // Note: The second symptom uses 'general' category which displays as 'General'
      const allText = screen.getByText((content, element) => {
        return element?.textContent?.includes('General') || false;
      });
      expect(allText).toBeInTheDocument();
    });
  });
});