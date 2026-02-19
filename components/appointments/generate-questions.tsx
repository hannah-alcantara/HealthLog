'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAppointments } from '@/lib/hooks/use-appointments';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import type { Appointment } from '@/lib/schemas/appointment';
import type { Symptom } from '@/lib/schemas/symptom';

// Appointment-specific mode: appointment is known upfront
interface AppointmentModeProps {
  appointment: Appointment;
  allAppointments?: Appointment[];
  symptomLogs?: Symptom[];
  onSave: (questions: string[]) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Quick-pick mode: no appointment selected yet, user picks from a dropdown
interface QuickPickModeProps {
  appointment?: undefined;
  allAppointments: Appointment[];
  symptomLogs?: Symptom[];
  onSave?: never;
  onCancel: () => void;
  isSubmitting?: boolean;
}

type GenerateQuestionsProps = AppointmentModeProps | QuickPickModeProps;

function questionsToText(questions: string[]): string {
  return questions.join('\n');
}

function textToQuestions(text: string): string[] {
  return text
    .split('\n')
    .map((q) => q.trim())
    .filter((q) => q.length > 0);
}

function formatAppointmentLabel(appt: Appointment): string {
  const date = new Date(appt.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${appt.doctorName} — ${date}`;
}

export function GenerateQuestions({
  appointment,
  allAppointments = [],
  onSave,
  onCancel,
  isSubmitting,
}: GenerateQuestionsProps) {
  const isQuickPickMode = appointment === undefined;

  const [text, setText] = useState(
    appointment ? questionsToText(appointment.generatedQuestions || []) : ''
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const generateQuestionsAction = useAction(api.ai.generateAppointmentQuestions);
  const { update } = useAppointments();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const previousAppointment = isQuickPickMode
        ? undefined
        : allAppointments
            .filter((appt) => appt.date < appointment!.date && appt._id !== appointment!._id)
            .sort((a, b) => b.date - a.date)[0];

      const generated = await generateQuestionsAction({
        appointmentSymptoms: isQuickPickMode ? undefined : appointment?.symptoms,
        appointmentDate: isQuickPickMode ? Date.now() : appointment!.date,
        startDate: previousAppointment?.date,
      });

      if (isQuickPickMode) {
        setText(questionsToText(generated));
      } else {
        setText(questionsToText(generated));
      }
      toast.success('Questions generated!');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate questions'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Appointment-specific mode: delegate save to parent
  const handleSaveAppointment = () => {
    onSave!(textToQuestions(text));
  };

  // Quick-pick mode: save directly via mutation
  const handleSaveQuickPick = async () => {
    if (!selectedAppointmentId || textToQuestions(text).length === 0) return;
    setIsSaving(true);
    try {
      await update(selectedAppointmentId, { generatedQuestions: textToQuestions(text) });
      toast.success('Questions saved to appointment');
      onCancel();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save questions'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const questionCount = textToQuestions(text).length;
  const sortedAppointments = [...allAppointments].sort((a, b) => a.date - b.date);

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Generate Questions</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {isQuickPickMode
            ? 'Generate questions based on your symptom history. Optionally save them to an upcoming appointment.'
            : 'Generate questions with AI, then edit freely. Each line is one question.'}
        </p>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          variant={text.trim() ? 'outline' : 'default'}
          size="sm"
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating
            ? 'Generating…'
            : text.trim()
            ? 'Regenerate with AI'
            : 'Generate with AI'}
        </Button>

        <div className="space-y-1.5">
          {questionCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {questionCount} {questionCount === 1 ? 'question' : 'questions'}
            </p>
          )}
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your questions here, one per line…"
            className="min-h-[200px] text-sm resize-none"
          />
        </div>

        {/* Quick-pick mode: appointment selector */}
        {isQuickPickMode && questionCount > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Save to appointment{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            {sortedAppointments.length > 0 ? (
              <Select
                value={selectedAppointmentId ?? ''}
                onValueChange={(val) => setSelectedAppointmentId(val)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an appointment…" />
                </SelectTrigger>
                <SelectContent>
                  {sortedAppointments.map((appt) => (
                    <SelectItem key={appt._id} value={appt._id}>
                      {formatAppointmentLabel(appt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No appointments found — add one to save these questions.
              </p>
            )}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isSaving}
          >
            {isQuickPickMode && !selectedAppointmentId && questionCount > 0 ? 'Done' : 'Cancel'}
          </Button>

          {isQuickPickMode ? (
            selectedAppointmentId && (
              <Button
                onClick={handleSaveQuickPick}
                disabled={isSaving || questionCount === 0}
              >
                {isSaving ? 'Saving…' : 'Save to Appointment'}
              </Button>
            )
          ) : (
            <Button
              onClick={handleSaveAppointment}
              disabled={isSubmitting || questionCount === 0}
            >
              {isSubmitting ? 'Saving…' : 'Save Questions'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
