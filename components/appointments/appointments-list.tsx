"use client";

import type { Appointment } from "@/lib/schemas/appointment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface AppointmentsListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onGenerateQuestions: (appointment: Appointment) => void;
  onAdd: () => void;
}

export function AppointmentsList({
  appointments,
  onEdit,
  onDelete,
  onGenerateQuestions,
  onAdd,
}: AppointmentsListProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <p className='text-sm text-muted-foreground mt-1'>
          Review and manage your appointments here
        </p>
        <Button onClick={onAdd}>Add Appointment</Button>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className='px-6 py-8 text-center text-muted-foreground'>
            No appointments recorded. Click &quot;Add Appointment&quot; to get
            started.
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {appointments.map((appointment) => (
            <Card key={appointment._id}>
              <CardHeader>
                <div className='flex justify-between items-start'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold'>
                      {appointment.doctorName}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      {formatDate(appointment.date)}
                    </p>
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onEdit(appointment)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => onDelete(appointment._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <p className='text-sm font-medium'>Reason</p>
                  <p className='text-sm text-muted-foreground'>
                    {appointment.reason}
                  </p>
                </div>

                {appointment.symptoms && (
                  <div>
                    <p className='text-sm font-medium'>Symptoms</p>
                    <p className='text-sm text-muted-foreground'>
                      {appointment.symptoms}
                    </p>
                  </div>
                )}

                {appointment.notes && (
                  <div>
                    <p className='text-sm font-medium'>Notes</p>
                    <p className='text-sm text-muted-foreground'>
                      {appointment.notes}
                    </p>
                  </div>
                )}

                {appointment.generatedQuestions &&
                  appointment.generatedQuestions.length > 0 && (
                    <div>
                      <p className='text-sm font-medium mb-2'>
                        Prepared Questions
                      </p>
                      <ul className='list-disc list-inside space-y-1 text-sm text-muted-foreground'>
                        {appointment.generatedQuestions.map(
                          (question, index) => (
                            <li key={index}>{question}</li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}

                <div className='pt-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => onGenerateQuestions(appointment)}
                  >
                    {appointment.generatedQuestions &&
                    appointment.generatedQuestions.length > 0
                      ? "Update Questions"
                      : "Prepare for Visit"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
