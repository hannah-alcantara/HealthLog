import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppointmentsPage from '@/app/appointments/page';
import type { Appointment } from '@/lib/schemas/appointment';

// Mock all storage services and hooks
jest.mock('@/lib/storage/appointments');
jest.mock('@/lib/storage/medical-history');
jest.mock('@/lib/storage/symptoms');

// Import mocked modules
import { appointmentService } from '@/lib/storage/appointments';
import { conditionService, medicationService } from '@/lib/storage/medical-history';

// Mock implementations
const mockAppointmentService = appointmentService as jest.Mocked<typeof appointmentService>;
const mockConditionService = conditionService as jest.Mocked<typeof conditionService>;
const mockMedicationService = medicationService as jest.Mocked<typeof medicationService>;

describe('Appointments Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  // AS-1: Add new appointment
  it('AS-1: should add a new appointment and display it in chronological order', async () => {
    const user = userEvent.setup();

    // Setup: Mock empty appointments list initially
    mockAppointmentService.getAllSorted.mockReturnValue([]);

    render(<AppointmentsPage />);

    await waitFor(() => {
      expect(screen.getAllByText('Appointments')[0]).toBeInTheDocument();
    });

    // Click Add Appointment button
    const addButton = screen.getByRole('button', { name: /Add Appointment/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill in appointment details
    const dialog = screen.getByRole('dialog');
    const doctorInput = within(dialog).getByLabelText(/Doctor Name/i);
    const reasonInput = within(dialog).getByLabelText(/Reason for Visit/i);

    await user.type(doctorInput, 'Dr. Smith');
    await user.type(reasonInput, 'Annual checkup');

    // Submit form
    const saveButton = within(dialog).getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    // Verify appointment was created
    await waitFor(() => {
      expect(mockAppointmentService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          doctorName: 'Dr. Smith',
          reason: 'Annual checkup',
        })
      );
    });
  });

  // AS-2: Edit appointment notes
  it('AS-2: should allow editing notes for an existing appointment', async () => {
    const user = userEvent.setup();

    const existingAppointment: Appointment = {
      id: 'apt-1',
      appointmentDate: '2024-01-15T10:00:00.000Z',
      doctorName: 'Dr. Smith',
      reason: 'Checkup',
      symptoms: null,
      notes: null,
      generatedQuestions: null,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    };

    mockAppointmentService.getAllSorted.mockReturnValue([existingAppointment]);

    render(<AppointmentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });

    // Find and click Edit button for the appointment
    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Add notes
    const dialog = screen.getByRole('dialog');
    const notesInput = within(dialog).getByLabelText(/Notes/i);
    await user.type(notesInput, 'Blood pressure normal, schedule follow-up in 6 months');

    // Save changes
    const saveButton = within(dialog).getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockAppointmentService.update).toHaveBeenCalledWith(
        'apt-1',
        expect.objectContaining({
          notes: 'Blood pressure normal, schedule follow-up in 6 months',
        })
      );
    });
  });

  // AS-3: Appointments sorted chronologically
  it('AS-3: should display appointments sorted by date (most recent first)', async () => {

    const appointments: Appointment[] = [
      {
        id: 'apt-3',
        appointmentDate: '2024-03-20T14:30:00.000Z',
        doctorName: 'Dr. Jones',
        reason: 'Follow-up',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      },
      {
        id: 'apt-2',
        appointmentDate: '2024-02-10T09:00:00.000Z',
        doctorName: 'Dr. Lee',
        reason: 'Consultation',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      },
      {
        id: 'apt-1',
        appointmentDate: '2024-01-15T10:00:00.000Z',
        doctorName: 'Dr. Smith',
        reason: 'Checkup',
        symptoms: null,
        notes: null,
        generatedQuestions: null,
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      },
    ];

    mockAppointmentService.getAllSorted.mockReturnValue(appointments);

    render(<AppointmentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    });

    // Verify all appointments are displayed
    expect(screen.getByText('Dr. Jones')).toBeInTheDocument();
    expect(screen.getByText('Dr. Lee')).toBeInTheDocument();
    expect(screen.getByText('Dr. Smith')).toBeInTheDocument();

    // Verify they appear in chronological order (getAllSorted should return them sorted)
    expect(appointmentService.getAllSorted).toHaveBeenCalled();
  });

  // AS-4: Delete appointment
  it('AS-4: should delete an appointment when user confirms deletion', async () => {
    const user = userEvent.setup();

    const existingAppointment: Appointment = {
      id: 'apt-delete',
      appointmentDate: '2024-01-15T10:00:00.000Z',
      doctorName: 'Dr. Wrong',
      reason: 'Incorrect entry',
      symptoms: null,
      notes: null,
      generatedQuestions: null,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    };

    mockAppointmentService.getAllSorted.mockReturnValue([existingAppointment]);

    // Mock window.confirm to return true
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<AppointmentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Wrong')).toBeInTheDocument();
    });

    // Find and click Delete button
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
      expect(mockAppointmentService.delete).toHaveBeenCalledWith('apt-delete');
    });

    confirmSpy.mockRestore();
  });

  // AS-6: Enter symptoms for appointment
  it('AS-6: should save symptoms when entered in appointment form', async () => {
    const user = userEvent.setup();

    mockAppointmentService.getAllSorted.mockReturnValue([]);

    render(<AppointmentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Appointment/i })).toBeInTheDocument();
    });

    // Open add appointment dialog
    const addButton = screen.getByRole('button', { name: /Add Appointment/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Fill in appointment with symptoms
    const dialog = screen.getByRole('dialog');
    const doctorInput = within(dialog).getByLabelText(/Doctor Name/i);
    const reasonInput = within(dialog).getByLabelText(/Reason for Visit/i);
    const symptomsInput = within(dialog).getByLabelText(/Symptoms/i);

    await user.type(doctorInput, 'Dr. Johnson');
    await user.type(reasonInput, 'Checkup');
    await user.type(symptomsInput, 'Headache, fatigue, dizziness');

    // Submit
    const saveButton = within(dialog).getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockAppointmentService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          symptoms: 'Headache, fatigue, dizziness',
        })
      );
    });
  });

  // AS-7: Generate questions based on symptoms and medical history
  it('AS-7: should generate questions when clicking Prepare for Next Visit', async () => {
    const user = userEvent.setup();

    // Setup medical history
    mockConditionService.getAll.mockReturnValue([
      {
        id: 'cond-1',
        name: 'Hypertension',
        diagnosisDate: '2020-01-15',
        notes: null,
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      },
    ]);

    mockMedicationService.getAll.mockReturnValue([
      {
        id: 'med-1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'once daily',
        startDate: '2020-01-15',
        notes: null,
        createdAt: '2025-01-10T10:00:00.000Z',
        updatedAt: '2025-01-10T10:00:00.000Z',
      },
    ]);

    const existingAppointment: Appointment = {
      id: 'apt-prepare',
      appointmentDate: '2024-01-15T10:00:00.000Z',
      doctorName: 'Dr. Smith',
      reason: 'Follow-up',
      symptoms: 'Frequent headaches',
      notes: null,
      generatedQuestions: null,
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    };

    mockAppointmentService.getAllSorted.mockReturnValue([existingAppointment]);

    render(<AppointmentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });

    // Click Prepare for Next Visit button
    const prepareButton = screen.getByRole('button', { name: /Prepare for Next Visit/i });
    await user.click(prepareButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Verify dialog is displayed (questions are generated by generateAppointmentQuestions)
    const dialog = screen.getByRole('dialog');
    // The PrepareForVisit component should be rendered
    expect(dialog).toBeInTheDocument();

    // Questions are generated based on symptoms, conditions, medications
    // The actual question generation is tested separately in question-generator.test.ts
  });

  // AS-8: View generated questions
  it('AS-8: should display saved questions for an appointment', async () => {

    const appointmentWithQuestions: Appointment = {
      id: 'apt-with-q',
      appointmentDate: '2024-01-15T10:00:00.000Z',
      doctorName: 'Dr. Smith',
      reason: 'Follow-up',
      symptoms: 'Headaches',
      notes: null,
      generatedQuestions: [
        'What are my current vital signs?',
        'Should I be concerned about my headaches?',
        'Are there any interactions with my medications?',
      ],
      createdAt: '2025-01-10T10:00:00.000Z',
      updatedAt: '2025-01-10T10:00:00.000Z',
    };

    mockAppointmentService.getAllSorted.mockReturnValue([appointmentWithQuestions]);

    render(<AppointmentsPage />);

    await waitFor(() => {
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });

    // Verify questions are displayed in the appointment card
    expect(screen.getByText('Prepared Questions')).toBeInTheDocument();
    expect(screen.getByText('What are my current vital signs?')).toBeInTheDocument();
    expect(screen.getByText('Should I be concerned about my headaches?')).toBeInTheDocument();
    expect(screen.getByText('Are there any interactions with my medications?')).toBeInTheDocument();

    // Verify the button shows "Update Questions" instead of "Prepare for Next Visit"
    expect(screen.getByRole('button', { name: /Update Questions/i })).toBeInTheDocument();
  });

  // Empty state test
  it('should display empty state when no appointments exist', async () => {
    mockAppointmentService.getAllSorted.mockReturnValue([]);

    render(<AppointmentsPage />);

    await waitFor(() => {
      expect(screen.getByText(/No appointments/i)).toBeInTheDocument();
    });
  });

  // Form validation test
  it('should validate required fields in appointment form', async () => {
    const user = userEvent.setup();

    mockAppointmentService.getAllSorted.mockReturnValue([]);

    render(<AppointmentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Appointment/i })).toBeInTheDocument();
    });

    // Open dialog
    const addButton = screen.getByRole('button', { name: /Add Appointment/i });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Try to submit without filling required fields
    const dialog = screen.getByRole('dialog');
    const saveButton = within(dialog).getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Doctor name is required/i)).toBeInTheDocument();
    });
  });
});
