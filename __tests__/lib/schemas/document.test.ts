import {
  documentSchema,
  uploadDocumentSchema,
  MAX_FILE_SIZE,
  ALLOWED_MIME_TYPES,
  type Document,
  type UploadDocumentInput,
} from '@/lib/schemas/document';

describe('Document Schema', () => {
  const validDocument: Document = {
    id: 'e5f6a7b8-c9d0-4234-abcd-ef0123456789',
    filename: 'blood-test-results.pdf',
    mimeType: 'application/pdf',
    sizeBytes: 256000,
    base64Content: 'JVBERi0xLjQKJeLjz9MK...',
    uploadedAt: '2025-01-10T14:30:00.000Z',
    description: 'Blood test results from annual checkup',
  };

  describe('constants', () => {
    it('should export MAX_FILE_SIZE as 10MB', () => {
      expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024);
    });

    it('should export ALLOWED_MIME_TYPES array', () => {
      expect(ALLOWED_MIME_TYPES).toEqual([
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
      ]);
    });
  });

  describe('documentSchema', () => {
    it('should validate a complete document object', () => {
      expect(() => documentSchema.parse(validDocument)).not.toThrow();
    });

    it('should validate document with null description', () => {
      const document = { ...validDocument, description: null };
      expect(() => documentSchema.parse(document)).not.toThrow();
    });

    it('should validate document with PDF mime type', () => {
      const document = { ...validDocument, mimeType: 'application/pdf' };
      expect(() => documentSchema.parse(document)).not.toThrow();
    });

    it('should validate document with JPEG mime type', () => {
      const document = { ...validDocument, mimeType: 'image/jpeg' };
      expect(() => documentSchema.parse(document)).not.toThrow();
    });

    it('should validate document with JPG mime type', () => {
      const document = { ...validDocument, mimeType: 'image/jpg' };
      expect(() => documentSchema.parse(document)).not.toThrow();
    });

    it('should validate document with PNG mime type', () => {
      const document = { ...validDocument, mimeType: 'image/png' };
      expect(() => documentSchema.parse(document)).not.toThrow();
    });

    it('should validate document at max file size (10MB)', () => {
      const document = { ...validDocument, sizeBytes: MAX_FILE_SIZE };
      expect(() => documentSchema.parse(document)).not.toThrow();
    });

    it('should validate document with long description (within limit)', () => {
      const document = { ...validDocument, description: 'a'.repeat(500) };
      expect(() => documentSchema.parse(document)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const document = { ...validDocument, id: 'not-a-uuid' };
      expect(() => documentSchema.parse(document)).toThrow();
    });

    it('should reject empty filename', () => {
      const document = { ...validDocument, filename: '' };
      expect(() => documentSchema.parse(document)).toThrow();
    });

    it('should reject filename exceeding 255 characters', () => {
      const document = { ...validDocument, filename: 'a'.repeat(256) };
      expect(() => documentSchema.parse(document)).toThrow();
    });

    it('should reject invalid mime type', () => {
      const document = { ...validDocument, mimeType: 'text/plain' as unknown as 'application/pdf' };
      expect(() => documentSchema.parse(document)).toThrow();
    });

    it('should reject zero sizeBytes', () => {
      const document = { ...validDocument, sizeBytes: 0 };
      expect(() => documentSchema.parse(document)).toThrow();
    });

    it('should reject negative sizeBytes', () => {
      const document = { ...validDocument, sizeBytes: -100 };
      expect(() => documentSchema.parse(document)).toThrow();
    });

    it('should reject sizeBytes exceeding 10MB', () => {
      const document = { ...validDocument, sizeBytes: MAX_FILE_SIZE + 1 };
      expect(() => documentSchema.parse(document)).toThrow('File size must not exceed 10MB');
    });

    it('should reject non-integer sizeBytes', () => {
      const document = { ...validDocument, sizeBytes: 123.45 };
      expect(() => documentSchema.parse(document)).toThrow();
    });

    it('should reject empty base64Content', () => {
      const document = { ...validDocument, base64Content: '' };
      expect(() => documentSchema.parse(document)).toThrow();
    });

    it('should reject description exceeding 500 characters', () => {
      const document = { ...validDocument, description: 'a'.repeat(501) };
      expect(() => documentSchema.parse(document)).toThrow();
    });

    it('should reject invalid uploadedAt format', () => {
      const document = { ...validDocument, uploadedAt: '2025-01-10' };
      expect(() => documentSchema.parse(document)).toThrow();
    });

    it('should reject missing required fields', () => {
      const document = { filename: 'test.pdf' };
      expect(() => documentSchema.parse(document)).toThrow();
    });
  });

  describe('uploadDocumentSchema', () => {
    const validInput: UploadDocumentInput = {
      filename: 'x-ray-scan.jpg',
      mimeType: 'image/jpeg',
      sizeBytes: 512000,
      base64Content: 'iVBORw0KGgoAAAANSUhEUgAA...',
      description: 'Chest X-ray from hospital visit',
    };

    it('should validate valid upload input', () => {
      expect(() => uploadDocumentSchema.parse(validInput)).not.toThrow();
    });

    it('should validate input with null description', () => {
      const input = { ...validInput, description: null };
      expect(() => uploadDocumentSchema.parse(input)).not.toThrow();
    });

    it('should validate input with all allowed mime types', () => {
      const pdf = { ...validInput, mimeType: 'application/pdf' as const };
      const jpeg = { ...validInput, mimeType: 'image/jpeg' as const };
      const jpg = { ...validInput, mimeType: 'image/jpg' as const };
      const png = { ...validInput, mimeType: 'image/png' as const };

      expect(() => uploadDocumentSchema.parse(pdf)).not.toThrow();
      expect(() => uploadDocumentSchema.parse(jpeg)).not.toThrow();
      expect(() => uploadDocumentSchema.parse(jpg)).not.toThrow();
      expect(() => uploadDocumentSchema.parse(png)).not.toThrow();
    });

    it('should reject input with id field', () => {
      const input = { ...validInput, id: 'some-uuid' };
      const result = uploadDocumentSchema.parse(input);
      expect(result).not.toHaveProperty('id');
    });

    it('should reject input with uploadedAt field', () => {
      const input = { ...validInput, uploadedAt: '2025-01-10T14:30:00.000Z' };
      const result = uploadDocumentSchema.parse(input);
      expect(result).not.toHaveProperty('uploadedAt');
    });

    it('should reject empty filename', () => {
      const input = { ...validInput, filename: '' };
      expect(() => uploadDocumentSchema.parse(input)).toThrow();
    });

    it('should reject invalid mime type', () => {
      const input = { ...validInput, mimeType: 'application/msword' as unknown as 'application/pdf' };
      expect(() => uploadDocumentSchema.parse(input)).toThrow();
    });

    it('should reject sizeBytes exceeding 10MB', () => {
      const input = { ...validInput, sizeBytes: MAX_FILE_SIZE + 1 };
      expect(() => uploadDocumentSchema.parse(input)).toThrow();
    });

    it('should reject empty base64Content', () => {
      const input = { ...validInput, base64Content: '' };
      expect(() => uploadDocumentSchema.parse(input)).toThrow();
    });

    it('should validate maximum allowed file size', () => {
      const input = { ...validInput, sizeBytes: MAX_FILE_SIZE };
      expect(() => uploadDocumentSchema.parse(input)).not.toThrow();
    });

    it('should validate maximum description length', () => {
      const input = { ...validInput, description: 'a'.repeat(500) };
      expect(() => uploadDocumentSchema.parse(input)).not.toThrow();
    });
  });
});
