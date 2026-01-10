"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createSymptomSchema,
  type CreateSymptomInput,
} from "@/lib/schemas/symptom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Laugh, Smile, Meh, Frown, Annoyed, Angry } from "lucide-react";

interface SymptomFormProps {
  defaultValues?: Partial<CreateSymptomInput>;
  onSubmit: (data: CreateSymptomInput) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// Common symptom types
const COMMON_SYMPTOMS = [
  "Headache",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Pain",
  "Fever",
  "Cough",
  "Shortness of Breath",
  "Anxiety",
  "Insomnia",
  "Muscle Ache",
  "Joint Pain",
  "Abdominal Pain",
  "Back Pain",
  "Chest Pain",
  "Rash",
  "Itching",
  "Diarrhea",
  "Constipation",
  "Vomiting",
  "Other",
] as const;

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
        symptomType: "",
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

  const severity = watch("severity");
  const symptomType = watch("symptomType");
  const [showCustomInput, setShowCustomInput] = React.useState(
    () =>
      defaultValues?.symptomType &&
      !COMMON_SYMPTOMS.includes(defaultValues.symptomType as any)
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 px-2'>
      <div className='space-y-2'>
        <Label htmlFor='symptomType' className='text-base font-semibold'>
          Symptom Type *
        </Label>
        {!showCustomInput ? (
          <Select
            value={symptomType}
            onValueChange={(value) => {
              if (value === "Other") {
                setShowCustomInput(true);
                setValue("symptomType", "");
              } else {
                setValue("symptomType", value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select symptom type' />
            </SelectTrigger>
            <SelectContent>
              {COMMON_SYMPTOMS.map((symptom) => (
                <SelectItem key={symptom} value={symptom}>
                  {symptom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className='space-y-2'>
            <Input
              id='symptomType'
              {...register("symptomType")}
              placeholder='Enter custom symptom type'
              aria-invalid={!!errors.symptomType}
              aria-describedby={
                errors.symptomType ? "symptomType-error" : undefined
              }
            />
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => {
                setShowCustomInput(false);
                setValue("symptomType", "");
              }}
            >
              ← Back to list
            </Button>
          </div>
        )}
        {errors.symptomType && (
          <p
            id='symptomType-error'
            className='text-sm text-red-600'
            role='alert'
          >
            {errors.symptomType.message}
          </p>
        )}
      </div>

      <div className='space-y-4'>
        <Label className='text-base font-semibold'>
          Pain Severity: {severity} / 10 *
        </Label>

        {/* Pain Scale */}
        <div className='relative px-2'>
          {/* Numbers Row */}
          <div className='relative flex mb-2'>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <div
                key={num}
                className='absolute'
                style={{
                  left: `${(num / 10) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              >
                <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  {num}
                </span>
              </div>
            ))}
          </div>

          {/* Horizontal Line with Vertical Tick Marks */}
          <div className='relative h-3 mb-4 mt-6'>
            <div className='absolute top-0 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-600' />
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <div
                key={num}
                className='absolute h-3 w-0.5 bg-gray-300 dark:bg-gray-600'
                style={{
                  left: `${(num / 10) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              />
            ))}
          </div>

          {/* Pain Icons - positioned at 0, 2, 4, 6, 8, 10 */}
          <div className='relative h-24'>
            {[0, 2, 4, 6, 8, 10].map((level) => {
              let Icon = Laugh;
              let color = "text-green-600 dark:text-green-500";
              let label = "No Pain";

              if (level === 2) {
                Icon = Smile;
                color = "text-green-500 dark:text-green-400";
                label = "Mild";
              } else if (level === 4) {
                Icon = Meh;
                color = "text-yellow-500 dark:text-yellow-400";
                label = "Moderate";
              } else if (level === 6) {
                Icon = Frown;
                color = "text-orange-500 dark:text-orange-400";
                label = "Severe";
              } else if (level === 8) {
                Icon = Annoyed;
                color = "text-red-500 dark:text-red-400";
                label = "Very Severe";
              } else if (level === 10) {
                Icon = Angry;
                color = "text-red-600 dark:text-red-500";
                label = "Worst Pain Possible";
              }

              const isSelected = severity === level;

              return (
                <button
                  key={level}
                  type='button'
                  onClick={() => setValue("severity", level)}
                  className='absolute flex flex-col items-center gap-2 p-2 transition-all hover:scale-110'
                  style={{
                    left: `${(level / 10) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                  aria-label={`${label}: ${level}/10`}
                  aria-pressed={isSelected}
                >
                  <Icon
                    className={`w-8 h-8 transition-all ${
                      isSelected ? `${color} scale-125 drop-shadow-lg` : color
                    }`}
                    strokeWidth={isSelected ? 2.5 : 2}
                  />
                  <span className='text-[10px] text-center text-gray-600 dark:text-gray-400 max-w-[70px] leading-tight'>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {errors.severity && (
          <p className='text-sm text-red-600' role='alert'>
            {errors.severity.message}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='bodyPart' className='text-base font-semibold'>
          Body Part (Optional)
        </Label>
        <Input
          id='bodyPart'
          {...register("bodyPart", {
            setValueAs: (v) => (v === "" ? null : v),
          })}
          placeholder='e.g., Head, Stomach, Lower back'
          aria-invalid={!!errors.bodyPart}
        />
        {errors.bodyPart && (
          <p className='text-sm text-red-600' role='alert'>
            {errors.bodyPart.message}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='triggers' className='text-base font-semibold'>
          Triggers (Optional)
        </Label>
        <Input
          id='triggers'
          {...register("triggers", {
            setValueAs: (v) => (v === "" ? null : v),
          })}
          placeholder='e.g., After eating, Stress, Exercise'
          aria-invalid={!!errors.triggers}
        />
        {errors.triggers && (
          <p className='text-sm text-red-600' role='alert'>
            {errors.triggers.message}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='loggedAt' className='text-base font-semibold'>
          Date & Time *
        </Label>
        <Controller
          name='loggedAt'
          control={control}
          render={({ field }) => (
            <DateTimePicker
              value={field.value ? new Date(field.value) : undefined}
              onChange={(date) => {
                field.onChange(
                  date ? date.toISOString() : new Date().toISOString()
                );
              }}
              placeholder='Select date and time'
            />
          )}
        />
        {errors.loggedAt && (
          <p className='text-sm text-red-600' role='alert'>
            {errors.loggedAt.message}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='notes' className='text-base font-semibold'>
          Notes (Optional)
        </Label>
        <Textarea
          id='notes'
          {...register("notes", {
            setValueAs: (v) => (v === "" ? null : v),
          })}
          placeholder='Additional details about this symptom...'
          rows={3}
          aria-invalid={!!errors.notes}
        />
        {errors.notes && (
          <p className='text-sm text-red-600' role='alert'>
            {errors.notes.message}
          </p>
        )}
      </div>

      <div className='flex gap-2 justify-end pt-4'>
        {onCancel && (
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Log Symptom"}
        </Button>
      </div>
    </form>
  );
}
