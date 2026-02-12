import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  symptoms: defineTable({
    userId: v.string(),              // Owner (authenticated or anonymous) - identity.subject
    symptomType: v.string(),         // e.g., "Headache", "Nausea", "Fatigue"
    severity: v.number(),            // 1-10 scale
    
    triggers: v.optional(v.string()), // Possible triggers (freeform text)
    notes: v.optional(v.string()),    // Additional notes
    loggedAt: v.number(),            // Unix timestamp (milliseconds)
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "loggedAt"]),

  appointments: defineTable({
    userId: v.string(),              // Owner (authenticated or anonymous) - identity.subject
    date: v.number(),                // Unix timestamp for appointment date
    doctorName: v.string(),
    reason: v.string(),              // Reason for visit
    symptoms: v.optional(v.string()), // Freeform text describing current symptoms
    notes: v.optional(v.string()),    // Doctor notes or follow-up info
    generatedQuestions: v.optional(v.array(v.string())), // AI-generated questions
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),
});
