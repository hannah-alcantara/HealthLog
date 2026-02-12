/**
 * Symptom API Contract (Convex)
 *
 * This file defines the TypeScript contract for symptom-related Convex queries and mutations.
 * These contracts serve as documentation and type reference for the Convex backend implementation.
 *
 * Note: This is a documentation/contract file, not executable code.
 * The Id type reference is for documentation purposes.
 */

// Type placeholder for documentation (will be imported from convex/_generated/dataModel in actual implementation)
type Id<T extends string> = string & { __tableName: T };

// ============================================================================
// Types
// ============================================================================

/**
 * Symptom entity as stored in Convex database
 */
export interface Symptom {
  _id: Id<"symptoms">;
  _creationTime: number;
  userId: Id<"users">;
  symptomType: string;
  severity: number;
  bodyPart?: string;
  triggers?: string;
  notes?: string;
  loggedAt: number;
}

/**
 * Input for creating a new symptom
 */
export interface CreateSymptomInput {
  symptomType: string;
  severity: number;
  bodyPart?: string;
  triggers?: string;
  notes?: string;
  loggedAt: number;
}

/**
 * Input for updating an existing symptom
 */
export interface UpdateSymptomInput {
  id: Id<"symptoms">;
  symptomType?: string;
  severity?: number;
  bodyPart?: string;
  triggers?: string;
  notes?: string;
  loggedAt?: number;
}

// ============================================================================
// Query Contracts
// ============================================================================

/**
 * Get all symptoms for the current user
 *
 * @returns Array of symptoms ordered by loggedAt (descending)
 */
export type GetAllSymptomsQuery = {
  args: Record<string, never>;
  returns: Symptom[];
};

/**
 * Get recent symptoms for dashboard (limited)
 *
 * @param limit - Maximum number of symptoms to return (default: 30)
 * @returns Array of most recent symptoms
 */
export type GetRecentSymptomsQuery = {
  args: { limit?: number };
  returns: Symptom[];
};

/**
 * Get symptoms within a date range
 *
 * @param startDate - Unix timestamp (milliseconds)
 * @param endDate - Unix timestamp (milliseconds)
 * @returns Array of symptoms logged between startDate and endDate
 */
export type GetSymptomsByDateRangeQuery = {
  args: { startDate: number; endDate: number };
  returns: Symptom[];
};

/**
 * Get single symptom by ID
 *
 * @param id - Symptom ID
 * @returns Symptom object or null if not found
 */
export type GetSymptomByIdQuery = {
  args: { id: Id<"symptoms"> };
  returns: Symptom | null;
};

// ============================================================================
// Mutation Contracts
// ============================================================================

/**
 * Create a new symptom
 *
 * @param symptomType - Type of symptom (e.g., "Headache", "Nausea")
 * @param severity - Severity on 1-10 scale
 * @param bodyPart - Optional body part affected
 * @param triggers - Optional triggers description
 * @param notes - Optional additional notes
 * @param loggedAt - Unix timestamp when symptom was logged
 * @returns ID of created symptom
 * @throws Error if unauthorized or validation fails
 */
export type CreateSymptomMutation = {
  args: CreateSymptomInput;
  returns: Id<"symptoms">;
};

/**
 * Update an existing symptom
 *
 * @param id - Symptom ID to update
 * @param updates - Partial symptom data to update
 * @returns ID of updated symptom
 * @throws Error if symptom not found, unauthorized, or validation fails
 */
export type UpdateSymptomMutation = {
  args: UpdateSymptomInput;
  returns: Id<"symptoms">;
};

/**
 * Delete a symptom
 *
 * @param id - Symptom ID to delete
 * @returns void
 * @throws Error if symptom not found or unauthorized
 */
export type DeleteSymptomMutation = {
  args: { id: Id<"symptoms"> };
  returns: void;
};

// ============================================================================
// Convex Function Implementations (Reference)
// ============================================================================

/**
 * Example Convex implementation structure for reference:
 *
 * ```typescript
 * // convex/symptoms.ts
 * import { query, mutation } from "./_generated/server";
 * import { v } from "convex/values";
 *
 * // Query: Get all symptoms
 * export const getAll = query({
 *   args: {},
 *   handler: async (ctx): Promise<Symptom[]> => {
 *     const identity = await ctx.auth.getUserIdentity();
 *     if (!identity) return [];
 *
 *     return await ctx.db
 *       .query("symptoms")
 *       .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
 *       .order("desc")
 *       .collect();
 *   },
 * });
 *
 * // Mutation: Create symptom
 * export const create = mutation({
 *   args: {
 *     symptomType: v.string(),
 *     severity: v.number(),
 *     bodyPart: v.optional(v.string()),
 *     triggers: v.optional(v.string()),
 *     notes: v.optional(v.string()),
 *     loggedAt: v.number(),
 *   },
 *   handler: async (ctx, args): Promise<Id<"symptoms">> => {
 *     const identity = await ctx.auth.getUserIdentity();
 *     if (!identity) throw new Error("Unauthorized");
 *
 *     return await ctx.db.insert("symptoms", {
 *       userId: identity.subject as Id<"users">,
 *       ...args,
 *     });
 *   },
 * });
 * ```
 */

// ============================================================================
// Frontend Usage Examples
// ============================================================================

/**
 * Example usage in React components:
 *
 * ```typescript
 * // Query example
 * import { useQuery } from "convex/react";
 * import { api } from "@/convex/_generated/api";
 *
 * function SymptomsList() {
 *   const symptoms = useQuery(api.symptoms.getAll);
 *
 *   if (symptoms === undefined) {
 *     return <LoadingSkeleton />;
 *   }
 *
 *   return symptoms.map(s => <SymptomCard key={s._id} symptom={s} />);
 * }
 *
 * // Mutation example
 * import { useMutation } from "convex/react";
 *
 * function SymptomForm() {
 *   const createSymptom = useMutation(api.symptoms.create);
 *
 *   const handleSubmit = async (data: CreateSymptomInput) => {
 *     await createSymptom(data);
 *     toast.success("Symptom logged!");
 *   };
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */

// ============================================================================
// Validation Rules
// ============================================================================

/**
 * Server-side validation (enforced by Convex):
 * - symptomType: Non-empty string
 * - severity: Number (1-10 recommended, enforced client-side)
 * - bodyPart: Optional string
 * - triggers: Optional string
 * - notes: Optional string
 * - loggedAt: Number (Unix timestamp)
 *
 * Client-side validation (enforced by Zod in lib/schemas/symptom.ts):
 * - symptomType: 1-200 characters, trimmed
 * - severity: Integer 1-10
 * - bodyPart: Max 100 characters
 * - triggers: Max 500 characters
 * - notes: Max 2000 characters
 */
