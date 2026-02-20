'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { appointmentSchema, type CreateAppointmentInput } from '@/lib/schemas/appointment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface AppointmentFormProps {
  defaultValues?: Partial<CreateAppointmentInput>;
  onSubmit: (data: CreateAppointmentInput) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// Get default date outside component to avoid purity issues
const getDefaultDate = () => Date.now();

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
    resolver: zodResolver(appointmentSchema),
    defaultValues: defaultValues || {
      date: getDefaultDate(),
      doctorName: '',
      reason: '',
      symptoms: undefined,
      notes: undefined,
      generatedQuestions: undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Appointment Date *</Label>
        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              value={field.value ? new Date(field.value) : undefined}
              onChange={(date) => {
                field.onChange(date ? date.getTime() : Date.now());
              }}
              placeholder="Select appointment date and time"
            />
          )}
        />
        {errors.date && (
          <p className="text-sm text-red-600" role="alert">
            {errors.date.message}
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
