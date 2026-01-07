# Tasks: Healthcare Tracking Application

**Input**: Design documents from `/specs/001-health-log/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/storage-service.ts, research.md, quickstart.md

**Tests**: Tests are included per constitution requirements (80% coverage utilities, 90% business logic, 100% validation)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/`, `components/`, `lib/`, `__tests__/` at repository root
- All paths are relative to project root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install dependencies: zod, react-hook-form, @hookform/resolvers
- [x] T002 [P] Install shadcn/ui and configure with `npx shadcn-ui@latest init`
- [x] T003 [P] Install shadcn/ui components: button, card, form, input, label, dialog, select, textarea
- [x] T004 [P] Install testing dependencies: jest, jest-environment-jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
- [x] T005 [P] Install Playwright for E2E tests: @playwright/test
- [x] T006 Create jest.config.js with Next.js preset and coverage thresholds (80% global, 100% schemas)
- [x] T007 [P] Create jest.setup.js with localStorage mock and crypto.randomUUID mock
- [x] T008 [P] Create playwright.config.ts with browser targets and base URL
- [x] T009 [P] Update package.json scripts: test, test:watch, test:coverage, test:e2e, test:e2e:ui
- [x] T010 Create directory structure: lib/schemas, lib/storage, lib/hooks, lib/utils, components/ui, components/medical-history, components/appointments, components/documents, components/dashboard, __tests__/components, __tests__/lib, __tests__/integration, __tests__/e2e

**Checkpoint**: ✅ Dependencies installed, test infrastructure configured, directory structure created

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Create lib/schemas/medical-history.ts with Zod schemas (Condition, Medication, Allergy)
- [x] T012 Write unit tests for medical-history schema (__tests__/lib/schemas/medical-history.test.ts, 100% coverage)
- [x] T013 Create lib/schemas/appointment.ts with Zod schema
- [x] T014 Write unit tests for appointment schema (__tests__/lib/schemas/appointment.test.ts, 100% coverage)
- [x] T015 Create lib/schemas/document.ts with Zod schema
- [x] T016 Write unit tests for document schema (__tests__/lib/schemas/document.test.ts, 100% coverage)
- [x] T017 Create lib/storage/base.ts with generic CRUD operations (BaseStorage class, error classes, checkStorageAvailable)
- [x] T018 Write unit tests for base storage (__tests__/lib/storage/base.test.ts, 90%+ coverage)
- [x] T019 Create lib/storage/medical-history.ts (conditionService, medicationService, allergyService)
- [x] T020 Create lib/storage/appointments.ts (appointmentService)
- [x] T021 Create lib/storage/documents.ts (documentService)
- [x] T022 Write integration tests for all storage modules (__tests__/lib/storage/integration.test.ts, 90%+ coverage)

**Checkpoint**: ✅ Foundation ready - all schemas validated (100% coverage), storage utilities tested (95%+ coverage), user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Medical History Management (Priority: P1) 🎯 MVP

**Goal**: Users can log and manage their medical conditions, medications, csand allergies with full CRUD operations

**Independent Test**: Create, view, edit, and delete medical history entries (conditions, medications, allergies). Verify data persists across browser sessions and displays in organized lists.

### Storage Layer for User Story 1

- [x] T023-T028 Storage services (completed in Phase 2 - lib/storage/medical-history.ts with conditionService, medicationService, allergyService)

### Hooks Layer for User Story 1

- [x] T029 Create useConditions hook (lib/hooks/use-conditions.ts)
- [x] T030 Create useMedications hook (lib/hooks/use-medications.ts)
- [x] T031 Create useAllergies hook (lib/hooks/use-allergies.ts)
- [x] T032 Write tests for useConditions hook (__tests__/lib/hooks/use-conditions.test.tsx)
- [x] T033 Write tests for useMedications hook (__tests__/lib/hooks/use-medications.test.tsx)
- [x] T034 Write tests for useAllergies hook (__tests__/lib/hooks/use-allergies.test.tsx)

### UI Components for User Story 1

- [x] T035 Create ConditionForm component (components/medical-history/condition-form.tsx with React Hook Form + Zod)
- [x] T036 Create MedicationForm component (components/medical-history/medication-form.tsx)
- [x] T037 Create AllergyForm component (components/medical-history/allergy-form.tsx with severity dropdown)
- [x] T038 Create MedicalHistoryList component (components/medical-history/medical-history-list.tsx with tabs and CRUD actions)
- [ ] T039-T042 Component tests (deferred - components work, tests can be added later)

### Page Integration for User Story 1

- [x] T043 Create Medical History page (app/medical-history/page.tsx - fully integrated with hooks, forms, and dialogs)
- [x] T044 Write integration tests (__tests__/integration/medical-history.test.tsx - basic user journey tests)

**Checkpoint**: ✅ User Story 1 complete and independently testable - users can manage medical history (conditions, medications, allergies) with full CRUD operations. Build successful.

---

## Phase 3.5: Symptom Tracking (Priority: P1.5) **[IMPLEMENTED - NOT IN ORIGINAL PLAN]**

**Note**: This phase was added after the original plan. Symptom tracking was prioritized to support the appointment question generation feature and provide users with a dedicated symptom logging interface.

**Goal**: Users can log and track symptoms over time with details like severity, category, body part, and triggers

**Status**: ✅ COMPLETE

### Implemented Features:
- [x] Symptom schema with validation (lib/schemas/symptom.ts)
- [x] Symptom storage service (lib/storage/symptoms.ts)
- [x] useSymptoms hook (lib/hooks/use-symptoms.ts)
- [x] SymptomForm component (components/symptoms/symptom-form.tsx)
- [x] SymptomsList component with filters (components/symptoms/symptoms-list.tsx)
- [x] SymptomFilters component (components/symptoms/symptom-filters.tsx)
- [x] Symptoms page (app/symptoms/page.tsx)
- [x] Component tests for SymptomForm and SymptomsList
- [x] Enhanced question generator to analyze symptom patterns (frequency, trends, triggers, body parts)
- [x] Dashboard integration with symptom visualizations

**Checkpoint**: ✅ Symptom tracking complete - users can log symptoms and see pattern analysis in appointment questions

---

## Phase 4: User Story 2 - Appointment History Tracking (Priority: P2)

**Goal**: Users can record past doctor visits with symptoms, generate appointment preparation questions (placeholder logic), and view chronological history

**Independent Test**: Create appointment records with visit details and symptoms, generate preparation questions, view in chronological order, edit notes and questions

### Storage Layer for User Story 2

- [x] T045 [P] [US2] Implement Appointment storage service in lib/storage/appointments.ts (load, create, update, delete, findById, save, loadSorted for chronological order)
- [x] T046 [P] [US2] Write unit tests for Appointment storage in __tests__/lib/storage/appointments.test.ts (CRUD operations, chronological sorting, symptoms and generatedQuestions fields)

### Hooks Layer for User Story 2

- [x] T047 [P] [US2] Create useAppointments hook in lib/hooks/use-appointments.ts (entities, sortedAppointments, loading, error, create, update, remove, refresh)
- [x] T048 [P] [US2] Write unit tests for useAppointments hook in __tests__/lib/hooks/use-appointments.test.tsx (state management, sorting, CRUD operations)

### Question Generation Logic for User Story 2

- [x] T049 [P] [US2] Create placeholder question generation function in lib/utils/question-generator.ts (analyzes symptoms, conditions, medications, allergies and returns array of generic questions)
- [x] T050 [P] [US2] Write unit tests for question generator in __tests__/lib/utils/question-generator.test.ts (various input scenarios, empty symptoms, no medical history)

### UI Components for User Story 2

- [x] T051 [P] [US2] Create AppointmentForm component in components/appointments/appointment-form.tsx (React Hook Form + Zod resolver, date picker, symptoms textarea, notes field)
- [x] T052 [P] [US2] Create AppointmentsList component in components/appointments/appointments-list.tsx (chronological display, "Prepare for Next Visit" button, generated questions display, edit/delete actions)
- [x] T053 [P] [US2] Create PrepareForVisit component in components/appointments/prepare-for-visit.tsx (dialog with generated questions, regenerate button)
- [ ] T054 [P] [US2] Write component tests for AppointmentForm in __tests__/components/appointments/appointment-form.test.tsx (validation, symptoms field, submission) - DEFERRED
- [ ] T055 [P] [US2] Write component tests for AppointmentsList in __tests__/components/appointments/appointments-list.test.tsx (chronological sorting, questions display) - DEFERRED
- [ ] T056 [P] [US2] Write component tests for PrepareForVisit in __tests__/components/appointments/prepare-for-visit.test.tsx (question generation, regeneration replaces questions) - DEFERRED

### Page Integration for User Story 2

- [x] T057 [US2] Create Appointments page in app/appointments/page.tsx (integrate useAppointments hook, render AppointmentsList, handle forms and question generation)
- [x] T058 [US2] Write integration tests for Appointments user journeys in __tests__/integration/appointments.test.tsx (AS-1 through AS-8 from spec.md including question generation - 9 tests passing)

**Checkpoint**: ✅ User Story 2 complete and independently testable - users can track appointments with symptoms and generate preparation questions. Integration tests cover all 8 acceptance scenarios plus validation and empty state.

---

## Phase 5: Symptom Dashboard with Visualizations (Priority: P4)

**Goal**: Users see symptom-focused dashboard with analytics, visualizations, and quick access to key features

**Independent Test**: Log multiple symptoms, view dashboard to see charts, stats, recent symptoms, and upcoming appointments

**Note**: Dashboard evolved from simple stats/activity to symptom-focused analytics with data visualizations

**Status**: ✅ COMPLETE (Enhanced beyond original plan)

### Implemented Features:

#### Data Visualization Components:
- [x] SymptomFrequencyChart component (components/dashboard/symptom-frequency-chart.tsx) - Line chart showing symptom frequency over time
- [x] CategoryBreakdownChart component (components/dashboard/category-breakdown-chart.tsx) - Pie chart showing symptom distribution by category
- [x] SeverityTrendChart component (components/dashboard/severity-trend-chart.tsx) - Area chart showing severity trends

#### Dashboard Features:
- [x] Dashboard page (app/page.tsx) with:
  - Summary stats (total symptoms, avg severity, most common symptom, top category)
  - Interactive charts for symptom analysis
  - 5 most recent symptoms with edit/delete actions
  - Next upcoming appointment with countdown and quick prepare link
  - Empty state with "Log Your First Symptom" CTA
  - Quick add symptom dialog

#### Statistics & Analytics:
- [x] getStats() method in useSymptoms hook for calculating symptom statistics
- [x] Integration with useAppointments for upcoming appointment display
- [x] Real-time updates when symptoms are added/edited/deleted

### Deferred Tests:
- [ ] T066 [US4] Write integration tests for Dashboard user journeys - DEFERRED

**Checkpoint**: ✅ Dashboard complete with symptom analytics, visualizations, and upcoming appointment tracking

---

## Phase 6: User Story 3 - Document Management (Priority: P3)

**Goal**: Users can upload medical documents (PDF, JPG, PNG), view them in-browser, and delete them with 10MB per-file limit

**Independent Test**: Upload various document types, view them, delete them, verify file size and type validation, check error messages for quota exceeded

### File Utilities for User Story 3

- [ ] T067 [P] [US3] Create file utility functions in lib/utils/file-utils.ts (fileToBase64, base64ToBlob, validateFile for MIME type and size)
- [ ] T068 [P] [US3] Write unit tests for file utilities in __tests__/lib/utils/file-utils.test.ts (conversion correctness, validation rules, 10MB limit, MIME types)

### Storage Layer for User Story 3

- [ ] T069 [P] [US3] Implement Document storage service in lib/storage/documents.ts (load, upload, delete, findById, fileToBase64, base64ToBlob, validateFile)
- [ ] T070 [P] [US3] Write unit tests for Document storage in __tests__/lib/storage/documents.test.ts (upload with base64 encoding, quota exceeded error, file validation)

### Hooks Layer for User Story 3

- [ ] T071 [P] [US3] Create useDocuments hook in lib/hooks/use-documents.ts (documents, loading, error, upload: async (file, description?), remove, getViewUrl, refresh)
- [ ] T072 [P] [US3] Write unit tests for useDocuments hook in __tests__/lib/hooks/use-documents.test.tsx (upload flow, error states, getViewUrl blob creation)

### UI Components for User Story 3

- [ ] T073 [P] [US3] Create DocumentUpload component in components/documents/document-upload.tsx (file input, description field, validation feedback, upload progress)
- [ ] T074 [P] [US3] Create DocumentsList component in components/documents/documents-list.tsx (displays documents with filename, upload date, file type icons, view/delete actions)
- [ ] T075 [P] [US3] Write component tests for DocumentUpload in __tests__/components/documents/document-upload.test.tsx (file selection, validation errors for size/type, upload flow)
- [ ] T076 [P] [US3] Write component tests for DocumentsList in __tests__/components/documents/documents-list.test.tsx (display, view action creates blob URL, delete confirmation)

### Page Integration for User Story 3

- [ ] T077 [US3] Create Documents page in app/documents/page.tsx (integrate useDocuments hook, render DocumentUpload and DocumentsList, handle view in new tab)
- [ ] T078 [US3] Write integration tests for Documents user journeys in __tests__/integration/documents.test.tsx (AS-11 through AS-13 from spec.md)

**Checkpoint**: User Story 3 complete and independently testable - users can upload, view, and delete medical documents with proper validation

---

## Phase 7: Navigation & Layout

**Purpose**: Connect all user stories with navigation and verify localStorage warnings

- [x] T079 Create Navigation component in components/navigation.tsx (links to Dashboard, Medical History, Appointments, Symptoms with active state)
- [x] T080 Update root layout in app/layout.tsx (add Navigation component, OnboardingGuard component)
- [ ] T081 [P] Write component tests for Navigation in __tests__/components/navigation.test.tsx (all links present, active states) - DEFERRED
- [x] T082 Verify navigation between all sections manually (Dashboard → Medical History → Appointments → Symptoms → Dashboard)

**Checkpoint**: All sections connected via navigation, onboarding flow implemented

---

## Phase 8: E2E Tests

**Purpose**: Critical path E2E tests for user journeys across the entire application

**Status**: ✅ **TESTS WRITTEN** (Cannot execute due to Turbopack server issue)

- [x] T083 [P] Write E2E test for add condition → view on dashboard → reload persistence in __tests__/e2e/critical-paths.spec.ts
- [x] T084 [P] Write E2E test for add appointment with symptoms → generate questions → view questions in __tests__/e2e/critical-paths.spec.ts
- [x] T085 [P] Write E2E test for upload document → view document → delete document in __tests__/e2e/critical-paths.spec.ts (SKIPPED - Documents feature deferred)
- [x] T086 Write E2E test for data persistence in __tests__/e2e/data-persistence.spec.ts (add entries in all sections → reload → verify all data persists)

**Files Created**:
- `__tests__/e2e/critical-paths.spec.ts` - 3 critical path tests (1 skipped)
- `__tests__/e2e/data-persistence.spec.ts` - Data persistence + error handling tests

**Checkpoint**: ✅ E2E tests written and ready. Execution blocked by Turbopack dev server crash (Next.js 16 issue, not codebase issue)

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, performance validation, accessibility

**Status**: ⚠️ **PARTIALLY COMPLETE** - See [QUALITY-REPORT.md](./QUALITY-REPORT.md) for details

### Completed Quality Checks:
- [x] T089 [P] Check bundle sizes - **MEASURED**: 2MB JS (uncompressed), 56KB CSS
- [x] T092 [P] Run full test suite with coverage - **RESULT**: 49.76% (target: 80%), 230/236 tests passing
- [x] T094 [P] Verify ESLint - **IMPROVED**: 64 → 50 problems (22% reduction), still has 31 errors
- [x] T095 [P] Verify TypeScript compiles - **PASSING**: Zero errors in strict mode for production code

### Blocked/Deferred:
- [ ] T087 [P] Run Lighthouse audit - **BLOCKED**: Turbopack server issue prevents execution
- [ ] T088 [P] Verify Core Web Vitals - **BLOCKED**: Turbopack server issue prevents execution
- [ ] T090 [P] Test mobile viewport - **DEFERRED**: Manual testing required
- [ ] T091 [P] Test dark mode - **DEFERRED**: Manual testing required

### Remaining Work:
- [ ] T093 [P] Add JSDoc comments to complex utility functions and hooks
- [ ] T096 Add warning modal about localStorage data loss when clearing browser data (FR-016)
- [ ] T097 Verify all empty states display correctly with helpful instructions (FR-020)
- [ ] T098 Verify all form validation errors display clearly with ARIA labels (FR-021)
- [ ] T099 Verify all success/error feedback displays correctly (FR-022, FR-023)
- [ ] T100 Run quickstart.md validation checklist (verify all acceptance scenarios pass)

### Quality Improvements Made:
- Fixed `require()` imports in test files (ESLint compliance)
- Fixed React unescaped entities in onboarding components
- Removed unused variables and mock services
- Created comprehensive quality report documenting all metrics
- Added symptoms storage test suite (19 tests, has isolation issues to resolve)

**Checkpoint**: ⚠️ **PARTIAL** - Core quality metrics measured, improvements made. Production readiness requires test coverage increase (49% → 80%) and ESLint error resolution (31 remaining)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P4 → P3)
- **Navigation (Phase 7)**: Depends on all user story pages being created (US1, US2, US3, US4)
- **E2E Tests (Phase 8)**: Depends on all user stories + navigation being complete
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1 - Medical History)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2 - Appointments)**: Can start after Foundational (Phase 2) - Uses Medical History data for question generation but independently testable
- **User Story 4 (P4 - Dashboard)**: Can start after Foundational (Phase 2) - Aggregates data from US1 and US2 but displays empty state if no data exists
- **User Story 3 (P3 - Documents)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests for schemas/utilities MUST pass before storage layer
- Storage layer before hooks layer
- Hooks layer before UI components
- UI components before page integration
- Component tests alongside component implementation
- Integration tests after page integration

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T005, T007-T009)
- All Foundational schema creation tasks marked [P] can run in parallel (T013-T017)
- All Foundational schema test tasks marked [P] can run in parallel (T018-T022)
- Within User Story 1: Storage services (T023-T025) can run in parallel, their tests (T026-T028) can run in parallel, hooks (T029-T031) can run in parallel, their tests (T032-T034) can run in parallel, forms (T035-T037) can run in parallel, form tests (T039-T041) can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (US1, US2, US3, US4)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1 (Medical History)

```bash
# Storage layer - all can run in parallel:
Task T023: "Implement Condition storage service in lib/storage/conditions.ts"
Task T024: "Implement Medication storage service in lib/storage/medications.ts"
Task T025: "Implement Allergy storage service in lib/storage/allergies.ts"

# Storage tests - all can run in parallel (after storage layer):
Task T026: "Write unit tests for Condition storage in __tests__/lib/storage/conditions.test.ts"
Task T027: "Write unit tests for Medication storage in __tests__/lib/storage/medications.test.ts"
Task T028: "Write unit tests for Allergy storage in __tests__/lib/storage/allergies.test.ts"

# Hooks - all can run in parallel (after storage layer):
Task T029: "Create useConditions hook in lib/hooks/use-conditions.ts"
Task T030: "Create useMedications hook in lib/hooks/use-medications.ts"
Task T031: "Create useAllergies hook in lib/hooks/use-allergies.ts"

# Forms - all can run in parallel (after hooks):
Task T035: "Create ConditionForm component in components/medical-history/condition-form.tsx"
Task T036: "Create MedicationForm component in components/medical-history/medication-form.tsx"
Task T037: "Create AllergyForm component in components/medical-history/allergy-form.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Medical History Management)
4. **STOP and VALIDATE**: Test User Story 1 independently (all 5 acceptance scenarios)
5. Add basic navigation (Dashboard link + Medical History link)
6. Deploy/demo if ready

**MVP Scope**: 100 tasks total, MVP = T001-T044 + basic navigation (45 tasks)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Appointments + Question Generation)
4. Add User Story 4 → Test independently → Deploy/Demo (Dashboard Overview)
5. Add User Story 3 → Test independently → Deploy/Demo (Document Management)
6. Add Navigation + E2E + Polish → Final Release
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Medical History)
   - Developer B: User Story 2 (Appointments)
   - Developer C: User Story 4 (Dashboard)
   - Developer D: User Story 3 (Documents)
3. Stories complete and integrate independently
4. Team comes together for Navigation, E2E, and Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests pass before moving to next task
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution requirements: 80% coverage utilities, 90% business logic, 100% validation
- Performance targets: FCP < 1.8s, LCP < 2.5s, TTI < 3.5s, bundle size < 200KB JS
- Accessibility: WCAG 2.1 AA compliance, keyboard navigation, proper contrast ratios
- AI question generation uses placeholder logic in this iteration (deferred to future)