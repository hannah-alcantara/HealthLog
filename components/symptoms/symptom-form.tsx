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
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Search, Laugh, Smile, Meh, Frown, Annoyed, Angry } from "lucide-react";

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

// Common triggers
const COMMON_TRIGGERS = [
  "Stress",
  "Lack of Sleep",
  "Caffeine",
  "Alcohol",
  "Weather Change",
  "Exercise",
  "Food",
  "Medication",
] as const;

export function SymptomForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: SymptomFormProps) {
  const formDefaultValues = defaultValues
    ? {
        symptomType: defaultValues.symptomType || "",
        severity: defaultValues.severity || 5,
        triggers: defaultValues.triggers,
        notes: defaultValues.notes,
        loggedAt: defaultValues.loggedAt || Date.now(),
      }
    : {
        symptomType: "",
        severity: 5,
        loggedAt: Date.now(),
      };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateSymptomInput>({
    resolver: zodResolver(createSymptomSchema) as any,
    defaultValues: formDefaultValues as Partial<CreateSymptomInput>,
  });

  const severity = watch("severity");
  const symptomType = watch("symptomType");
  const triggers = watch("triggers");
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [filteredSymptoms, setFilteredSymptoms] = React.useState<string[]>([]);
  const symptomInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedTriggers, setSelectedTriggers] = React.useState<string[]>([]);
  const [showCustomTrigger, setShowCustomTrigger] = React.useState(false);
  const [customTrigger, setCustomTrigger] = React.useState("");

  // Simple Levenshtein distance for fuzzy matching
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  const handleSymptomInputChange = (value: string) => {
    setValue("symptomType", value);

    if (value.trim()) {
      const searchTerm = value.toLowerCase();

      // Filter and sort by relevance
      const filtered = COMMON_SYMPTOMS.map((symptom) => {
        const symptomLower = symptom.toLowerCase();
        const distance = levenshteinDistance(searchTerm, symptomLower);
        const startsWithMatch = symptomLower.startsWith(searchTerm);
        const containsMatch = symptomLower.includes(searchTerm);

        return {
          symptom,
          distance,
          startsWithMatch,
          containsMatch,
          // Calculate relevance score (lower is better)
          score: startsWithMatch
            ? distance
            : containsMatch
              ? distance + 10
              : distance + 20,
        };
      })
        .filter((item) => item.score <= 15) // Only show reasonably close matches
        .sort((a, b) => a.score - b.score)
        .slice(0, 8) // Limit to top 8 suggestions
        .map((item) => item.symptom);

      setFilteredSymptoms(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSymptoms([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue("symptomType", suggestion);
    setShowSuggestions(false);
    setFilteredSymptoms([]);
  };

  // Normalize symptom type to match common symptoms (case-insensitive)
  const normalizeSymptomType = (input: string): string => {
    const trimmedInput = input.trim();
    const matchedSymptom = COMMON_SYMPTOMS.find(
      (symptom) => symptom.toLowerCase() === trimmedInput.toLowerCase()
    );
    return matchedSymptom || trimmedInput;
  };

  // Initialize selected triggers from default values
  React.useEffect(() => {
    if (defaultValues?.triggers) {
      const triggersArray = defaultValues.triggers.split(", ");
      setSelectedTriggers(triggersArray);
    }
  }, [defaultValues?.triggers]);

  // Update form value when selected triggers change
  React.useEffect(() => {
    const triggersString =
      selectedTriggers.length > 0 ? selectedTriggers.join(", ") : null;
    setValue("triggers", triggersString as any);
  }, [selectedTriggers, setValue]);

  const handleTriggerToggle = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger],
    );
  };

  const handleAddCustomTrigger = () => {
    const trimmedTrigger = customTrigger.trim();
    if (trimmedTrigger && !selectedTriggers.includes(trimmedTrigger)) {
      setSelectedTriggers((prev) => [...prev, trimmedTrigger]);
      setCustomTrigger("");
      setShowCustomTrigger(false);
    }
  };

  const handleRemoveTrigger = (trigger: string) => {
    setSelectedTriggers((prev) => prev.filter((t) => t !== trigger));
  };

  const handleFormSubmit = (data: CreateSymptomInput) => {
    // Normalize symptom type to ensure case-insensitive matching
    const normalizedData = {
      ...data,
      symptomType: normalizeSymptomType(data.symptomType),
    };

    onSubmit(normalizedData);
  };

  return (
    <>
      <div className='border-t -mx-6' />
      <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-8 px-4'>
        {/* Symptom Type */}
        <div className='space-y-2 relative'>
          <Label
            htmlFor='symptomType'
            className='text-xs font-medium uppercase text-foreground'
          >
            Symptom Type
          </Label>
          <div className='relative'>
            <Input
              id='symptomType'
              ref={symptomInputRef}
              value={symptomType}
              onChange={(e) => handleSymptomInputChange(e.target.value)}
              onClick={() => {
                // Show suggestions on click
                if (symptomType.trim()) {
                  // If there's text, filter suggestions
                  const filtered = COMMON_SYMPTOMS.filter((symptom) =>
                    symptom.toLowerCase().includes(symptomType.toLowerCase()),
                  );
                  setFilteredSymptoms(filtered);
                  setShowSuggestions(filtered.length > 0);
                } else {
                  // If empty, show all common symptoms
                  setFilteredSymptoms([...COMMON_SYMPTOMS]);
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Delay to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder='e.g., Headache, Chest Tightness'
              className='h-11 pr-10'
              aria-invalid={!!errors.symptomType}
              aria-describedby={
                errors.symptomType ? "symptomType-error" : undefined
              }
            />
            <Search className='absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />

            {/* Suggestions dropdown */}
            {showSuggestions && filteredSymptoms.length > 0 && (
              <div className='absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto'>
                <div className='px-3 py-1.5 text-xs text-muted-foreground border-b bg-muted/50'>
                  Suggestions
                </div>
                {filteredSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type='button'
                    onClick={() => handleSuggestionClick(symptom)}
                    className='w-full text-left px-3 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors text-sm border-b last:border-b-0'
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            )}
          </div>
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

        {/* Date & Time */}
        <div className='space-y-2'>
          <Label
            htmlFor='loggedAt'
            className='text-xs font-medium uppercase text-foreground'
          >
            Date & Time
          </Label>
          <Controller
            name='loggedAt'
            control={control}
            render={({ field }) => (
              <DateTimePicker
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date) => {
                  field.onChange(
                    date ? date.getTime() : Date.now(),
                  );
                }}
                placeholder='Select date and time'
                disableFuture
              />
            )}
          />
          {errors.loggedAt && (
            <p className='text-sm text-red-600' role='alert'>
              {errors.loggedAt.message}
            </p>
          )}
        </div>

        {/* Pain Level */}
        <div className='space-y-3'>
          <Label className='text-xs font-medium uppercase text-foreground'>
            Pain Level (0-10)
          </Label>

          {/* Pain Scale Buttons */}
          <div className='flex gap-2'>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              let bgColor = "";
              let hoverColor = "";
              let textColor = "text-white";

              // Create smooth gradient: each button has unique color from green to red
              switch (num) {
                case 0:
                  bgColor = "bg-green-700";
                  hoverColor = "hover:bg-green-800";
                  break;
                case 1:
                  bgColor = "bg-green-600";
                  hoverColor = "hover:bg-green-700";
                  break;
                case 2:
                  bgColor = "bg-green-500";
                  hoverColor = "hover:bg-green-600";
                  break;
                case 3:
                  bgColor = "bg-lime-500";
                  hoverColor = "hover:bg-lime-600";
                  break;
                case 4:
                  bgColor = "bg-yellow-400";
                  hoverColor = "hover:bg-yellow-500";
                  break;
                case 5:
                  bgColor = "bg-yellow-500";
                  hoverColor = "hover:bg-yellow-600";
                  break;
                case 6:
                  bgColor = "bg-amber-500";
                  hoverColor = "hover:bg-amber-600";
                  break;
                case 7:
                  bgColor = "bg-orange-500";
                  hoverColor = "hover:bg-orange-600";
                  break;
                case 8:
                  bgColor = "bg-orange-600";
                  hoverColor = "hover:bg-orange-700";
                  break;
                case 9:
                  bgColor = "bg-red-500";
                  hoverColor = "hover:bg-red-600";
                  break;
                case 10:
                  bgColor = "bg-red-600";
                  hoverColor = "hover:bg-red-700";
                  break;
              }

              const isSelected = severity === num;

              return (
                <button
                  key={num}
                  type='button'
                  onClick={() => setValue("severity", num)}
                  className={`flex-1 h-12 rounded-md font-semibold transition-all ${bgColor} ${textColor} ${hoverColor} ${
                    isSelected ? "ring-2 ring-offset-2 ring-primary" : ""
                  }`}
                  aria-label={`Pain level ${num}`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Labels and face icons under pain scale - centered under 0, 2, 4, 6, 8, 10 */}
          <div className='flex gap-2'>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              let iconColor = "";
              let Icon = null;
              let label = "";

              // Match button colors for each level
              switch (num) {
                case 0:
                  iconColor = "text-green-700";
                  Icon = Laugh;
                  label = "No Pain";
                  break;
                case 2:
                  iconColor = "text-green-500";
                  Icon = Smile;
                  label = "Mild";
                  break;
                case 4:
                  iconColor = "text-yellow-400";
                  Icon = Meh;
                  label = "Moderate";
                  break;
                case 6:
                  iconColor = "text-amber-500";
                  Icon = Frown;
                  label = "Severe";
                  break;
                case 8:
                  iconColor = "text-orange-600";
                  Icon = Annoyed;
                  label = "Very Severe";
                  break;
                case 10:
                  iconColor = "text-red-600";
                  Icon = Angry;
                  label = "Worst Pain";
                  break;
              }

              return (
                <div
                  key={num}
                  className='flex-1 flex flex-col items-center justify-start pt-1'
                >
                  {Icon ? (
                    <>
                      <div className='h-6 flex items-center justify-center mb-1'>
                        <span className='text-[9px] text-muted-foreground uppercase font-medium text-center leading-tight'>
                          {label}
                        </span>
                      </div>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </>
                  ) : (
                    <div className='h-[calc(1.5rem+1.25rem+0.25rem)]'></div>
                  )}
                </div>
              );
            })}
          </div>

          {errors.severity && (
            <p className='text-sm text-red-600' role='alert'>
              {errors.severity.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className='space-y-2'>
          <Label
            htmlFor='notes'
            className='text-xs font-medium uppercase text-foreground'
          >
            Notes <span className='text-muted-foreground normal-case'>(Optional)</span>
          </Label>
          <Textarea
            id='notes'
            {...register("notes", {
              setValueAs: (v) => (v === "" ? null : v),
            })}
            placeholder='What makes it better or worse? (e.g., "Worse after eating", "Better when lying down")'
            rows={4}
            className='resize'
            aria-invalid={!!errors.notes}
          />
          {errors.notes && (
            <p className='text-sm text-red-600' role='alert'>
              {errors.notes.message}
            </p>
          )}
        </div>

        {/* Common Triggers */}
        <div className='space-y-3'>
          <Label className='text-xs font-medium uppercase text-muted-foreground'>
            Common Triggers <span className='normal-case'>(Optional)</span>
          </Label>

          {/* Common Triggers Buttons */}
          <div className='flex flex-wrap gap-2'>
            {COMMON_TRIGGERS.map((trigger) => (
              <button
                key={trigger}
                type='button'
                onClick={() => handleTriggerToggle(trigger)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  selectedTriggers.includes(trigger)
                    ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 ring-1 ring-border"
                }`}
              >
                {trigger}
              </button>
            ))}

            {/* Custom Triggers (not in COMMON_TRIGGERS) */}
            {selectedTriggers
              .filter((trigger) => !COMMON_TRIGGERS.includes(trigger as any))
              .map((trigger) => (
                <button
                  key={trigger}
                  type='button'
                  onClick={() => handleRemoveTrigger(trigger)}
                  className='px-3 py-1.5 rounded-xl text-sm font-medium transition-all bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 relative group'
                >
                  {trigger}
                  <span className='ml-1.5 opacity-70 group-hover:opacity-100'>
                    ×
                  </span>
                </button>
              ))}

            {/* Add New Button / Input Field */}
            {!showCustomTrigger ? (
              <button
                type='button'
                onClick={() => setShowCustomTrigger(true)}
                className='px-3 py-1.5 rounded-xl text-sm font-medium text-primary hover:bg-primary/10 transition-all border-2 border-dashed border-primary/90'
              >
                + Add New
              </button>
            ) : (
              <div className='flex gap-2 items-center'>
                <Input
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  placeholder='Enter custom trigger'
                  className='h-8 text-sm min-w-[150px]'
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomTrigger();
                    } else if (e.key === "Escape") {
                      setShowCustomTrigger(false);
                      setCustomTrigger("");
                    }
                  }}
                  onBlur={() => {
                    if (!customTrigger.trim()) {
                      setShowCustomTrigger(false);
                    }
                  }}
                />
                <Button
                  type='button'
                  onClick={handleAddCustomTrigger}
                  size='sm'
                  className='h-8 px-3'
                >
                  Add
                </Button>
              </div>
            )}
          </div>

          {errors.triggers && (
            <p className='text-sm text-red-600' role='alert'>
              {errors.triggers.message}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3 pt-2'>
          {onCancel && (
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              disabled={isSubmitting}
              className='flex-1 h-11'
            >
              Cancel
            </Button>
          )}
          <Button
            type='submit'
            disabled={isSubmitting}
            className='flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white'
          >
            {isSubmitting ? "Saving..." : "Save Symptom Log"}
          </Button>
        </div>
      </form>
    </>
  );
}
