# Tasks: Health Log - Symptom Tracking Application

**Last Updated**: 2025-12-15

**Strategic Pivot**: Symptom tracking is now the primary feature with AI-powered question generation for doctor visits based on symptom patterns.

**Input**: Design documents from `/specs/001-health-log/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/storage-service.ts, research.md, quickstart.md

**Tests**: Tests are included per constitution requirements (80% coverage utilities, 90% business logic, 100% validation)

**Organization**: Tasks are grouped by feature to enable independent implementation and testing.

## Format: `[ID] [P?] [Feature] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Feature]**: Which feature this task belongs to
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router**: `app/`, `components/`, `lib/`, `__tests__/` at repository root
- All paths are relative to project root

---

## Phase 1: Setup (Shared Infrastructure) ✅ COMPLETE

**Purpose**: Project initialization and basic structure

- [x] T001 Install dependencies: zod, react-hook-form, @hookform/resolvers
- [x] T002 [P] Install shadcn/ui and configure
- [x] T003 [P] Install shadcn/ui components: button, card, form, input, label, dialog, select, textarea, calendar, popover
- [x] T004 [P] Install testing dependencies: jest, @testing-library/react, etc.
- [x] T005 [P] Install Playwright for E2E tests
- [x] T006-T009 Configure test infrastructure
- [x] T010 Create directory structure

**Checkpoint**: ✅ Dependencies installed, test infrastructure configured, directory structure created

---

## Phase 2: Foundational (Blocking Prerequisites) ✅ COMPLETE

**Purpose**: Core infrastructure that MUST be complete before ANY feature can be implemented

- [x] T011-T016 Create all schemas (medical-history, appointment, symptom)
- [x] T017-T018 Create base storage with CRUD operations
- [x] T019-T021 Create storage services
- [x] T022 Write integration tests

**Checkpoint**: ✅ Foundation ready - all schemas validated, storage utilities tested

---

## Phase 3: Medical History Management ✅ COMPLETE

**Goal**: Users can log and manage their medical conditions, medications, and allergies

- [x] T023-T028 Storage services
- [x] T029-T034 Hooks layer (useConditions, useMedications, useAllergies)
- [x] T035-T038 UI Components (forms and list)
- [x] T043-T044 Page integration and tests

**Checkpoint**: ✅ Medical history fully functional with CRUD operations

---

## Phase 4: Appointment History Tracking ✅ COMPLETE

**Goal**: Users can record doctor visits with symptoms and generate AI questions

- [x] T045-T046 Appointment storage with symptoms and generatedQuestions fields
- [x] T047-T048 useAppointments hook with sorting
- [x] T049-T050 AI question generator with pattern analysis
  - Analyzes symptom frequency, severity trends, triggers, body parts
  - Generates data-driven questions based on 30-day symptom logs
- [x] T051-T056 UI Components (AppointmentForm, AppointmentsList, PrepareForVisit)
- [x] T057-T058 Page integration

**Checkpoint**: ✅ Appointments with AI-powered question generation complete

---

## Phase 5: Symptom Tracking (Primary Feature) ✅ COMPLETE

**Goal**: Daily symptom logging with pattern tracking for AI question generation

### Schema & Storage
- [x] T101 Create lib/schemas/symptom.ts (symptomType, category, severity 1-10, bodyPart, triggers, notes, loggedAt)
- [x] T102 Create lib/storage/symptoms.ts with analytics (getAllSorted, getByDateRange, getRecentDays, getStats)

### Hooks & Logic
- [x] T103 Create lib/hooks/use-symptoms.ts (CRUD + getRecentDays, getStats helpers)
- [x] T104 Enhance lib/utils/question-generator.ts with symptom pattern analysis
  - analyzeSymptomFrequency() - count occurrences, avg severity
  - analyzeSeverityTrends() - detect increasing/decreasing/stable
  - analyzeCommonTriggers() - extract and count triggers
  - analyzeMostAffectedBodyParts() - identify top 3 body parts

### UI Components
- [x] T105 Create components/symptoms/symptom-form.tsx (full form with datetime picker)
- [x] T106 Create components/symptoms/symptoms-list.tsx (color-coded severity badges)
- [x] T107 Create components/ui/date-time-picker.tsx (shadcn calendar + time input)

### Dashboard Integration
- [x] T108 Rebuild app/page.tsx as symptom-focused dashboard
  - 4 stat cards: total, avg severity, most common, top category
  - Next appointment countdown with prepare questions button
  - Recent 5 symptoms with full CRUD
  - Quick navigation cards
- [x] T109 Create app/symptoms/page.tsx (redirect to dashboard)
- [x] T110 Update components/navigation.tsx (simplified: Dashboard, Appointments, Medical History)

**Checkpoint**: ✅ Symptom tracking is primary feature with pattern-based AI questions

---

## Phase 6: Onboarding Flow ✅ COMPLETE

**Goal**: Collect essential medical history during first-time user setup

### Schema & Storage
- [x] T111 Create lib/schemas/onboarding.ts (OnboardingStatus with step tracking)
- [x] T112 Create lib/storage/onboarding.ts (get, save, complete, skip, needsOnboarding)

### Hooks
- [x] T113 Create lib/hooks/use-onboarding.ts (status, updateStep, complete, skip, reset)

### UI Components
- [x] T114 Create components/onboarding/welcome-step.tsx (introduction with 3-step overview)
- [x] T115 Create components/onboarding/conditions-step.tsx (add conditions with inline form)
- [x] T116 Create components/onboarding/medications-step.tsx (add medications with inline form)
- [x] T117 Create components/onboarding/allergies-step.tsx (add allergies with inline form)
- [x] T118 Create components/onboarding/complete-step.tsx (summary with counts)

### Page Integration
- [x] T119 Create app/onboarding/page.tsx (multi-step wizard with progress indicator)
- [x] T120 Create components/onboarding-guard.tsx (redirect logic for new users)
- [x] T121 Update app/layout.tsx (wrap children with OnboardingGuard)

**Checkpoint**: ✅ Onboarding flow complete - new users guided through medical history setup

---

## Phase 7: Navigation & Polish (Temporary Solution)

**Goal**: Connect all features with navigation

- [x] T122 Create temporary Navigation component
- [x] T123 Update root layout with navigation
- [ ] T124 Verify navigation between all sections manually

**Checkpoint**: Basic navigation in place (to be redesigned in future iteration)

---

## Phase 8: Dashboard Visualizations ✅ COMPLETE

**Goal**: Make symptom data more actionable with charts and graphs

### Chart Components
- [x] T125 Install chart library (recharts 3.6.0 with react-is peer dependency)
- [x] T126 Create components/dashboard/symptom-frequency-chart.tsx (bar chart of last 30 days)
- [x] T127 Create components/dashboard/severity-trend-chart.tsx (line graph showing severity over time)
- [x] T128 Create components/dashboard/category-breakdown-chart.tsx (pie chart of symptom categories)

### Dashboard Enhancement
- [x] T129 Update app/page.tsx to include chart components
- [ ] T130 Add date range selector for chart filtering (deferred - optional enhancement)
- [ ] T131 Add export functionality (PDF/CSV) for symptom logs (deferred - optional enhancement)

**Checkpoint**: ✅ Symptom data visualized for better pattern recognition

---

## Phase 9: Search & Filter

**Goal**: Make symptom logs more searchable and filterable

- [ ] T132 Create lib/utils/symptom-filters.ts (filter by date range, category, severity, search text)
- [ ] T133 Create components/symptoms/symptom-filters.tsx (filter UI component)
- [ ] T134 Update app/page.tsx to integrate filtering
- [ ] T135 Add sort options (by date, severity, type)

**Checkpoint**: Users can find specific symptoms quickly

---

## Phase 10: Testing & Quality

**Goal**: Ensure existing features are solid with comprehensive testing

### Component Tests
- [ ] T136 Write tests for symptom-form.tsx
- [ ] T137 Write tests for symptoms-list.tsx
- [ ] T138 Write tests for onboarding components
- [ ] T139 Write tests for dashboard components

### Integration Tests
- [ ] T140 Write symptom tracking user journey tests
- [ ] T141 Write onboarding flow tests
- [ ] T142 Write AI question generation tests

### E2E Tests
- [ ] T143 Critical path: onboard → log symptom → schedule appointment → generate questions
- [ ] T144 Data persistence test across reload

**Checkpoint**: All features thoroughly tested

---

## Phase 11: Accessibility & Performance

**Goal**: Ensure app meets quality standards

- [ ] T145 Run Lighthouse audit (Performance ≥ 90, Accessibility = 100, Best Practices ≥ 90)
- [ ] T146 Verify Core Web Vitals (FCP < 1.8s, LCP < 2.5s, TTI < 3.5s, CLS < 0.1)
- [ ] T147 Check bundle sizes (JS < 200KB gzipped, CSS < 50KB gzipped)
- [ ] T148 Test mobile viewport at 375px minimum width
- [ ] T149 Test dark mode across all components
- [ ] T150 Run full test suite with coverage verification
- [ ] T151 Verify ESLint passes with zero errors
- [ ] T152 Verify TypeScript compiles with zero errors
- [ ] T153 Add localStorage data loss warning modal

**Checkpoint**: App meets all quality gates

---

## REMOVED: Document Management

**Decision**: Document upload feature removed from current roadmap. May be added in future iteration (v2) if needed. Focus is on symptom tracking and AI-powered insights.

**Removed Tasks**: T067-T078 (Document Management)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup
- **Medical History (Phase 3)**: Depends on Foundational
- **Appointments (Phase 4)**: Depends on Foundational + Medical History (for AI questions)
- **Symptom Tracking (Phase 5)**: Depends on Foundational (can run parallel with Phase 3/4)
- **Onboarding (Phase 6)**: Depends on Medical History components being complete
- **Navigation (Phase 7)**: Depends on all pages being created
- **Visualizations (Phase 8)**: Depends on Symptom Tracking
- **Search/Filter (Phase 9)**: Depends on Symptom Tracking
- **Testing (Phase 10)**: Ongoing, can run parallel with development
- **Polish (Phase 11)**: Depends on all desired features being complete

### Current Status (2025-12-16)
✅ **Completed**: Phases 1-8 (Setup → Onboarding → Dashboard Visualizations)
📋 **Next**: Phase 9 (Search & Filter) or Phase 10 (Testing & Quality)

---

## Strategic Notes

1. **Symptom-First Approach**: The app is now centered around daily symptom tracking with AI insights
2. **AI Question Generation**: Uses real symptom pattern data (frequency, trends, triggers) instead of templates
3. **Onboarding**: Essential medical history collected upfront, but can be skipped
4. **Document Management**: Deferred to v2, not needed for core symptom tracking workflow
5. **Dashboard Focus**: Main page shows symptom stats, trends, and next appointment prep

---

## Implementation Strategy

### Current MVP Status
✅ **Core Features Complete**:
- Medical history management (conditions, medications, allergies)
- Appointment tracking with AI question generation
- Symptom tracking with pattern analysis
- Onboarding flow for new users
- Dashboard visualizations (frequency chart, severity trends, category breakdown)
- Basic navigation

### Next Steps (Recommended Priority)
1. **Search & Filter** (Phase 9) - Improve symptom log usability with date ranges and filters
2. **Testing** (Phase 10) - Ensure quality and coverage
3. **Polish** (Phase 11) - Meet all quality gates (accessibility, performance, lighthouse scores)

### Future Enhancements (v2)
- Document upload/management
- Medication reminders
- Symptom photo attachments
- Doctor appointment scheduling integration
- Export health records to share with doctors
- Advanced analytics (correlation analysis, prediction models)
