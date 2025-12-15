'use client';

import type { Symptom } from '@/lib/schemas/symptom';
import { symptomCategoryLabels } from '@/lib/schemas/symptom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SymptomsListProps {
  symptoms: Symptom[];
  onEdit: (symptom: Symptom) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export function SymptomsList({ symptoms, onEdit, onDelete, onAdd }: SymptomsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-green-600 dark:text-green-400';
    if (severity <= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSeverityBg = (severity: number) => {
    if (severity <= 3) return 'bg-green-100 dark:bg-green-900/20';
    if (severity <= 6) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Symptom Log</h2>
        <Button onClick={onAdd}>Log New Symptom</Button>
      </div>

      {symptoms.length === 0 ? (
        <Card>
          <CardContent className="px-6 py-8 text-center text-gray-500">
            No symptoms logged yet. Click &quot;Log New Symptom&quot; to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {symptoms.map((symptom) => (
            <Card key={symptom.id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-semibold">{symptom.symptomType}</h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBg(
                          symptom.severity
                        )} ${getSeverityColor(symptom.severity)}`}
                      >
                        Severity: {symptom.severity}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(symptom.loggedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(symptom)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this symptom log?')) {
                          onDelete(symptom.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    {symptomCategoryLabels[symptom.category]}
                  </span>
                  {symptom.bodyPart && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-xs">
                      📍 {symptom.bodyPart}
                    </span>
                  )}
                </div>

                {symptom.triggers && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Triggers
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{symptom.triggers}</p>
                  </div>
                )}

                {symptom.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{symptom.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
