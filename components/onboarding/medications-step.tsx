'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MedicationForm } from '@/components/medical-history/medication-form';
import { useMedications } from '@/lib/hooks/use-medications';
import type { CreateMedicationInput } from '@/lib/schemas/medical-history';

interface MedicationsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function MedicationsStep({ onNext, onBack }: MedicationsStepProps) {
  const { medications, create, remove } = useMedications();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateMedicationInput) => {
    setIsSubmitting(true);
    try {
      await create(data);
      setShowForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add medication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove medication');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Current Medications</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Add any medications you're currently taking (optional)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {medications.length > 0 && (
            <div className="space-y-2">
              {medications.map((medication) => (
                <div
                  key={medication.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{medication.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {medication.dosage} - {medication.frequency}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(medication.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showForm ? (
            <MedicationForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              isSubmitting={isSubmitting}
            />
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowForm(true)}
              className="w-full"
            >
              + Add Medication
            </Button>
          )}

          <div className="flex gap-3 justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>
              {medications.length > 0 ? 'Continue' : 'Skip'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
