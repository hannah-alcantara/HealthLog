import { z } from 'zod';

/**
 * Document Schema
 * Represents an uploaded medical document (PDF, JPG, PNG) with metadata
 */

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const documentSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1).max(255),
  mimeType: z.enum(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']),
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES, 'File size must not exceed 10MB'),
  base64Content: z.string().min(1),
  uploadedAt: z.string().datetime(),
  description: z.string().max(500).nullable(),
});

export const uploadDocumentSchema = documentSchema.omit({
  id: true,
  uploadedAt: true,
});

export type Document = z.infer<typeof documentSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;

export const MAX_FILE_SIZE = MAX_FILE_SIZE_BYTES;
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'] as const;
