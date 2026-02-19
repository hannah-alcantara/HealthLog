'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import type { Appointment } from '@/lib/schemas/appointment';
import type { Symptom } from '@/lib/schemas/symptom';

interface GenerateQuestionsProps {
  appointment: Appointment;
  symptomLogs: Symptom[];
  allAppointments: Appointment[];
  onSave: (questions: string[]) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function questionsToText(questions: string[]): string {
  return questions.join('\n');
}

function textToQuestions(text: string): string[] {
  return text
    .split('\n')
    .map((q) => q.trim())
    .filter((q) => q.length > 0);
}

export function GenerateQuestions({
  appointment,
  allAppointments,
  onSave,
  onCancel,
  isSubmitting,
}: GenerateQuestionsProps) {
  const [text, setText] = useState(
    questionsToText(appointment.generatedQuestions || [])
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQuestions = useAction(api.ai.generateAppointmentQuestions);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const previousAppointment = allAppointments
        .filter((appt) => appt.date < appointment.date && appt._id !== appointment._id)
        .sort((a, b) => b.date - a.date)[0];

      const generated = await generateQuestions({
        appointmentSymptoms: appointment.symptoms,
        appointmentDate: appointment.date,
        startDate: previousAppointment?.date,
      });
      setText(questionsToText(generated));
      toast.success('Questions generated!');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate questions'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    onSave(textToQuestions(text));
  };

  const questionCount = textToQuestions(text).length;

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Generate Questions</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate questions with AI, then edit freely. Each line is one question.
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

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || questionCount === 0}
          >
            {isSubmitting ? 'Saving…' : 'Save Questions'}
          </Button>
        </div>
      </div>
    </div>
  );
}
