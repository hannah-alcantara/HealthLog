'use client';

import { useState } from 'react';
import { useAppointments } from '@/lib/hooks/use-appointments';
import { useConditions } from '@/lib/hooks/use-conditions';
import { useMedications } from '@/lib/hooks/use-medications';
import { useAllergies } from '@/lib/hooks/use-allergies';
import { AppointmentsList } from '@/components/appointments/appointments-list';
import { AppointmentForm } from '@/components/appointments/appointment-form';
import { PrepareForVisit } from '@/components/appointments/prepare-for-visit';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Appointment, CreateAppointmentInput } from '@/lib/schemas/appointment';

type DialogState =
  | { type: 'closed' }
  | { type: 'add' }
  | { type: 'edit'; appointment: Appointment }
  | { type: 'prepare'; appointment: Appointment };

export default function AppointmentsPage() {
  const { appointments, loading, error, create, update, remove } = useAppointments();
  const { conditions } = useConditions();
  const { medications } = useMedications();
  const { allergies } = useAllergies();

  const [dialogState, setDialogState] = useState<DialogState>({ type: 'closed' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeDialog = () => {
    setDialogState({ type: 'closed' });
  };

  const handleAdd = () => {
    setDialogState({ type: 'add' });
  };

  const handleEdit = (appointment: Appointment) => {
    setDialogState({ type: 'edit', appointment });
  };

  const handlePrepare = (appointment: Appointment) => {
    setDialogState({ type: 'prepare', appointment });
  };

  const handleSubmit = async (data: CreateAppointmentInput) => {
    setIsSubmitting(true);
    try {
      if (dialogState.type === 'edit') {
        await update(dialogState.appointment.id, data);
      } else {
        await create(data);
      }
      closeDialog();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveQuestions = async (questions: string[]) => {
    if (dialogState.type !== 'prepare') return;

    setIsSubmitting(true);
    try {
      await update(dialogState.appointment.id, { generatedQuestions: questions });
      closeDialog();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save questions');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete appointment');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-600 dark:text-gray-400">Loading appointments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Appointments</h1>

      <AppointmentsList
        appointments={appointments}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrepareForVisit={handlePrepare}
      />

      {/* Add/Edit Appointment Dialog */}
      <Dialog
        open={dialogState.type === 'add' || dialogState.type === 'edit'}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          <AppointmentForm
            defaultValues={
              dialogState.type === 'edit'
                ? {
                    appointmentDate: dialogState.appointment.appointmentDate,
                    doctorName: dialogState.appointment.doctorName,
                    reason: dialogState.appointment.reason,
                    symptoms: dialogState.appointment.symptoms,
                    notes: dialogState.appointment.notes,
                    generatedQuestions: dialogState.appointment.generatedQuestions,
                  }
                : undefined
            }
            onSubmit={handleSubmit}
            onCancel={closeDialog}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Prepare for Visit Dialog */}
      <Dialog
        open={dialogState.type === 'prepare'}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent>
          {dialogState.type === 'prepare' && (
            <PrepareForVisit
              appointment={dialogState.appointment}
              conditions={conditions}
              medications={medications}
              allergies={allergies}
              onSave={handleSaveQuestions}
              onCancel={closeDialog}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
