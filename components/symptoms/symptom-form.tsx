'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createSymptomSchema,
  type CreateSymptomInput,
  symptomCategories,
  symptomCategoryLabels,
  type SymptomCategory,
} from '@/lib/schemas/symptom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-time-picker';

interface SymptomFormProps {
  defaultValues?: Partial<CreateSymptomInput>;
  onSubmit: (data: CreateSymptomInput) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function SymptomForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: SymptomFormProps) {
  const formDefaultValues = defaultValues
    ? {
        ...defaultValues,
        loggedAt: defaultValues.loggedAt || new Date().toISOString(),
      }
    : {
        symptomType: '',
        category: 'other' as const,
        severity: 5,
        bodyPart: null,
        triggers: null,
        notes: null,
        loggedAt: new Date().toISOString(),
      };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateSymptomInput>({
    resolver: zodResolver(createSymptomSchema),
    defaultValues: formDefaultValues,
  });

  const category = watch('category');
  const severity = watch('severity');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="symptomType">Symptom Type *</Label>
        <Input
          id="symptomType"
          {...register('symptomType')}
          placeholder="e.g., Headache, Nausea, Fatigue"
          aria-invalid={!!errors.symptomType}
          aria-describedby={errors.symptomType ? 'symptomType-error' : undefined}
        />
        {errors.symptomType && (
          <p id="symptomType-error" className="text-sm text-red-600" role="alert">
            {errors.symptomType.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={category}
          onValueChange={(value) => setValue('category', value as SymptomCategory)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {symptomCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {symptomCategoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-600" role="alert">
            {errors.category.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity">Severity: {severity} / 10 *</Label>
        <input
          id="severity"
          type="range"
          min="1"
          max="10"
          {...register('severity', { valueAsNumber: true })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          aria-invalid={!!errors.severity}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>1 (Mild)</span>
          <span>5 (Moderate)</span>
          <span>10 (Severe)</span>
        </div>
        {errors.severity && (
          <p className="text-sm text-red-600" role="alert">
            {errors.severity.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodyPart">Body Part (Optional)</Label>
        <Input
          id="bodyPart"
          {...register('bodyPart', {
            setValueAs: (v) => (v === '' ? null : v),
          })}
          placeholder="e.g., Head, Stomach, Lower back"
          aria-invalid={!!errors.bodyPart}
        />
        {errors.bodyPart && (
          <p className="text-sm text-red-600" role="alert">
            {errors.bodyPart.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="triggers">Triggers (Optional)</Label>
        <Input
          id="triggers"
          {...register('triggers', {
            setValueAs: (v) => (v === '' ? null : v),
          })}
          placeholder="e.g., After eating, Stress, Exercise"
          aria-invalid={!!errors.triggers}
        />
        {errors.triggers && (
          <p className="text-sm text-red-600" role="alert">
            {errors.triggers.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="loggedAt">Date & Time *</Label>
        <Controller
          name="loggedAt"
          control={control}
          render={({ field }) => (
            <DateTimePicker
              value={field.value ? new Date(field.value) : undefined}
              onChange={(date) => {
                field.onChange(date ? date.toISOString() : new Date().toISOString());
              }}
              placeholder="Select date and time"
            />
          )}
        />
        {errors.loggedAt && (
          <p className="text-sm text-red-600" role="alert">
            {errors.loggedAt.message}
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
          placeholder="Additional details about this symptom..."
          rows={3}
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
          {isSubmitting ? 'Saving...' : 'Log Symptom'}
        </Button>
      </div>
    </form>
  );
}
