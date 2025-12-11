'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAllergySchema, type CreateAllergyInput, type AllergySeverity } from '@/lib/schemas/medical-history';
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

interface AllergyFormProps {
  defaultValues?: Partial<CreateAllergyInput>;
  onSubmit: (data: CreateAllergyInput) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function AllergyForm({ defaultValues, onSubmit, onCancel, isSubmitting }: AllergyFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateAllergyInput>({
    resolver: zodResolver(createAllergySchema),
    defaultValues: defaultValues || {
      allergen: '',
      severity: null,
      reaction: null,
    },
  });

  const severity = watch('severity');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="allergen">Allergen *</Label>
        <Input
          id="allergen"
          {...register('allergen')}
          placeholder="e.g., Peanuts"
          aria-invalid={!!errors.allergen}
        />
        {errors.allergen && (
          <p className="text-sm text-red-600" role="alert">
            {errors.allergen.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity">Severity</Label>
        <Select
          value={severity || undefined}
          onValueChange={(value) => setValue('severity', value as AllergySeverity | null)}
        >
          <SelectTrigger id="severity" aria-invalid={!!errors.severity}>
            <SelectValue placeholder="Select severity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mild">Mild</SelectItem>
            <SelectItem value="moderate">Moderate</SelectItem>
            <SelectItem value="severe">Severe</SelectItem>
          </SelectContent>
        </Select>
        {errors.severity && (
          <p className="text-sm text-red-600" role="alert">
            {errors.severity.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reaction">Reaction</Label>
        <Textarea
          id="reaction"
          {...register('reaction', {
            setValueAs: (v) => (v === '' ? null : v),
          })}
          placeholder="Describe the allergic reaction..."
          rows={3}
          aria-invalid={!!errors.reaction}
        />
        {errors.reaction && (
          <p className="text-sm text-red-600" role="alert">
            {errors.reaction.message}
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
