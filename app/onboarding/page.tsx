'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/lib/hooks/use-onboarding';
import { WelcomeStep } from '@/components/onboarding/welcome-step';
import { ConditionsStep } from '@/components/onboarding/conditions-step';
import { MedicationsStep } from '@/components/onboarding/medications-step';
import { AllergiesStep } from '@/components/onboarding/allergies-step';
import { CompleteStep } from '@/components/onboarding/complete-step';

type Step = 'welcome' | 'conditions' | 'medications' | 'allergies' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const { status, loading, updateStep, complete, skip } = useOnboarding();
  const [currentStep, setCurrentStep] = useState<Step>(
    status?.step || 'welcome'
  );

  useEffect(() => {
    if (!loading && status && (status.completed || status.skipped)) {
      router.replace('/');
    }
  }, [loading, status, router]);

  const handleNext = (nextStep: Step) => {
    setCurrentStep(nextStep);
    updateStep(nextStep);
  };

  const handleBack = (prevStep: Step) => {
    setCurrentStep(prevStep);
    updateStep(prevStep);
  };

  const handleSkip = () => {
    skip();
    router.push('/');
  };

  const handleComplete = () => {
    complete();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 min-h-screen">
      {/* Progress indicator */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-center gap-2">
          {['welcome', 'conditions', 'medications', 'allergies', 'complete'].map((step, index) => {
            const steps: Step[] = ['welcome', 'conditions', 'medications', 'allergies', 'complete'];
            const currentIndex = steps.indexOf(currentStep);
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 4 && (
                  <div
                    className={`w-8 md:w-16 h-1 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      {currentStep === 'welcome' && (
        <WelcomeStep
          onNext={() => handleNext('conditions')}
          onSkip={handleSkip}
        />
      )}

      {currentStep === 'conditions' && (
        <ConditionsStep
          onNext={() => handleNext('medications')}
          onBack={() => handleBack('welcome')}
        />
      )}

      {currentStep === 'medications' && (
        <MedicationsStep
          onNext={() => handleNext('allergies')}
          onBack={() => handleBack('conditions')}
        />
      )}

      {currentStep === 'allergies' && (
        <AllergiesStep
          onNext={() => handleNext('complete')}
          onBack={() => handleBack('medications')}
        />
      )}

      {currentStep === 'complete' && (
        <CompleteStep onComplete={handleComplete} />
      )}
    </div>
  );
}
