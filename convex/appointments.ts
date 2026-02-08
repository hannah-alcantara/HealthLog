import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Appointment Queries and Mutations
 *
 * Backend functions for appointment tracking with Convex.
 * All functions require authentication and automatically filter by authenticated user.
 */

// ============================================================================
// Queries
// ============================================================================

/**
 * Get all appointments for the current user
 * Sorted by date descending (most recent first)
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: You must be signed in to view appointments");
    }

    return await ctx.db
      .query("appointments")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

/**
 * Get upcoming appointments (date >= today)
 */
export const getUpcoming = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: You must be signed in to view appointments");
    }

    const now = Date.now();

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
      .filter((q) => q.gte(q.field("date"), now))
      .order("asc")
      .collect();

    return appointments;
  },
});

/**
 * Get appointments within a date range
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
      throw new Error("Unauthorized: You must be signed in to view appointments");
    }

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    return appointments;
  },
});

/**
 * Get single appointment by ID
 * @param id - Appointment ID
 */
export const getById = query({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: You must be signed in to view appointments");
    }

    const appointment = await ctx.db.get(args.id);

    // Verify ownership
    if (!appointment || appointment.userId !== identity.subject) {
      throw new Error("Appointment not found or unauthorized");
    }

    return appointment;
  },
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new appointment
 */
export const create = mutation({
  args: {
    date: v.number(),
    doctorName: v.string(),
    reason: v.string(),
    symptoms: v.optional(v.string()),
    notes: v.optional(v.string()),
    generatedQuestions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const appointmentId = await ctx.db.insert("appointments", {
      userId: identity.subject,
      ...args,
    });

    return appointmentId;
  },
});

/**
 * Update an existing appointment
 */
export const update = mutation({
  args: {
    id: v.id("appointments"),
    date: v.optional(v.number()),
    doctorName: v.optional(v.string()),
    reason: v.optional(v.string()),
    symptoms: v.optional(v.string()),
    notes: v.optional(v.string()),
    generatedQuestions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { id, ...updates } = args;

    // Verify ownership
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Appointment not found or unauthorized");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

/**
 * Delete an appointment
 */
export const remove = mutation({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Verify ownership
    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== identity.subject) {
      throw new Error("Appointment not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
