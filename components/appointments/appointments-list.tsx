'use client';

import type { Appointment } from '@/lib/schemas/appointment';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AppointmentsListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onPrepareForVisit: (appointment: Appointment) => void;
  onAdd: () => void;
}

export function AppointmentsList({
  appointments,
  onEdit,
  onDelete,
  onPrepareForVisit,
  onAdd,
}: AppointmentsListProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Appointments</h2>
        <Button onClick={onAdd}>Add Appointment</Button>
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="px-6 py-8 text-center text-gray-500">
            No appointments recorded. Click &quot;Add Appointment&quot; to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <Card key={appointment._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{appointment.doctorName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(appointment.date)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(appointment)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this appointment?')) {
                          onDelete(appointment._id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.reason}</p>
                </div>

                {appointment.symptoms && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Symptoms</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {appointment.symptoms}
                    </p>
                  </div>
                )}

                {appointment.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.notes}</p>
                  </div>
                )}

                {appointment.generatedQuestions && appointment.generatedQuestions.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Prepared Questions
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {appointment.generatedQuestions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => onPrepareForVisit(appointment)}>
                    {appointment.generatedQuestions && appointment.generatedQuestions.length > 0
                      ? 'Update Questions'
                      : 'Prepare for Next Visit'}
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
