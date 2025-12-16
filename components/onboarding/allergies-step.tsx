'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AllergyForm } from '@/components/medical-history/allergy-form';
import { useAllergies } from '@/lib/hooks/use-allergies';
import type { CreateAllergyInput } from '@/lib/schemas/medical-history';

interface AllergiesStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function AllergiesStep({ onNext, onBack }: AllergiesStepProps) {
  const { allergies, create, remove } = useAllergies();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateAllergyInput) => {
    setIsSubmitting(true);
    try {
      await create(data);
      setShowForm(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add allergy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove allergy');
    }
  };

  const getSeverityBadge = (severity: string | null) => {
    if (!severity) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    const colors = {
      mild: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      moderate: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      severe: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[severity as keyof typeof colors] || colors.mild;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Allergies</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Add any known allergies (optional)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {allergies.length > 0 && (
            <div className="space-y-2">
              {allergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{allergy.allergen}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {allergy.severity && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getSeverityBadge(
                            allergy.severity
                          )}`}
                        >
                          {allergy.severity}
                        </span>
                      )}
                      {allergy.reaction && (
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {allergy.reaction}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(allergy.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {showForm ? (
            <AllergyForm
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
              + Add Allergy
            </Button>
          )}

          <div className="flex gap-3 justify-between pt-4 border-t">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>
              {allergies.length > 0 ? 'Complete Setup' : 'Skip & Finish'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
