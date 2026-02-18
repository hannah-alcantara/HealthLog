import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/**
 * AI Actions using Gemini API
 *
 * These actions use Google's Gemini API to generate intelligent insights
 * based on user symptom data.
 */

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Generate appointment questions based on symptom history
 *
 * Analyzes symptom patterns between appointments and generates 5 personalized questions
 * for upcoming doctor appointments using Gemini AI.
 *
 * Data Selection:
 * - Analyzes symptoms from the last appointment date until the upcoming appointment
 * - If no previous appointment exists, defaults to last 30 days
 * - If custom startDate provided, uses that as the starting point
 *
 * @param appointmentSymptoms - Optional: Current symptoms for this specific appointment
 * @param appointmentDate - The date of the upcoming appointment
 * @param startDate - Optional: Custom start date for symptom analysis (e.g., previous appointment date)
 * @returns Array of 5 AI-generated questions to ask the doctor
 */
export const generateAppointmentQuestions = action({
  args: {
    appointmentSymptoms: v.optional(v.string()),
    appointmentDate: v.number(),
    startDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: You must be signed in");
    }

    // Determine the date range for symptom analysis
    let analysisStartDate: number;

    if (args.startDate) {
      // Use provided start date (e.g., previous appointment date)
      analysisStartDate = args.startDate;
    } else {
      // Default to 30 days before the appointment if no previous appointment
      analysisStartDate = args.appointmentDate - 30 * 24 * 60 * 60 * 1000;
    }

    const analysisEndDate = args.appointmentDate;

    // Query symptoms between the date range
    const symptoms = await ctx.runQuery(api.symptoms.getByDateRange, {
      startDate: analysisStartDate,
      endDate: analysisEndDate,
    });

    // Format symptom data for Gemini
    const symptomSummary = formatSymptomDataForAI(
      symptoms,
      args.appointmentSymptoms,
    );

    // Get Gemini API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Call Gemini API
    const prompt = createPrompt(symptomSummary, args.appointmentSymptoms);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();

      // Parse the generated questions from Gemini's response
      const generatedText = data.candidates[0]?.content?.parts[0]?.text;
      if (!generatedText) {
        throw new Error("No response from Gemini API");
      }

      // Extract questions from the response (expect numbered list)
      const questions = parseQuestionsFromResponse(generatedText);

      return questions;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw new Error(
        error instanceof Error ? error.message : "Failed to generate questions",
      );
    }
  },
});

/**
 * Format symptom data into a clear summary for AI analysis
 *
 * Creates a structured summary including:
 * - Time range of data (between appointments)
 * - Symptom frequency and patterns
 * - Severity statistics (average, min, max)
 * - Common triggers
 * - Recent notes from symptom logs
 */
function formatSymptomDataForAI(
  symptoms: any[],
  appointmentSymptoms?: string,
): string {
  if (symptoms.length === 0) {
    return "No symptom history available since the last appointment.";
  }

  // Calculate the actual time range of the data
  const oldestSymptom = symptoms[symptoms.length - 1].loggedAt;
  const newestSymptom = symptoms[0].loggedAt;
  const daysSpan = Math.ceil(
    (newestSymptom - oldestSymptom) / (24 * 60 * 60 * 1000),
  );

  // Group symptoms by type and analyze patterns
  const symptomGroups: Record<string, any[]> = {};
  symptoms.forEach((symptom) => {
    if (!symptomGroups[symptom.symptomType]) {
      symptomGroups[symptom.symptomType] = [];
    }
    symptomGroups[symptom.symptomType].push(symptom);
  });

  let summary = `Symptom History Since Last Appointment (${symptoms.length} entries over ${daysSpan} days):\n\n`;

  // Summarize each symptom type
  Object.entries(symptomGroups).forEach(([type, entries]) => {
    const avgSeverity =
      entries.reduce((sum, s) => sum + s.severity, 0) / entries.length;
    const maxSeverity = Math.max(...entries.map((s) => s.severity));
    const minSeverity = Math.min(...entries.map((s) => s.severity));

    // Collect unique triggers
    const triggers = new Set<string>();
    entries.forEach((s) => {
      if (s.triggers) {
        s.triggers.split(", ").forEach((t: string) => triggers.add(t.trim()));
      }
    });

    // Collect notes
    const notes = entries
      .filter((s) => s.notes)
      .map((s) => s.notes)
      .slice(0, 3); // Last 3 notes

    summary += `- ${type}:\n`;
    summary += `  * Occurrences: ${entries.length}\n`;
    summary += `  * Severity: avg ${avgSeverity.toFixed(1)}/10, range ${minSeverity}-${maxSeverity}/10\n`;

    if (triggers.size > 0) {
      summary += `  * Common triggers: ${Array.from(triggers).join(", ")}\n`;
    }

    if (notes.length > 0) {
      summary += `  * Recent notes: ${notes.join("; ")}\n`;
    }

    summary += "\n";
  });

  if (appointmentSymptoms) {
    summary += `\nCurrent appointment concerns: ${appointmentSymptoms}\n`;
  }

  return summary;
}

/**
 * Create the prompt for Gemini API
 */
function createPrompt(
  symptomSummary: string,
  appointmentSymptoms?: string,
): string {
  return `You are helping a patient jot down questions to bring up with their doctor at an upcoming appointment.

Based on their symptom history below, write 5 questions they could naturally say out loud in the appointment room. The questions should:
- Sound like something a real person would actually say to their doctor, not a formal medical document
- Be specific to the patterns in their data (mention the actual symptoms, triggers, or trends)
- Invite the doctor's opinion rather than suggesting answers
- Be warm and conversational in tone — short, clear sentences
- Prioritize the most noticeable or recurring issues first

For example, prefer something like "I've been getting headaches a lot lately — do you think stress could be behind it?" over "What is the etiology of my recurring cephalgia?"

${symptomSummary}

Write exactly 5 questions, numbered 1-5, one per line. No intro text, no explanations — just the questions.`;
}

/**
 * Parse questions from Gemini's response
 */
function parseQuestionsFromResponse(responseText: string): string[] {
  // Split by newlines and filter out empty lines
  const lines = responseText.split("\n").filter((line) => line.trim());

  const questions: string[] = [];

  for (const line of lines) {
    // Match lines that start with a number followed by a period or parenthesis
    const match = line.match(/^\s*\d+[\.\)]\s*(.+)$/);
    if (match && match[1]) {
      questions.push(match[1].trim());
    }
  }

  // If we didn't find numbered questions, try to split by sentences
  if (questions.length === 0) {
    const sentences = responseText
      .split(/[.?!]\s+/)
      .filter((s) => s.trim().length > 10)
      .map((s) => s.trim() + (s.endsWith("?") ? "" : "?"));

    return sentences.slice(0, 5);
  }

  return questions.slice(0, 5);
}
