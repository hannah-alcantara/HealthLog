'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateAppointmentQuestions } from '@/lib/utils/question-generator';
import type { Condition, Medication, Allergy } from '@/lib/schemas/medical-history';
import type { Appointment } from '@/lib/schemas/appointment';
import type { Symptom } from '@/lib/schemas/symptom';

interface PrepareForVisitProps {
  appointment: Appointment;
  symptomLogs: Symptom[];
  conditions: Condition[];
  medications: Medication[];
  allergies: Allergy[];
  onSave: (questions: string[]) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PrepareForVisit({
  appointment,
  symptomLogs,
  conditions,
  medications,
  allergies,
  onSave,
  onCancel,
  isSubmitting,
}: PrepareForVisitProps) {
  const [questions, setQuestions] = useState<string[]>(
    appointment.generatedQuestions || []
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      const generated = generateAppointmentQuestions(
        appointment.symptoms,
        symptomLogs,
        conditions,
        medications,
        allergies
      );
      setQuestions(generated);
      setIsGenerating(false);
    }, 500);
  };

  const handleSave = () => {
    onSave(questions);
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>Prepare for Visit</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Generate questions to ask your doctor based on your symptoms and medical history.
          </p>
          {!questions.length && (
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              {isGenerating ? 'Generating Questions...' : 'Generate Questions'}
            </Button>
          )}
        </div>

        {questions.length > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Generated Questions</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Regenerating...' : 'Regenerate'}
                </Button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {questions.map((question, index) => (
                    <li key={index} className="text-gray-700 dark:text-gray-300">
                      {question}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Questions'}
              </Button>
            </div>
          </>
        )}

        {!questions.length && !isGenerating && (
          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
