"use client";

import { useState } from "react";
import { useAppointments } from "@/lib/hooks/use-appointments";
import { useSymptoms } from "@/lib/hooks/use-symptoms";
import { AppointmentsList } from "@/components/appointments/appointments-list";
import dynamic from "next/dynamic";
const AppointmentForm = dynamic(() => import("@/components/appointments/appointment-form").then(m => ({ default: m.AppointmentForm })), { ssr: false });
const GenerateQuestions = dynamic(() => import("@/components/appointments/generate-questions").then(m => ({ default: m.GenerateQuestions })), { ssr: false });
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  Appointment,
  CreateAppointmentInput,
} from "@/lib/schemas/appointment";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type DialogState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; appointment: Appointment }
  | { type: "prepare"; appointment: Appointment };

type DeleteDialogState =
  | { type: "closed" }
  | { type: "confirm"; appointmentId: string; doctorName: string };

export default function AppointmentsPage() {
  const { appointments, loading, error, create, update, remove } =
    useAppointments();
  const { symptoms } = useSymptoms();

  const [dialogState, setDialogState] = useState<DialogState>({
    type: "closed",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogState, setDeleteDialogState] = useState<DeleteDialogState>(
    { type: "closed" },
  );

  const closeDialog = () => {
    setDialogState({ type: "closed" });
  };

  const handleAdd = () => {
    setDialogState({ type: "add" });
  };

  const handleEdit = (appointment: Appointment) => {
    setDialogState({ type: "edit", appointment });
  };

  const handlePrepare = (appointment: Appointment) => {
    setDialogState({ type: "prepare", appointment });
  };

  const handleSubmit = async (data: CreateAppointmentInput) => {
    setIsSubmitting(true);
    try {
      if (dialogState.type === "edit") {
        await update(dialogState.appointment._id, data);
        toast.success("Appointment updated successfully");
      } else {
        await create(data);
        toast.success("Appointment added successfully");
      }
      closeDialog();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save appointment",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveQuestions = async (questions: string[]) => {
    if (dialogState.type !== "prepare") return;

    setIsSubmitting(true);
    try {
      await update(dialogState.appointment._id, {
        generatedQuestions: questions,
      });
      toast.success("Questions saved successfully");
      closeDialog();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save questions",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    const appointment = appointments.find((a) => a._id === id);
    if (appointment) {
      setDeleteDialogState({
        type: "confirm",
        appointmentId: id,
        doctorName: appointment.doctorName,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteDialogState.type !== "confirm") return;
    setIsDeleting(true);
    try {
      await remove(deleteDialogState.appointmentId);
      toast.success("Appointment deleted successfully");
      setDeleteDialogState({ type: "closed" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete appointment",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <p className='text-center text-muted-foreground'>
          Loading appointments...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto py-8 px-4'>
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
          <p className='text-red-600 dark:text-red-400'>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-3xl font-bold'>Appointments</h1>
        <AppointmentsList
          appointments={appointments}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onGenerateQuestions={handlePrepare}
        />

        {/* Add/Edit Appointment Dialog */}
        <Dialog
          open={dialogState.type === "add" || dialogState.type === "edit"}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogState.type === "edit"
                  ? "Edit Appointment"
                  : "Add Appointment"}
              </DialogTitle>
            </DialogHeader>
            <AppointmentForm
              defaultValues={
                dialogState.type === "edit"
                  ? {
                      date: dialogState.appointment.date,
                      doctorName: dialogState.appointment.doctorName,
                      reason: dialogState.appointment.reason,
                      symptoms: dialogState.appointment.symptoms,
                      notes: dialogState.appointment.notes,
                      generatedQuestions:
                        dialogState.appointment.generatedQuestions,
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
          open={dialogState.type === "prepare"}
          onOpenChange={(open) => {
            if (!open) closeDialog();
          }}
        >
          <DialogContent>
            {dialogState.type === "prepare" && (
              <GenerateQuestions
                appointment={dialogState.appointment}
                symptomLogs={symptoms}
                allAppointments={appointments}
                onSave={handleSaveQuestions}
                onCancel={closeDialog}
                isSubmitting={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogState.type === "confirm"}
          onOpenChange={(open) => {
            if (!open) setDeleteDialogState({ type: "closed" });
          }}
        >
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Delete Appointment</DialogTitle>
            </DialogHeader>
            <div className='space-y-4'>
              <p className='text-sm text-muted-foreground'>
                Are you sure you want to delete the appointment with{" "}
                <span className='font-semibold text-foreground'>
                  {deleteDialogState.type === "confirm"
                    ? deleteDialogState.doctorName
                    : ""}
                </span>
                ? This action cannot be undone.
              </p>
              <div className='flex justify-end gap-3'>
                <Button
                  variant='outline'
                  onClick={() => setDeleteDialogState({ type: "closed" })}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
