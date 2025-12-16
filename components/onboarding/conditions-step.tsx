'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ConditionForm } from '@/components/medical-history/condition-form';
import { useConditions } from '@/lib/hooks/use-conditions';
import type { CreateConditionInput } from '@/lib/schemas/medical-history';

interface ConditionsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ConditionsStep({ onNext, onBack }: ConditionsStepProps) {
  const { conditions, create, remove } = useConditions();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateConditionInput) => {
    setIsSubmitting(true);
    try {
      await create(data);
      setShowForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add condition');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove condition');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Medical Conditions</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Add any ongoing health conditions (optional)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {conditions.length > 0 && (
            <div className="space-y-2">
              {conditions.map((condition) => (
                <div
                  key={condition.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{condition.name}</p>
                    {condition.diagnosisDate && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Diagnosed: {new Date(condition.diagnosisDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(condition.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showForm ? (
            <ConditionForm
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
              + Add Condition
            </Button>
          )}

          <div className="flex gap-3 justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>
              {conditions.length > 0 ? 'Continue' : 'Skip'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
