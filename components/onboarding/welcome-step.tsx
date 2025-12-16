'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold text-center mb-2">Welcome to Health Log</h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Let's set up your health profile to get the most out of symptom tracking
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Medical Conditions</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add any ongoing health conditions to help track symptom patterns
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Current Medications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track your medications to identify potential side effects
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Allergies</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Record any known allergies for complete health records
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              This information helps generate better questions for your doctor visits.
              <br />
              You can always add or update this later.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onSkip}>
              Skip for Now
            </Button>
            <Button onClick={onNext} size="lg">
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
