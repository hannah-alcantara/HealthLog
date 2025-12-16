'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createConditionSchema, type CreateConditionInput } from '@/lib/schemas/medical-history';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface ConditionFormProps {
  defaultValues?: Partial<CreateConditionInput>;
  onSubmit: (data: CreateConditionInput) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function ConditionForm({ defaultValues, onSubmit, onCancel, isSubmitting }: ConditionFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateConditionInput>({
    resolver: zodResolver(createConditionSchema),
    defaultValues: defaultValues || {
      name: '',
      diagnosisDate: null,
      notes: null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Condition Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="e.g., Type 2 Diabetes"
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-red-600" role="alert">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="diagnosisDate">Diagnosis Date</Label>
        <Controller
          name="diagnosisDate"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              value={field.value ? new Date(field.value) : undefined}
              onChange={(date) => {
                field.onChange(date ? date.toISOString() : null);
              }}
              placeholder="Select diagnosis date and time"
            />
          )}
        />
        {errors.diagnosisDate && (
          <p className="text-sm text-red-600" role="alert">
            {errors.diagnosisDate.message}
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
          placeholder="Additional details about the condition..."
          rows={4}
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
