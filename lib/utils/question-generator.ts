import type { Symptom } from '@/lib/schemas/symptom';

/**
 * Pattern Analysis Helper Functions for generating context-aware appointment questions.
 *
 * These functions analyze symptom history to identify patterns, trends, and
 * correlations that inform intelligent question generation.
 */

/**
 * Frequency data for a specific symptom type over a time period.
 */
interface SymptomFrequency {
  symptomType: string;
  count: number;
  avgSeverity: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
}

/**
 * Severity trend analysis for a symptom type.
 */
interface SeverityTrend {
  symptomType: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  startAvg: number;
  endAvg: number;
  change: number;
}

/**
 * Frequency count for a specific trigger.
 */
interface TriggerFrequency {
  trigger: string;
  count: number;
}

/**
 * Analyze symptom frequency over a time period.
 *
 * Groups symptoms by type and calculates occurrence count, average severity,
 * and first/last occurrence dates. Results are sorted by frequency (most common first).
 *
 * @param symptoms - Array of symptom logs to analyze
 * @param days - Number of days to look back (default: 30)
 * @returns Array of symptom frequency data sorted by count descending
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
 * Analyze severity trends for symptoms over time.
 *
 * Compares average severity in the first half vs second half of the time period
 * to detect increasing, decreasing, or stable trends. Requires at least 2
 * occurrences of a symptom type to calculate trends.
 *
 * @param symptoms - Array of symptom logs to analyze
 * @param days - Number of days to look back (default: 30)
 * @returns Array of severity trends (change > 1 = increasing, < -1 = decreasing, else stable)
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
 * Extract and count common symptom triggers.
 *
 * Parses trigger strings (comma or semicolon separated), normalizes to lowercase,
 * and returns the top 5 most frequently mentioned triggers.
 *
 * @param symptoms - Array of symptom logs with optional trigger data
 * @returns Top 5 triggers sorted by frequency descending
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
 * Generate context-aware appointment questions based on symptom history.
 *
 * Analyzes symptom patterns to generate intelligent, personalized questions
 * for doctor appointments. Uses rule-based pattern analysis to identify:
 * - Recurring symptoms and frequency patterns
 * - Severity trends (increasing/decreasing)
 * - Common triggers
 *
 * @param appointmentSymptoms - Symptoms reported for this specific appointment
 * @param symptomLogs - Historical symptom logs for pattern analysis
 * @param daysToAnalyze - Number of days to look back for pattern analysis (default: 30)
 * @returns Array of up to 10 most relevant questions
 *
 * @example
 * ```ts
 * const questions = generateAppointmentQuestions(
 *   'persistent headaches',
 *   recentSymptoms,
 *   30
 * );
 * ```
 */
export function generateAppointmentQuestions(
  appointmentSymptoms: string | null,
  symptomLogs: Symptom[] = [],
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

  // CURRENT APPOINTMENT SYMPTOMS (if provided)
  if (appointmentSymptoms && appointmentSymptoms.trim().length > 0) {
    questions.push(
      `For this visit, I'm experiencing ${appointmentSymptoms.toLowerCase()}. ` +
      `What treatments or lifestyle changes do you recommend?`
    );
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