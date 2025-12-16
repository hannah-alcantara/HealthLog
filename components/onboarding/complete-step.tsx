'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useConditions } from '@/lib/hooks/use-conditions';
import { useMedications } from '@/lib/hooks/use-medications';
import { useAllergies } from '@/lib/hooks/use-allergies';

interface CompleteStepProps {
  onComplete: () => void;
}

export function CompleteStep({ onComplete }: CompleteStepProps) {
  const { conditions } = useConditions();
  const { medications } = useMedications();
  const { allergies } = useAllergies();

  const totalAdded = conditions.length + medications.length + allergies.length;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">You're All Set!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {totalAdded > 0
                ? `You've added ${totalAdded} ${totalAdded === 1 ? 'item' : 'items'} to your health profile`
                : 'Your health profile is ready to go'}
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold">{conditions.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Conditions</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold">{medications.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Medications</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold">{allergies.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Allergies</div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-3">
            <h3 className="font-semibold">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Start logging your daily symptoms to track patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Schedule appointments and get AI-generated questions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Update your medical history anytime from the Medical History page</span>
              </li>
            </ul>
          </div>

          <Button onClick={onComplete} size="lg" className="w-full">
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
