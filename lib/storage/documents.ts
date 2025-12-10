import { z } from 'zod';
import { BaseStorage } from './base';
import {
  type Document,
  type UploadDocumentInput,
  documentSchema,
} from '../schemas/document';

// Storage instance
const documentsStorage = new BaseStorage(
  'health-log:documents',
  z.array(documentSchema),
  'Document'
);

/**
 * Document CRUD operations
 */
export const documentService = {
  getAll(): Document[] {
    return documentsStorage.getAll();
  },

  getById(id: string): Document | null {
    return documentsStorage.getById(id);
  },

  upload(input: UploadDocumentInput): Document {
    const document: Document = {
      id: crypto.randomUUID(),
      ...input,
      uploadedAt: new Date().toISOString(),
    };

    return documentsStorage.create(document);
  },

  update(id: string, input: Partial<UploadDocumentInput>): Document {
    return documentsStorage.update(id, input);
  },

  delete(id: string): void {
    documentsStorage.delete(id);
  },

  deleteAll(): void {
    documentsStorage.deleteAll();
  },

  count(): number {
    return documentsStorage.count();
  },
};
