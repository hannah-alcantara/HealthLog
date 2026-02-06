/**
 * Appointment API Contract (Convex)
 *
 * This file defines the TypeScript contract for appointment-related Convex queries and mutations.
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
 * Appointment entity as stored in Convex database
 */
export interface Appointment {
  _id: Id<"appointments">;
  _creationTime: number;
  userId: Id<"users">;
  date: number;
  doctorName: string;
  reason: string;
  symptoms?: string;
  notes?: string;
  generatedQuestions?: string[];
}

/**
 * Input for creating a new appointment
 */
export interface CreateAppointmentInput {
  date: number;
  doctorName: string;
  reason: string;
  symptoms?: string;
  notes?: string;
  generatedQuestions?: string[];
}

/**
 * Input for updating an existing appointment
 */
export interface UpdateAppointmentInput {
  id: Id<"appointments">;
  date?: number;
  doctorName?: string;
  reason?: string;
  symptoms?: string;
  notes?: string;
  generatedQuestions?: string[];
}

// ============================================================================
// Query Contracts
// ============================================================================

/**
 * Get all appointments for the current user
 *
 * @returns Array of appointments ordered by date (descending)
 */
export type GetAllAppointmentsQuery = {
  args: Record<string, never>;
  returns: Appointment[];
};

/**
 * Get upcoming appointments (date >= today)
 *
 * @returns Array of future appointments
 */
export type GetUpcomingAppointmentsQuery = {
  args: Record<string, never>;
  returns: Appointment[];
};

/**
 * Get appointments within a date range
 *
 * @param startDate - Unix timestamp (milliseconds)
 * @param endDate - Unix timestamp (milliseconds)
 * @returns Array of appointments between startDate and endDate
 */
export type GetAppointmentsByDateRangeQuery = {
  args: { startDate: number; endDate: number };
  returns: Appointment[];
};

/**
 * Get single appointment by ID
 *
 * @param id - Appointment ID
 * @returns Appointment object or null if not found
 */
export type GetAppointmentByIdQuery = {
  args: { id: Id<"appointments"> };
  returns: Appointment | null;
};

// ============================================================================
// Mutation Contracts
// ============================================================================

/**
 * Create a new appointment
 *
 * @param date - Unix timestamp for appointment date
 * @param doctorName - Name of the doctor
 * @param reason - Reason for visit
 * @param symptoms - Optional symptoms description (for preparation)
 * @param notes - Optional doctor notes
 * @param generatedQuestions - Optional AI-generated questions
 * @returns ID of created appointment
 * @throws Error if unauthorized or validation fails
 */
export type CreateAppointmentMutation = {
  args: CreateAppointmentInput;
  returns: Id<"appointments">;
};

/**
 * Update an existing appointment
 *
 * @param id - Appointment ID to update
 * @param updates - Partial appointment data to update
 * @returns ID of updated appointment
 * @throws Error if appointment not found, unauthorized, or validation fails
 */
export type UpdateAppointmentMutation = {
  args: UpdateAppointmentInput;
  returns: Id<"appointments">;
};

/**
 * Delete an appointment
 *
 * @param id - Appointment ID to delete
 * @returns void
 * @throws Error if appointment not found or unauthorized
 */
export type DeleteAppointmentMutation = {
  args: { id: Id<"appointments"> };
  returns: void;
};

/**
 * Generate questions for an appointment based on symptoms
 *
 * @param id - Appointment ID
 * @returns Array of generated question strings
 * @throws Error if appointment not found or unauthorized
 */
export type GenerateQuestionsMutation = {
  args: { id: Id<"appointments"> };
  returns: string[];
};
