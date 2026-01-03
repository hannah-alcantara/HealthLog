import type { Condition, Medication, Allergy } from '@/lib/schemas/medical-history';
import type { Symptom } from '@/lib/schemas/symptom';

/**
 * Pattern Analysis Helper Functions
 */

interface SymptomFrequency {
  symptomType: string;
  count: number;
  avgSeverity: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
}

interface SeverityTrend {
  symptomType: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  startAvg: number;
  endAvg: number;
  change: number;
}

interface TriggerFrequency {
  trigger: string;
  count: number;
}

/**
 * Analyze symptom frequency over a period
 */
function analyzeSymptomFrequency(symptoms: Symptom[], days: number = 30): SymptomFrequency[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentSymptoms = symptoms.filter(s => new Date(s.loggedAt) >= cutoffDate);

  // Group by symptom type
  const grouped: Record<string, Symptom[]> = {};
  recentSymptoms.forEach(s => {
    const key = s.symptomType.toLowerCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  // Calculate frequency data
  return Object.entries(grouped).map(([, instances]) => {
    const dates = instances.map(i => new Date(i.loggedAt));
    const avgSeverity = instances.reduce((sum, i) => sum + i.severity, 0) / instances.length;

    return {
      symptomType: instances[0].symptomType, // Use original casing
      count: instances.length,
      avgSeverity: Math.round(avgSeverity * 10) / 10,
      firstOccurrence: new Date(Math.min(...dates.map(d => d.getTime()))),
      lastOccurrence: new Date(Math.max(...dates.map(d => d.getTime()))),
    };
  }).sort((a, b) => b.count - a.count); // Most frequent first
}

/**
 * Analyze severity trends for symptoms
 */
function analyzeSeverityTrends(symptoms: Symptom[], days: number = 30): SeverityTrend[] {
  const frequencies = analyzeSymptomFrequency(symptoms, days);
  const trends: SeverityTrend[] = [];

  frequencies.forEach(freq => {
    if (freq.count < 2) return; // Need at least 2 occurrences to detect trend

    const symptomInstances = symptoms
      .filter(s => s.symptomType.toLowerCase() === freq.symptomType.toLowerCase())
      .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());

    // Split into first half and second half
    const midpoint = Math.floor(symptomInstances.length / 2);
    const firstHalf = symptomInstances.slice(0, midpoint);
    const secondHalf = symptomInstances.slice(midpoint);

    const startAvg = firstHalf.reduce((sum, s) => sum + s.severity, 0) / firstHalf.length;
    const endAvg = secondHalf.reduce((sum, s) => sum + s.severity, 0) / secondHalf.length;
    const change = endAvg - startAvg;

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (change > 1) trend = 'increasing';
    else if (change < -1) trend = 'decreasing';
    else trend = 'stable';

    trends.push({
      symptomType: freq.symptomType,
      trend,
      startAvg: Math.round(startAvg * 10) / 10,
      endAvg: Math.round(endAvg * 10) / 10,
      change: Math.round(change * 10) / 10,
    });
  });

  return trends;
}

/**
 * Extract and count common triggers
 */
function analyzeCommonTriggers(symptoms: Symptom[]): TriggerFrequency[] {
  const triggerCounts: Record<string, number> = {};

  symptoms.forEach(s => {
    if (s.triggers && s.triggers.trim().length > 0) {
      // Split by common separators and normalize
      const triggers = s.triggers
        .toLowerCase()
        .split(/[,;]/)
        .map(t => t.trim())
        .filter(t => t.length > 0);

      triggers.forEach(trigger => {
        triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
      });
    }
  });

  return Object.entries(triggerCounts)
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 triggers
}

/**
 * Find most affected body parts
 */
function analyzeMostAffectedBodyParts(symptoms: Symptom[]): string[] {
  const bodyPartCounts: Record<string, number> = {};

  symptoms.forEach(s => {
    if (s.bodyPart && s.bodyPart.trim().length > 0) {
      const normalized = s.bodyPart.toLowerCase().trim();
      bodyPartCounts[normalized] = (bodyPartCounts[normalized] || 0) + 1;
    }
  });

  return Object.entries(bodyPartCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([part]) => part);
}

/**
 * Enhanced question generation with symptom pattern analysis
 */
export function generateAppointmentQuestions(
  appointmentSymptoms: string | null,
  symptomLogs: Symptom[] = [],
  conditions: Condition[] = [],
  medications: Medication[] = [],
  allergies: Allergy[] = [],
  daysToAnalyze: number = 30
): string[] {
  const questions: string[] = [];

  // Always start with generic opening questions
  questions.push('What are my current vital signs and how do they compare to my last visit?');
  questions.push('Are there any test results or screenings I should review?');

  // Analyze patterns from symptom logs
  const frequencies = analyzeSymptomFrequency(symptomLogs, daysToAnalyze);
  const trends = analyzeSeverityTrends(symptomLogs, daysToAnalyze);
  const triggers = analyzeCommonTriggers(symptomLogs);
  const bodyParts = analyzeMostAffectedBodyParts(symptomLogs);

  // FREQUENCY-BASED QUESTIONS (recurring symptoms)
  frequencies.slice(0, 2).forEach(freq => {
    if (freq.count >= 3) {
      const timeframe = daysToAnalyze === 30 ? 'past month' : `past ${daysToAnalyze} days`;
      questions.push(
        `I've logged ${freq.symptomType.toLowerCase()} ${freq.count} times in the ${timeframe} ` +
        `with an average severity of ${freq.avgSeverity}/10. What could be causing this pattern?`
      );
    }
  });

  // TREND-BASED QUESTIONS (increasing/decreasing severity)
  trends.forEach(trend => {
    if (trend.trend === 'increasing' && trend.change >= 1.5) {
      questions.push(
        `My ${trend.symptomType.toLowerCase()} severity has increased from ${trend.startAvg}/10 to ` +
        `${trend.endAvg}/10 recently. Should I be concerned about this escalation?`
      );
    } else if (trend.trend === 'decreasing' && trend.change <= -1.5) {
      questions.push(
        `My ${trend.symptomType.toLowerCase()} severity has improved from ${trend.startAvg}/10 to ` +
        `${trend.endAvg}/10. Is my current treatment working well?`
      );
    }
  });

  // TRIGGER-BASED QUESTIONS
  if (triggers.length > 0) {
    const topTriggers = triggers.slice(0, 2).map(t => t.trigger).join(' and ');
    questions.push(
      `I've noticed my symptoms are often triggered by ${topTriggers}. ` +
      `How can I better manage or prevent these triggers?`
    );
  }

  // BODY PART CORRELATION
  if (bodyParts.length > 0) {
    const parts = bodyParts.join(', ');
    questions.push(
      `Most of my symptoms affect my ${parts}. Could these be related or part of a larger issue?`
    );
  }

  // CURRENT APPOINTMENT SYMPTOMS (if provided)
  if (appointmentSymptoms && appointmentSymptoms.trim().length > 0) {
    questions.push(
      `For this visit, I'm experiencing ${appointmentSymptoms.toLowerCase()}. ` +
      `What treatments or lifestyle changes do you recommend?`
    );
  }

  // CONDITION CORRELATIONS
  if (conditions.length > 0 && frequencies.length > 0) {
    const conditionNames = conditions.map(c => c.name).join(', ');
    questions.push(
      `Given my conditions (${conditionNames}), could my recurring symptoms be related? ` +
      `Should we adjust my treatment plan?`
    );
  }

  // MEDICATION SIDE EFFECTS
  if (medications.length > 0 && symptomLogs.length > 0) {
    const digestiveSymptoms = symptomLogs.filter(s => s.category === 'digestive').length;
    if (digestiveSymptoms > 0) {
      questions.push(
        `I've had ${digestiveSymptoms} digestive symptoms recently. ` +
        `Could any of my medications be causing side effects?`
      );
    }
  }

  // MEDICATION INTERACTIONS
  if (medications.length > 1) {
    questions.push('Are there any interactions I should be aware of between my medications?');
  }

  // ALLERGY CONSIDERATIONS
  if (allergies.length > 0) {
    const severeAllergies = allergies.filter(a => a.severity === 'severe');
    if (severeAllergies.length > 0) {
      questions.push('Do I need to update my emergency allergy action plan?');
    }

    // Check for skin symptoms with allergies
    const skinSymptoms = symptomLogs.filter(s => s.category === 'skin').length;
    if (skinSymptoms >= 2) {
      questions.push(
        `I've had ${skinSymptoms} skin-related symptoms. Given my known allergies, ` +
        `should I be tested for additional sensitivities?`
      );
    }
  }

  // GENERAL HEALTH
  questions.push('What preventive care or screenings should I prioritize this year?');
  questions.push('Are there any lifestyle changes you recommend based on my health profile?');

  // Return top 10 most relevant questions
  return questions.slice(0, 10);
}

/**
 * Get a short preview of generated questions (first 3)
 */
export function getQuestionPreview(questions: string[]): string[] {
  return questions.slice(0, 3);
}