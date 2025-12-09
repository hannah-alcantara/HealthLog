# Quickstart: Healthcare Tracking Application

**Feature**: Healthcare Tracking Application
**Branch**: `001-health-log`
**Date**: 2025-12-09

## Prerequisites

- Node.js 20+ installed
- Yarn package manager
- Modern browser for testing (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+)

## Installation

### 1. Install Dependencies

Install required packages for the feature:

```bash
# Zod for schema validation
yarn add zod

# React Hook Form for form management
yarn add react-hook-form @hookform/resolvers

# shadcn/ui components
npx shadcn-ui@latest init

# Install required shadcn/ui components
npx shadcn-ui@latest add button card form input label dialog select textarea
```

### 2. Install Testing Dependencies

```bash
# Jest and React Testing Library
yarn add -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Playwright for E2E tests
yarn add -D @playwright/test
```

### 3. Configure Jest

Create `jest.config.js` in the project root:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './lib/schemas/**': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    './lib/storage/**': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
```

Create `jest.setup.js` in the project root:

```javascript
import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: () => '00000000-0000-0000-0000-000000000000',
}
```

### 4. Configure Playwright

Create `playwright.config.ts` in the project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'yarn dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 5. Update package.json Scripts

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Implementation Phases

Follow these phases in order for organized development:

### Phase 0: Project Setup
1. Install dependencies (see above)
2. Configure testing tools (see above)
3. Create directory structure:
   ```bash
   mkdir -p lib/schemas lib/storage lib/hooks lib/utils
   mkdir -p components/ui components/medical-history components/appointments components/documents components/dashboard
   mkdir -p __tests__/components __tests__/lib __tests__/integration __tests__/e2e
   ```

### Phase 1: Data Layer (Test-First)
**Goal**: Implement data models, Zod schemas, and storage services

**Directory**: `lib/schemas/`, `lib/storage/`

**Order**:
1. **Schemas First** (`lib/schemas/`)
   - Create `condition.ts` with Zod schema + TypeScript types
   - Create `medication.ts`, `allergy.ts`, `appointment.ts`, `document.ts`
   - Write unit tests for each schema (validation rules)

2. **Storage Services** (`lib/storage/`)
   - Create `lib/utils/storage.ts` (generic localStorage utilities)
   - Create `conditions.ts` with CRUD operations
   - Write unit tests for condition storage (create, read, update, delete, error handling)
   - Repeat for `medications.ts`, `allergies.ts`, `appointments.ts`, `documents.ts`

**Testing**: After Phase 1, run `yarn test` - expect 100% coverage for schemas, 90%+ for storage services

### Phase 2: Custom Hooks
**Goal**: Create React hooks for state management

**Directory**: `lib/hooks/`

**Order**:
1. Create `use-conditions.ts` with `useConditions` hook
2. Write unit tests for `useConditions` (create, update, delete, error states)
3. Repeat for `use-medications.ts`, `use-allergies.ts`, `use-appointments.ts`, `use-documents.ts`

**Testing**: After Phase 2, run `yarn test` - expect 90%+ coverage for hooks

### Phase 3: UI Components (shadcn/ui)
**Goal**: Install and configure UI primitives

**Order**:
1. Run `npx shadcn-ui@latest init` (if not done in installation)
2. Install components: `button`, `card`, `form`, `input`, `label`, `dialog`, `select`, `textarea`
3. Verify components work by creating a test page

**Testing**: Manual verification in browser

### Phase 4: Medical History Section (User Story 1 - P1)
**Goal**: Implement medical history CRUD (conditions, medications, allergies)

**Directory**: `app/medical-history/`, `components/medical-history/`

**Order**:
1. **Forms** (with tests):
   - Create `components/medical-history/condition-form.tsx`
   - Create `components/medical-history/medication-form.tsx`
   - Create `components/medical-history/allergy-form.tsx`
   - Write component tests for each form (validation, submission, error handling)

2. **List Views** (with tests):
   - Create `components/medical-history/medical-history-list.tsx`
   - Write component tests (display, edit, delete actions)

3. **Page** (with integration tests):
   - Create `app/medical-history/page.tsx`
   - Write integration tests matching spec.md acceptance scenarios (AS-1 through AS-5)

**Testing**:
- Component tests: `yarn test components/medical-history`
- Integration tests: `yarn test integration/medical-history`

### Phase 5: Appointments Section (User Story 2 - P2)
**Goal**: Implement appointment history tracking

**Directory**: `app/appointments/`, `components/appointments/`

**Order**:
1. Create `components/appointments/appointment-form.tsx` with tests
2. Create `components/appointments/appointments-list.tsx` with tests (chronological sorting)
3. Create `app/appointments/page.tsx` with integration tests (AS-6 through AS-10)

**Testing**: Same as Phase 4

### Phase 6: Dashboard (User Story 4 - P4)
**Goal**: Create overview dashboard with recent activity and stats

**Directory**: `app/page.tsx` (root), `components/dashboard/`

**Order**:
1. Create `lib/hooks/use-dashboard.ts` (aggregate data from all sections) with tests
2. Create `components/dashboard/stats-summary.tsx` with tests
3. Create `components/dashboard/recent-activity.tsx` with tests
4. Update `app/page.tsx` to show dashboard with integration tests (AS-14 through AS-17)

**Testing**: Integration tests for dashboard data aggregation

### Phase 7: Documents Section (User Story 3 - P3)
**Goal**: Implement document upload/view/delete

**Directory**: `app/documents/`, `components/documents/`

**Order**:
1. Create `lib/utils/file-utils.ts` (file validation, base64 conversion) with tests
2. Create `components/documents/document-upload.tsx` with tests (file validation, size limits)
3. Create `components/documents/documents-list.tsx` with tests
4. Create `app/documents/page.tsx` with integration tests (AS-11 through AS-13)

**Testing**: Include tests for 10MB limit, MIME type validation, base64 encoding/decoding

### Phase 8: Navigation & Layout
**Goal**: Add navigation between sections

**Directory**: `app/layout.tsx`, `components/`

**Order**:
1. Create navigation component (header or sidebar)
2. Update `app/layout.tsx` to include navigation
3. Ensure routing works between all sections

**Testing**: Manual navigation testing, E2E test for navigation flow

### Phase 9: E2E Tests
**Goal**: Implement critical path E2E tests

**Directory**: `__tests__/e2e/`

**Order**:
1. Create `critical-paths.spec.ts`:
   - Test: Add condition → view on dashboard → verify persistence after reload
   - Test: Add appointment → sort chronologically → edit appointment
   - Test: Upload document → view document → delete document
2. Create `data-persistence.spec.ts`:
   - Test: Add entries in all sections → reload page → verify all data persists

**Testing**: `yarn test:e2e`

### Phase 10: Polish & Performance
**Goal**: Meet performance budgets and accessibility standards

**Order**:
1. Run Lighthouse audit: `yarn build && yarn start` → open DevTools → Lighthouse
2. Verify Core Web Vitals (FCP < 1.8s, LCP < 2.5s, TTI < 3.5s, CLS < 0.1)
3. Check bundle sizes: `yarn build` → review `.next/build-manifest.json`
4. Test mobile viewport (375px minimum)
5. Test dark mode
6. Run accessibility audit (WCAG 2.1 AA compliance)

**Testing**: Lighthouse scores (Performance ≥ 90, Accessibility = 100, Best Practices ≥ 90)

## Development Workflow

### Starting Development
```bash
# Start dev server
yarn dev

# In another terminal, run tests in watch mode
yarn test:watch
```

### Running Tests
```bash
# Unit and component tests
yarn test

# With coverage report
yarn test:coverage

# E2E tests (starts dev server automatically)
yarn test:e2e

# E2E tests with UI (interactive mode)
yarn test:e2e:ui
```

### Pre-Commit Checklist
- [ ] All tests passing: `yarn test`
- [ ] Coverage thresholds met: `yarn test:coverage`
- [ ] ESLint passing: `yarn lint`
- [ ] TypeScript compiling: `yarn build`
- [ ] E2E tests passing: `yarn test:e2e`

### Pre-PR Checklist
- [ ] All quality gates passed (see constitution.md)
- [ ] Lighthouse audit passed (Performance ≥ 90, Accessibility = 100)
- [ ] Mobile viewport tested (375px minimum)
- [ ] Dark mode tested
- [ ] Documentation updated (inline JSDoc for complex functions)

## Troubleshooting

### localStorage Not Available
If localStorage is unavailable (private browsing, browser settings), the app should show a clear error message. Implement this check in `lib/utils/storage.ts`:

```typescript
export function checkStorageAvailable(): boolean {
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

Display error in `app/layout.tsx` if storage is unavailable.

### Quota Exceeded Errors
If users hit the localStorage quota (typically 5-10MB), catch `QuotaExceededError` and show a clear message with options:
- Delete old documents
- Export data to JSON
- Clear all data (with confirmation)

### Test Failures
Common issues:
- **localStorage mocks**: Ensure `jest.setup.js` properly mocks localStorage
- **Async state updates**: Use `waitFor` from `@testing-library/react` for async state changes
- **UUID generation**: Mock `crypto.randomUUID()` for deterministic tests

### Performance Issues
If performance budgets are not met:
- Check bundle size: `yarn build` → review chunks in `.next/`
- Use dynamic imports for heavy components (e.g., document viewer)
- Optimize images with Next.js `Image` component
- Use Server Components for non-interactive parts

## Next Steps After Implementation

Once implementation is complete:
1. Run `/speckit.analyze` to validate consistency across spec.md, plan.md, tasks.md
2. Create pull request with Lighthouse scores and coverage reports
3. Plan migration to Supabase for multi-device sync (future iteration)

## Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Zod Documentation](https://zod.dev)
- [React Hook Form Documentation](https://react-hook-form.com)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)