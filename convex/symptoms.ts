import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Symptom Queries and Mutations
 *
 * Backend functions for symptom tracking with Convex.
 * All functions automatically filter by authenticated user.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get all symptoms for the current user
 * Sorted by loggedAt descending (most recent first)
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: You must be signed in to view symptoms");
    }

    return await ctx.db
      .query("symptoms")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

/**
 * Get recent symptoms for dashboard
 * @param limit - Maximum number of symptoms to return (default: 30)
 */
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: You must be signed in to view symptoms");
    }

    return await ctx.db
      .query("symptoms")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .take(args.limit ?? 30);
  },
});

/**
 * Get symptoms within a date range
 * @param startDate - Unix timestamp (milliseconds)
 * @param endDate - Unix timestamp (milliseconds)
 */
export const getByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: You must be signed in to view symptoms");
    }

    const symptoms = await ctx.db
      .query("symptoms")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.gte(q.field("loggedAt"), args.startDate),
          q.lte(q.field("loggedAt"), args.endDate)
        )
      )
      .collect();

    return symptoms;
  },
});

/**
 * Get single symptom by ID
 * @param id - Symptom ID
 */
export const getById = query({
  args: { id: v.id("symptoms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: You must be signed in to view symptoms");
    }

    const symptom = await ctx.db.get(args.id);

    // Verify ownership
    if (!symptom || symptom.userId !== identity.subject) {
      throw new Error("Symptom not found or unauthorized");
    }

    return symptom;
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new symptom
 */
export const create = mutation({
  args: {
    symptomType: v.string(),
    severity: v.number(),
    
    triggers: v.optional(v.string()),
    notes: v.optional(v.string()),
    loggedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const symptomId = await ctx.db.insert("symptoms", {
      userId: identity.subject,
      ...args,
    });

    return symptomId;
  },
});

/**
 * Update an existing symptom
 */
export const update = mutation({
  args: {
    id: v.id("symptoms"),
    symptomType: v.optional(v.string()),
    severity: v.optional(v.number()),
    
    triggers: v.optional(v.string()),
    notes: v.optional(v.string()),
    loggedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { id, ...updates } = args;

    // Verify ownership
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Symptom not found or unauthorized");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Delete a symptom
 */
export const remove = mutation({
  args: { id: v.id("symptoms") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Verify ownership
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Symptom not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
