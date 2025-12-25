import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SymptomForm } from '@/components/symptoms/symptom-form';
import type { CreateSymptomInput } from '@/lib/schemas/symptom';

describe('SymptomForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all required form fields', () => {
      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      expect(screen.getByLabelText(/symptom type/i)).toBeInTheDocument();
      expect(screen.getByText(/category/i)).toBeInTheDocument();
      expect(screen.getByText(/severity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/body part/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/triggers/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      expect(screen.getByRole('button', { name: /log symptom/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should populate symptom type with default value', () => {
      const defaultValues: Partial<CreateSymptomInput> = {
        symptomType: 'Headache',
        category: 'neurological',
        severity: 7,
        bodyPart: 'Head',
        triggers: 'Stress, lack of sleep',
        notes: 'Sharp pain on left side',
        loggedAt: new Date('2024-01-15T10:30:00'),
      };

      render(
        <SymptomForm
          defaultValues={defaultValues}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      expect(screen.getByLabelText(/symptom type/i)).toHaveValue('Headache');
      expect(screen.getByLabelText(/body part/i)).toHaveValue('Head');
      expect(screen.getByLabelText(/triggers/i)).toHaveValue('Stress, lack of sleep');
      expect(screen.getByLabelText(/notes/i)).toHaveValue('Sharp pain on left side');
    });
  });

  describe('Validation', () => {
    it('should show error when symptom type is empty', async () => {
      const user = userEvent.setup();

      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/symptom type is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should require symptom type field', async () => {
      const user = userEvent.setup();

      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const symptomInput = screen.getByLabelText(/symptom type/i);
      await user.clear(symptomInput);

      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with form data when valid', async () => {
      const user = userEvent.setup();

      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      // Fill in symptom type
      const symptomInput = screen.getByLabelText(/symptom type/i);
      await user.clear(symptomInput);
      await user.type(symptomInput, 'Headache');

      // Fill in optional fields
      await user.type(screen.getByLabelText(/body part/i), 'Head');
      await user.type(screen.getByLabelText(/triggers/i), 'Stress');
      await user.type(screen.getByLabelText(/notes/i), 'Sharp pain');

      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        const submittedData = mockOnSubmit.mock.calls[0][0];
        expect(submittedData.symptomType).toBe('Headache');
        expect(submittedData.bodyPart).toBe('Head');
        expect(submittedData.triggers).toBe('Stress');
        expect(submittedData.notes).toBe('Sharp pain');
        expect(submittedData.loggedAt).toBeDefined();
      });
    });

    it('should disable submit button when isSubmitting is true', () => {
      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /saving\.\.\./i });
      expect(submitButton).toBeDisabled();
    });

    it('should not allow submission while isSubmitting', async () => {
      const user = userEvent.setup();

      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /saving\.\.\./i });
      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Cancel Action', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onSubmit when form is cancelled', async () => {
      const user = userEvent.setup();

      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      await user.type(screen.getByLabelText(/symptom type/i), 'Headache');

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Severity Slider', () => {
    it('should display severity value', () => {
      render(
        <SymptomForm
          defaultValues={{ severity: 7 }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      expect(screen.getByText(/severity: 7/i)).toBeInTheDocument();
    });

    it('should display default severity of 5', () => {
      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      expect(screen.getByText(/severity: 5/i)).toBeInTheDocument();
    });
  });

  describe('Optional Fields', () => {
    it('should allow submission without optional fields', async () => {
      const user = userEvent.setup();

      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      await user.type(screen.getByLabelText(/symptom type/i), 'Fatigue');

      const submitButton = screen.getByRole('button', { name: /log symptom/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        const submittedData = mockOnSubmit.mock.calls[0][0];
        expect(submittedData.symptomType).toBe('Fatigue');
      });
    });
  });

  describe('Default Category', () => {
    it('should have other as default category', () => {
      render(
        <SymptomForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          isSubmitting={false}
        />
      );

      // The select component shows "Other" as default (getAllByText since it appears in both visible UI and hidden select)
      expect(screen.getAllByText('Other')[0]).toBeInTheDocument();
    });
  });
});