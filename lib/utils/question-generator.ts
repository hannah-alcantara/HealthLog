import type { Condition, Medication, Allergy } from '@/lib/schemas/medical-history';

/**
 * Generates placeholder questions for appointment preparation based on symptoms and medical history
 * This is a placeholder implementation - will be replaced with AI integration in future iteration
 */
export function generateAppointmentQuestions(
  symptoms: string | null,
  conditions: Condition[],
  medications: Medication[],
  allergies: Allergy[]
): string[] {
  const questions: string[] = [];

  // Generic opening questions
  questions.push('What are my current vital signs and how do they compare to my last visit?');
  questions.push('Are there any test results or screenings I should review?');

  // Symptoms-based questions
  if (symptoms && symptoms.trim().length > 0) {
    questions.push(`I've been experiencing ${symptoms.toLowerCase()}. What could be causing this?`);
    questions.push('Should I be concerned about these symptoms or are they normal?');
    questions.push('What treatments or lifestyle changes do you recommend for my symptoms?');
  }

  // Condition-based questions
  if (conditions.length > 0) {
    const conditionNames = conditions.map((c) => c.name).join(', ');
    questions.push(`How is my ${conditionNames} progressing? Any changes I should be aware of?`);
    questions.push('Are there any new treatments or studies for my conditions?');
  }

  // Medication-based questions
  if (medications.length > 0) {
    questions.push('Are my current medications still the best option for me?');
    questions.push('Are there any side effects I should watch for with my medications?');

    if (medications.length > 1) {
      questions.push('Are there any interactions I should be aware of between my medications?');
    }
  }

  // Allergy-based questions
  if (allergies.length > 0) {
    questions.push('Should I be tested for any new allergies or sensitivities?');

    const severeAllergies = allergies.filter((a) => a.severity === 'severe');
    if (severeAllergies.length > 0) {
      questions.push('Do I need to update my emergency allergy action plan?');
    }
  }

  // General health questions
  questions.push('What preventive care or screenings should I prioritize this year?');
  questions.push('Are there any lifestyle changes you recommend based on my health profile?');

  // Limit to 10 most relevant questions
  return questions.slice(0, 10);
}

/**
 * Get a short preview of generated questions (first 3)
 */
export function getQuestionPreview(questions: string[]): string[] {
  return questions.slice(0, 3);
}
