# Research: Technology Decisions & Rationale

**Feature**: Healthcare Tracking Application
**Branch**: `001-health-log`
**Date**: 2025-12-09

## Technology Stack Decisions

### 1. Next.js 16 with App Router

**Decision**: Use Next.js 16 App Router architecture for the application framework.

**Rationale**:
- **Already in use**: Project is scaffolded with Next.js 16 (verified in package.json)
- **Server Components by default**: Reduces JavaScript bundle size by rendering non-interactive components on server
- **Automatic code splitting**: Each route is automatically split into separate bundles
- **Built-in optimizations**: Image optimization, font optimization (Geist fonts already configured)
- **File-based routing**: Intuitive structure matching application sections (app/medical-history/, app/appointments/, etc.)
- **React 19 support**: Leverages latest React features including improved form handling

**Alternatives Considered**:
- **Create React App**: Deprecated, no longer recommended by React team
- **Vite + React**: Would require additional routing setup, missing Next.js optimizations
- **Pages Router (Next.js)**: Older architecture, App Router is the current standard

### 2. TypeScript Strict Mode

**Decision**: Enable TypeScript strict mode with zero `any` types policy (unless explicitly justified).

**Rationale**:
- **Constitution requirement**: Principle I (Code Quality First) mandates TypeScript strict mode
- **Type safety**: Catches errors at compile-time, especially critical for health data validation
- **IDE support**: Better autocomplete and inline documentation
- **Refactoring confidence**: Type system ensures changes don't break contracts
- **Already configured**: tsconfig.json in project root has strict mode enabled

**Implementation**:
```json
// tsconfig.json (already configured)
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}
```

### 3. Tailwind CSS 4 + shadcn/ui

**Decision**: Use Tailwind CSS 4 for styling with shadcn/ui component library.

**Rationale**:
- **Already in use**: Tailwind CSS 4 configured with PostCSS plugin (verified in package.json, tailwind.config.ts)
- **Utility-first**: Rapid development without context switching to CSS files
- **Design tokens**: Theme variables in globals.css ensure consistency (--background, --foreground, --font-*)
- **Dark mode**: Built-in dark mode support via `prefers-color-scheme` media queries
- **shadcn/ui benefits**:
  - WCAG 2.1 AA compliant components (meets Constitution Principle III)
  - Built on Radix UI primitives (accessible by default)
  - Copy-paste components (no runtime dependency bloat)
  - Customizable via Tailwind theme
  - Form components integrate seamlessly with React Hook Form

**Alternatives Considered**:
- **Material-UI / MUI**: Heavier bundle size, opinionated design, harder to customize
- **Chakra UI**: Good accessibility but larger runtime, not as performant
- **Headless UI**: Similar to Radix but shadcn/ui provides pre-styled components

**Installation Required**:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card form input label dialog select textarea
```

### 4. Zod for Schema Validation

**Decision**: Use Zod for runtime schema validation and TypeScript type inference.

**Rationale**:
- **Constitution requirement**: Principle V (Data Integrity & Security) requires client-side AND server-side validation
- **Type inference**: Single source of truth - Zod schema generates TypeScript types automatically
- **Runtime safety**: Validates data at runtime (critical for localStorage where data could be corrupted)
- **React Hook Form integration**: First-class integration via `@hookform/resolvers/zod`
- **Clear error messages**: User-friendly validation errors for form feedback
- **File validation**: Can validate file types, sizes for document uploads

**Example Pattern**:
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

**Alternatives Considered**:
- **Yup**: Similar features but Zod has better TypeScript integration
- **Joi**: Primarily server-side, not designed for browser use
- **Manual validation**: Error-prone, no type safety

**Installation Required**:
```bash
yarn add zod @hookform/resolvers
```

### 5. localStorage for Data Persistence

**Decision**: Use browser localStorage for data persistence in this iteration.

**Rationale**:
- **Spec requirement**: "All data is private and stored locally in the browser for this iteration"
- **Zero infrastructure**: No backend required, simplifies MVP development
- **Synchronous API**: Simpler code (no async/await for basic CRUD operations)
- **Good capacity**: 5-10MB limit sufficient for medical history text data and moderate document storage
- **Privacy**: Data never leaves user's device (important for health information)
- **Future migration path**: localStorage service layer can be swapped for Supabase later without changing component code

**Implementation Strategy**:
- Abstract localStorage behind service interfaces (see contracts/storage-service.ts)
- Store each entity type separately (`health-log:conditions`, `health-log:medications`, etc.)
- Store documents as base64-encoded strings
- Implement proper error handling (quota exceeded, storage unavailable)
- Provide clear warnings about data loss on browser data clear (FR-016)

**Limitations & Mitigations**:
- **Quota limits**: Enforce 10MB per-file limit (FR-011), show clear errors when quota exceeded
- **No sync**: Accept limitation for MVP, document assumption in spec.md
- **Browser-specific**: Data tied to specific browser/device, warn users clearly
- **No encryption**: Accept for MVP since data is local-only, can add encryption layer later

**Alternatives Considered**:
- **IndexedDB**: More complex API, overkill for structured data, better for large binary files
- **Supabase**: Planned for future iteration, adds complexity and backend dependency
- **Firebase**: Similar to Supabase, unnecessary for local-only MVP

### 6. Jest + React Testing Library + Playwright

**Decision**: Use Jest with React Testing Library for component/unit tests, Playwright for E2E tests.

**Rationale**:
- **Constitution requirement**: Principle II (Testing Standards NON-NEGOTIABLE) requires coverage thresholds and test types
- **Next.js recommended**: Jest is official Next.js testing framework
- **React Testing Library**: Encourages accessible component testing (query by label, role, text)
- **Playwright benefits**: Cross-browser E2E testing, auto-wait, better debugging than Cypress
- **Coverage tracking**: Jest built-in coverage reports ensure thresholds are met

**Test Strategy**:
- **Component tests**: All interactive components (forms, lists) using RTL
- **Integration tests**: User journeys matching spec.md acceptance scenarios
- **E2E tests**: Critical paths (add condition → view in dashboard → persist across reload)
- **Coverage targets**: 80% utilities, 90% business logic, 100% validation

**Installation Required**:
```bash
yarn add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
yarn add -D @playwright/test
```

**Configuration Required**:
- `jest.config.js`: Next.js preset, coverage thresholds, setup files
- `playwright.config.ts`: Browser targets, base URL, test directory

### 7. React Hook Form

**Decision**: Use React Hook Form for form state management and validation.

**Rationale**:
- **Performance**: Uncontrolled inputs reduce re-renders (important for 60 FPS requirement)
- **Zod integration**: First-class resolver support for Zod schemas
- **Accessibility**: Built-in ARIA attributes and error handling
- **Developer experience**: Simple API, less boilerplate than controlled forms
- **Validation**: Client-side validation with clear error messages (FR-021, FR-022)

**Installation Required**:
```bash
yarn add react-hook-form @hookform/resolvers
```

### 8. Document Storage Strategy: Base64 Encoding

**Decision**: Store uploaded documents as base64-encoded strings in localStorage.

**Rationale**:
- **localStorage compatibility**: localStorage only supports strings, not blobs
- **Simplicity**: No IndexedDB complexity for MVP
- **File API support**: Modern browsers can convert File → base64 → File for viewing
- **Size overhead**: ~33% increase acceptable given 10MB per-file limit
- **Future migration**: When moving to Supabase, can switch to blob storage without changing component API

**Implementation Pattern**:
```typescript
// Upload: File → base64 string → localStorage
const base64 = await fileToBase64(file);
localStorage.setItem(`health-log:documents`, JSON.stringify([...docs, { id, name, base64, ... }]));

// View: localStorage → base64 string → blob URL → <iframe> or download
const blob = base64ToBlob(document.base64, document.mimeType);
const url = URL.createObjectURL(blob);
```

**Limitations**:
- **Size overhead**: 1MB file becomes ~1.33MB in base64 (acceptable for 10MB limit)
- **Performance**: Large files take longer to encode/decode (mitigated by 10MB limit)

**Alternatives Considered**:
- **IndexedDB**: More complex API, unnecessary for structured data + moderate files
- **External storage**: Requires backend, against spec requirement for local-only MVP

### 9. Custom Hooks for State Management

**Decision**: Create custom hooks (use-conditions.ts, use-medications.ts, etc.) for each entity type instead of global state library.

**Rationale**:
- **Simplicity**: No Redux/Zustand overhead for simple CRUD operations
- **React 19 patterns**: Leverage built-in hooks (useState, useEffect) with modern patterns
- **Encapsulation**: Each hook encapsulates localStorage logic, making components pure
- **Testability**: Hooks can be tested independently from components
- **Performance**: No unnecessary re-renders across unrelated components

**Pattern**:
```typescript
export function useConditions() {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = loadConditions();
    setConditions(stored);
    setLoading(false);
  }, []);

  const addCondition = (data: CreateConditionInput) => {
    const newCondition = { id: uuid(), ...data, createdAt: now(), updatedAt: now() };
    const updated = [...conditions, newCondition];
    saveConditions(updated);
    setConditions(updated);
  };

  // ... edit, delete methods

  return { conditions, loading, addCondition, editCondition, deleteCondition };
}
```

**Alternatives Considered**:
- **Redux Toolkit**: Overkill for simple CRUD, adds bundle size and complexity
- **Zustand**: Lightweight but unnecessary for non-shared state
- **Context API**: Could cause unnecessary re-renders, custom hooks more performant

## Open Questions & Risks

### Open Questions

1. **Document preview**: Should PDFs open in new tab or embedded viewer? (Recommendation: new tab for simplicity)
2. **Mobile upload**: How to handle camera vs file picker on mobile? (Recommendation: use `<input accept="image/*,application/pdf" capture="environment">` for mobile camera support)
3. **Date pickers**: Use native `<input type="date">` or custom component? (Recommendation: native for simplicity, shadcn/ui date picker if UX testing shows issues)

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| localStorage quota exceeded | Medium | High | Enforce 10MB per-file limit, show clear errors, provide export functionality before quota reached |
| Large document performance | Low | Medium | 10MB limit prevents extreme cases, show loading indicator during encode/decode |
| Browser compatibility | Low | High | Polyfill checks in place, show warning for unsupported browsers (< Chrome 60, Firefox 55, Safari 11, Edge 79) |
| Data loss on browser clear | High | High | Prominent warnings in UI (FR-016), consider future export/backup feature |

## References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Zod Documentation](https://zod.dev)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
