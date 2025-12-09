# Data Model: Healthcare Tracking Application

**Feature**: Healthcare Tracking Application
**Branch**: `001-health-log`
**Date**: 2025-12-09

## Overview

This document defines the data entities, TypeScript interfaces, Zod validation schemas, and localStorage storage structure for the healthcare tracking application.

## Entity Definitions

### 1. Condition

Represents a diagnosed health condition with name, optional diagnosis date, and optional notes.

**TypeScript Interface**:
```typescript
export interface Condition {
  id: string;                    // UUID v4
  name: string;                  // Condition name (1-200 characters)
  diagnosisDate: string | null;  // ISO 8601 datetime or null
  notes: string | null;          // Optional notes (max 1000 characters)
  createdAt: string;             // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
}
```

**Zod Schema**:
```typescript
import { z } from 'zod';

export const conditionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Condition name is required').max(200).trim(),
  diagnosisDate: z.string().datetime().nullable(),
  notes: z.string().max(1000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Condition = z.infer<typeof conditionSchema>;
```

**Create Input Schema** (for forms):
```typescript
export const createConditionSchema = conditionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CreateConditionInput = z.infer<typeof createConditionSchema>;
```

**Validation Rules**:
- `id`: Must be valid UUID v4
- `name`: Required, 1-200 characters, trimmed
- `diagnosisDate`: Optional, must be valid ISO 8601 datetime if provided
- `notes`: Optional, max 1000 characters
- `createdAt`, `updatedAt`: Auto-generated, valid ISO 8601 datetime

---

### 2. Medication

Represents a prescription or over-the-counter drug with name, dosage, frequency, and optional start date.

**TypeScript Interface**:
```typescript
export interface Medication {
  id: string;                    // UUID v4
  name: string;                  // Medication name (1-200 characters)
  dosage: string;                // Dosage (e.g., "10mg", "2 tablets")
  frequency: string;             // Frequency (e.g., "Twice daily", "As needed")
  startDate: string | null;      // ISO 8601 datetime or null
  notes: string | null;          // Optional notes (max 1000 characters)
  createdAt: string;             // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
}
```

**Zod Schema**:
```typescript
export const medicationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Medication name is required').max(200).trim(),
  dosage: z.string().min(1, 'Dosage is required').max(100).trim(),
  frequency: z.string().min(1, 'Frequency is required').max(100).trim(),
  startDate: z.string().datetime().nullable(),
  notes: z.string().max(1000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Medication = z.infer<typeof medicationSchema>;
```

**Create Input Schema**:
```typescript
export const createMedicationSchema = medicationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
```

**Validation Rules**:
- `id`: Must be valid UUID v4
- `name`: Required, 1-200 characters, trimmed
- `dosage`: Required, 1-100 characters, trimmed
- `frequency`: Required, 1-100 characters, trimmed
- `startDate`: Optional, must be valid ISO 8601 datetime if provided
- `notes`: Optional, max 1000 characters

---

### 3. Allergy

Represents a known allergen with name, optional severity level, and optional reaction description.

**TypeScript Interface**:
```typescript
export type AllergySeverity = 'mild' | 'moderate' | 'severe';

export interface Allergy {
  id: string;                       // UUID v4
  allergen: string;                 // Allergen name (1-200 characters)
  severity: AllergySeverity | null; // Severity level or null
  reaction: string | null;          // Reaction description (max 500 characters)
  createdAt: string;                // ISO 8601 datetime
  updatedAt: string;                // ISO 8601 datetime
}
```

**Zod Schema**:
```typescript
export const allergySeveritySchema = z.enum(['mild', 'moderate', 'severe']);

export const allergySchema = z.object({
  id: z.string().uuid(),
  allergen: z.string().min(1, 'Allergen name is required').max(200).trim(),
  severity: allergySeveritySchema.nullable(),
  reaction: z.string().max(500).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Allergy = z.infer<typeof allergySchema>;
```

**Create Input Schema**:
```typescript
export const createAllergySchema = allergySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CreateAllergyInput = z.infer<typeof createAllergySchema>;
```

**Validation Rules**:
- `id`: Must be valid UUID v4
- `allergen`: Required, 1-200 characters, trimmed
- `severity`: Optional, must be one of 'mild', 'moderate', 'severe' if provided
- `reaction`: Optional, max 500 characters
- `createdAt`, `updatedAt`: Auto-generated, valid ISO 8601 datetime

---

### 4. Appointment

Represents a past medical visit with date, doctor name, reason for visit, and notes.

**TypeScript Interface**:
```typescript
export interface Appointment {
  id: string;                    // UUID v4
  appointmentDate: string;       // ISO 8601 datetime
  doctorName: string;            // Doctor's name (1-200 characters)
  reason: string;                // Reason for visit (1-500 characters)
  notes: string | null;          // Doctor notes (max 2000 characters)
  createdAt: string;             // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
}
```

**Zod Schema**:
```typescript
export const appointmentSchema = z.object({
  id: z.string().uuid(),
  appointmentDate: z.string().datetime(),
  doctorName: z.string().min(1, 'Doctor name is required').max(200).trim(),
  reason: z.string().min(1, 'Reason for visit is required').max(500).trim(),
  notes: z.string().max(2000).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Appointment = z.infer<typeof appointmentSchema>;
```

**Create Input Schema**:
```typescript
export const createAppointmentSchema = appointmentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
```

**Validation Rules**:
- `id`: Must be valid UUID v4
- `appointmentDate`: Required, valid ISO 8601 datetime
- `doctorName`: Required, 1-200 characters, trimmed
- `reason`: Required, 1-500 characters, trimmed
- `notes`: Optional, max 2000 characters
- `createdAt`, `updatedAt`: Auto-generated, valid ISO 8601 datetime

---

### 5. Document

Represents an uploaded medical file with filename, file type, upload date, and file content.

**TypeScript Interface**:
```typescript
export interface Document {
  id: string;                    // UUID v4
  filename: string;              // Original filename
  mimeType: string;              // MIME type (e.g., "application/pdf", "image/jpeg")
  sizeBytes: number;             // File size in bytes
  base64Content: string;         // File content as base64-encoded string
  uploadedAt: string;            // ISO 8601 datetime
  description: string | null;    // Optional description (max 500 characters)
}
```

**Zod Schema**:
```typescript
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export const documentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1).max(255),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']),
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES, 'File size must not exceed 10MB'),
  base64Content: z.string().min(1),
  uploadedAt: z.string().datetime(),
  description: z.string().max(500).nullable(),
});

export type Document = z.infer<typeof documentSchema>;
```

**Upload Input Schema**:
```typescript
export const uploadDocumentSchema = documentSchema.omit({
  id: true,
  uploadedAt: true
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
```

**Validation Rules**:
- `id`: Must be valid UUID v4
- `filename`: Required, 1-255 characters
- `mimeType`: Must be one of: `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`
- `sizeBytes`: Must be positive integer, max 10MB (10,485,760 bytes)
- `base64Content`: Required, non-empty base64-encoded string
- `uploadedAt`: Auto-generated, valid ISO 8601 datetime
- `description`: Optional, max 500 characters

**File Upload Validation** (pre-schema):
```typescript
// Validate before conversion to base64
function validateFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only PDF, JPG, and PNG files are allowed' };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'File size must not exceed 10MB' };
  }
  return { valid: true };
}
```

---

## localStorage Storage Structure

### Storage Keys

All data is stored in browser localStorage using namespaced keys:

- `health-log:conditions` → JSON array of Condition objects
- `health-log:medications` → JSON array of Medication objects
- `health-log:allergies` → JSON array of Allergy objects
- `health-log:appointments` → JSON array of Appointment objects
- `health-log:documents` → JSON array of Document objects

### Storage Format

Each key stores a JSON-stringified array of objects:

```typescript
// Example: localStorage.getItem('health-log:conditions')
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Type 2 Diabetes",
    "diagnosisDate": "2020-03-15T00:00:00.000Z",
    "notes": "Managing with metformin and diet",
    "createdAt": "2025-01-10T14:30:00.000Z",
    "updatedAt": "2025-01-10T14:30:00.000Z"
  },
  {
    "id": "b2c3d4e5-f6g7-8901-bcde-f12345678901",
    "name": "Hypertension",
    "diagnosisDate": null,
    "notes": null,
    "createdAt": "2025-01-11T09:15:00.000Z",
    "updatedAt": "2025-01-11T09:15:00.000Z"
  }
]
```

### Storage Operations

**Create**:
```typescript
function createCondition(input: CreateConditionInput): Condition {
  const conditions = loadConditions(); // Parse from localStorage
  const newCondition: Condition = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Validate with Zod
  const validated = conditionSchema.parse(newCondition);

  conditions.push(validated);
  saveConditions(conditions); // Stringify and save to localStorage

  return validated;
}
```

**Read**:
```typescript
function loadConditions(): Condition[] {
  const stored = localStorage.getItem('health-log:conditions');
  if (!stored) return [];

  const parsed = JSON.parse(stored);

  // Validate array with Zod
  return z.array(conditionSchema).parse(parsed);
}
```

**Update**:
```typescript
function updateCondition(id: string, updates: Partial<CreateConditionInput>): Condition {
  const conditions = loadConditions();
  const index = conditions.findIndex(c => c.id === id);

  if (index === -1) throw new Error('Condition not found');

  const updated: Condition = {
    ...conditions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Validate with Zod
  const validated = conditionSchema.parse(updated);

  conditions[index] = validated;
  saveConditions(conditions);

  return validated;
}
```

**Delete**:
```typescript
function deleteCondition(id: string): void {
  const conditions = loadConditions();
  const filtered = conditions.filter(c => c.id !== id);

  if (filtered.length === conditions.length) {
    throw new Error('Condition not found');
  }

  saveConditions(filtered);
}
```

### Error Handling

**Quota Exceeded**:
```typescript
function saveConditions(conditions: Condition[]): void {
  try {
    const json = JSON.stringify(conditions);
    localStorage.setItem('health-log:conditions', json);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please delete some entries or documents.');
    }
    throw error;
  }
}
```

**Storage Unavailable**:
```typescript
function checkStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
```

**Corrupted Data**:
```typescript
function loadConditions(): Condition[] {
  try {
    const stored = localStorage.getItem('health-log:conditions');
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return z.array(conditionSchema).parse(parsed);
  } catch (error) {
    console.error('Failed to load conditions, resetting:', error);
    localStorage.removeItem('health-log:conditions');
    return [];
  }
}
```

---

## Relationships & Constraints

### No Foreign Keys
Since this is a localStorage-based MVP, there are no enforced foreign key relationships between entities. Each entity is stored independently.

### Future Considerations
When migrating to Supabase:
- Add foreign keys (e.g., `Appointment.conditionId → Condition.id`)
- Add indexes on frequently queried fields (e.g., `appointmentDate`, `createdAt`)
- Implement server-side validation matching Zod schemas
- Add row-level security policies for multi-user support

---

## Size Estimates

**Per Entity Storage**:
- Condition: ~200 bytes (avg)
- Medication: ~250 bytes (avg)
- Allergy: ~150 bytes (avg)
- Appointment: ~400 bytes (avg)
- Document (metadata only): ~100 bytes + base64 content (~1.33x file size)

**Typical Dataset** (100 entries per section):
- 100 conditions: ~20KB
- 100 medications: ~25KB
- 100 allergies: ~15KB
- 100 appointments: ~40KB
- 10 documents (5MB avg): ~6.65MB

**Total**: ~6.75MB (within 10MB localStorage quota for most browsers)

---

## Schema Files Location

All schemas will be implemented in:
```
lib/schemas/
├── condition.ts      # Condition schema + types
├── medication.ts     # Medication schema + types
├── allergy.ts        # Allergy schema + types
├── appointment.ts    # Appointment schema + types
└── document.ts       # Document schema + types
```

Each file exports:
- Full entity schema (with id, createdAt, updatedAt)
- Create/Upload input schema (without auto-generated fields)
- TypeScript types inferred from schemas