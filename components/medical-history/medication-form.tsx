'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMedicationSchema, type CreateMedicationInput } from '@/lib/schemas/medical-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface MedicationFormProps {
  defaultValues?: Partial<CreateMedicationInput>;
  onSubmit: (data: CreateMedicationInput) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function MedicationForm({ defaultValues, onSubmit, onCancel, isSubmitting }: MedicationFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateMedicationInput>({
    resolver: zodResolver(createMedicationSchema),
    defaultValues: defaultValues || {
      name: '',
      dosage: '',
      frequency: '',
      startDate: null,
      notes: null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Medication Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Metformin"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dosage">Dosage *</Label>
          <Input
            id="dosage"
            {...register('dosage')}
            placeholder="e.g., 500mg"
            aria-invalid={!!errors.dosage}
          />
          {errors.dosage && (
            <p className="text-sm text-red-600" role="alert">
              {errors.dosage.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency *</Label>
          <Input
            id="frequency"
            {...register('frequency')}
            placeholder="e.g., Twice daily"
            aria-invalid={!!errors.frequency}
          />
          {errors.frequency && (
            <p className="text-sm text-red-600" role="alert">
              {errors.frequency.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              value={field.value ? new Date(field.value) : undefined}
              onChange={(date) => {
                field.onChange(date ? date.toISOString() : null);
              }}
              placeholder="Select start date and time"
            />
          )}
        />
        {errors.startDate && (
          <p className="text-sm text-red-600" role="alert">
            {errors.startDate.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes', {
            setValueAs: (v) => (v === '' ? null : v),
          })}
          placeholder="Additional information..."
          rows={3}
          aria-invalid={!!errors.notes}
        />
        {errors.notes && (
          <p className="text-sm text-red-600" role="alert">
            {errors.notes.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
