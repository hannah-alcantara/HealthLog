'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAppointmentSchema, type CreateAppointmentInput } from '@/lib/schemas/appointment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface AppointmentFormProps {
  defaultValues?: Partial<CreateAppointmentInput>;
  onSubmit: (data: CreateAppointmentInput) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function AppointmentForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: AppointmentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateAppointmentInput>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: defaultValues || {
      appointmentDate: new Date().toISOString(),
      doctorName: '',
      reason: '',
      symptoms: null,
      notes: null,
      generatedQuestions: null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="appointmentDate">Appointment Date *</Label>
        <Controller
          name="appointmentDate"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              value={field.value ? new Date(field.value) : undefined}
              onChange={(date) => {
                field.onChange(date ? date.toISOString() : new Date().toISOString());
              }}
              placeholder="Select appointment date and time"
            />
          )}
        />
        {errors.appointmentDate && (
          <p className="text-sm text-red-600" role="alert">
            {errors.appointmentDate.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="doctorName">Doctor Name *</Label>
        <Input
          id="doctorName"
          {...register('doctorName')}
          placeholder="e.g., Dr. Smith"
          aria-invalid={!!errors.doctorName}
        />
        {errors.doctorName && (
          <p className="text-sm text-red-600" role="alert">
            {errors.doctorName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Visit *</Label>
        <Input
          id="reason"
          {...register('reason')}
          placeholder="e.g., Annual checkup, Follow-up"
          aria-invalid={!!errors.reason}
        />
        {errors.reason && (
          <p className="text-sm text-red-600" role="alert">
            {errors.reason.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="symptoms">Symptoms (Optional)</Label>
        <Textarea
          id="symptoms"
          {...register('symptoms', {
            setValueAs: (v) => (v === '' ? null : v),
          })}
          placeholder="Describe any symptoms you're experiencing..."
          rows={3}
          aria-invalid={!!errors.symptoms}
        />
        {errors.symptoms && (
          <p className="text-sm text-red-600" role="alert">
            {errors.symptoms.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          {...register('notes', {
            setValueAs: (v) => (v === '' ? null : v),
          })}
          placeholder="Add any notes from the appointment..."
          rows={4}
          aria-invalid={!!errors.notes}
        />
        {errors.notes && (
          <p className="text-sm text-red-600" role="alert">
            {errors.notes.message}
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Appointment'}
        </Button>
      </div>
    </form>
  );
}
