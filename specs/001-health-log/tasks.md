# Tasks: Healthcare Tracking Application with Convex Backend

**Input**: Design documents from `/specs/001-health-log/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Note**: Tests are not explicitly required in the spec, so test tasks are omitted. Focus is on implementation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Convex Backend Infrastructure)

**Purpose**: Initialize Convex backend and configure Next.js integration

- [ ] T001 Install Convex globally and initialize Convex in project with `npx convex dev`
- [ ] T002 Install Convex client libraries with `yarn add convex @convex-dev/auth`
- [ ] T003 [P] Create `.env.local` with `NEXT_PUBLIC_CONVEX_URL` from Convex deployment
- [ ] T004 [P] Update `next.config.ts` to enable Convex compatibility (serverActions if needed)
- [ ] T005 Create Convex schema in `convex/schema.ts` with symptoms and appointments tables
- [ ] T006 [P] Create Convex TypeScript config in `convex/tsconfig.json`
- [ ] T007 Deploy Convex schema with `npx convex deploy` and verify in dashboard
- [ ] T008 Add ConvexProvider to `app/layout.tsx` wrapping children

---

## Phase 2: Foundational (Core Convex Functions & Client Setup)

**Purpose**: Core Convex backend functions and Zod schemas that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Create symptom Zod schema in `lib/schemas/symptom.ts` (validation: symptomType 1-200 chars, severity 1-10, bodyPart max 100, triggers max 500, notes max 2000)
- [ ] T010 [P] Create appointment Zod schema in `lib/schemas/appointment.ts` (validation: date required, doctorName 1-200 chars, reason 1-500 chars, symptoms/notes max 2000)
- [ ] T011 Create Convex symptom queries in `convex/symptoms.ts` (getAll, getRecent, getByDateRange, getById)
- [ ] T012 [P] Create Convex symptom mutations in `convex/symptoms.ts` (create, update, remove with ownership verification)
- [ ] T013 Create Convex appointment queries in `convex/appointments.ts` (getAll, getUpcoming, getByDateRange, getById)
- [ ] T014 [P] Create Convex appointment mutations in `convex/appointments.ts` (create, update, remove with ownership verification)
- [ ] T015 Test Convex schema deployment and verify tables appear in Convex dashboard

**Checkpoint**: Convex backend ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Symptom Logging (Priority: P1) 🎯 MVP

**Goal**: Users can log symptoms with severity, body part, triggers, and notes. Symptoms are stored in Convex and displayed in real-time.

**Independent Test**: Create, view, edit, and delete symptom entries. Verify symptoms persist across page reloads and sync in real-time.

### Implementation for User Story 1

- [ ] T016 [P] [US1] Update `components/symptoms/symptom-form.tsx` to use Convex `useMutation(api.symptoms.create)` instead of localStorage
- [ ] T017 [P] [US1] Update `components/symptoms/symptoms-list.tsx` to use Convex `useQuery(api.symptoms.getAll)` for reactive data
- [ ] T018 [US1] Add optimistic updates to symptom-form.tsx for instant UI feedback on submission
- [ ] T019 [US1] Update symptom edit functionality to use Convex `update` mutation in symptom-form.tsx
- [ ] T020 [US1] Update symptom delete functionality to use Convex `remove` mutation in symptoms-list.tsx
- [ ] T021 [US1] Add loading skeleton to symptoms-list.tsx for when `symptoms === undefined` (Convex loading state)
- [ ] T022 [US1] Update `app/symptoms/page.tsx` to ensure ConvexProvider context is available
- [ ] T023 [US1] Add error boundary to symptoms page for Convex connection errors in app/symptoms/page.tsx
- [ ] T024 [US1] Update symptom filters in `lib/utils/symptom-filters.ts` to work with Convex symptom schema (uses `_id` instead of `id`, `loggedAt` as number)
- [ ] T025 [US1] Test symptom logging flow: create → appears in list → edit → delete → verify Convex dashboard shows changes

**Checkpoint**: At this point, User Story 1 (Symptom Logging) should be fully functional with Convex backend

---

## Phase 4: User Story 2 - Appointment Tracking (Priority: P2)

**Goal**: Users can track appointments with date, doctor name, reason, symptoms, notes, and AI-generated questions (placeholder).

**Independent Test**: Create appointment records, add symptoms, generate placeholder questions, view chronological history.

### Implementation for User Story 2

- [ ] T026 [P] [US2] Update `components/appointments/appointment-form.tsx` to use Convex `useMutation(api.appointments.create)`
- [ ] T027 [P] [US2] Update `components/appointments/appointments-list.tsx` to use Convex `useQuery(api.appointments.getAll)`
- [ ] T028 [US2] Implement appointment edit functionality with Convex `update` mutation in appointment-form.tsx
- [ ] T029 [US2] Implement appointment delete functionality with Convex `remove` mutation in appointments-list.tsx
- [ ] T030 [US2] Add symptoms field to appointment form (textarea, optional, max 2000 chars per Zod schema)
- [ ] T031 [US2] Create placeholder question generator function in `lib/utils/question-generator.ts` (analyzes symptoms, returns string array)
- [ ] T032 [US2] Implement "Prepare for Next Visit" component in `components/appointments/prepare-for-visit.tsx`
- [ ] T033 [US2] Add Convex mutation or client-side logic to save generated questions to appointment's `generatedQuestions` field
- [ ] T034 [US2] Display generated questions in appointment detail view when `generatedQuestions` array is not empty
- [ ] T035 [US2] Add loading skeleton to appointments-list.tsx for Convex loading state
- [ ] T036 [US2] Update `app/appointments/page.tsx` to ensure ConvexProvider context is available
- [ ] T037 [US2] Sort appointments by date (descending) using Convex `.order("desc")` in query
- [ ] T038 [US2] Test appointment flow: create with symptoms → generate questions → view questions → edit → delete

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 4 - Symptom Dashboard (Priority: P4)

**Goal**: Dashboard showing symptom analytics (heatmap, severity trends, time distribution), stats cards, and recent symptoms.

**Independent Test**: Log multiple symptoms over time, view dashboard to see charts render correctly with reactive data from Convex.

### Implementation for User Story 4

- [ ] T039 [P] [US4] Create Convex query for dashboard stats in `convex/symptoms.ts` (aggregates: total count, avg severity, most common symptom, top category)
- [ ] T040 [P] [US4] Update `components/dashboard/symptom-heatmap.tsx` to use Convex `useQuery(api.symptoms.getByDateRange)` for last 30 days
- [ ] T041 [P] [US4] Update `components/dashboard/severity-trend-chart.tsx` to use Convex reactive query
- [ ] T042 [P] [US4] Update `components/dashboard/time-distribution-chart.tsx` to use Convex reactive query
- [ ] T043 [US4] Create stats cards component in `components/dashboard/stats-cards.tsx` using Convex aggregation query
- [ ] T044 [US4] Update `app/page.tsx` (dashboard) to use Convex queries for recent symptoms and upcoming appointments
- [ ] T045 [US4] Add loading skeletons to all dashboard charts for Convex loading state
- [ ] T046 [US4] Implement empty state component for dashboard when no symptoms logged in `components/dashboard/empty-state.tsx`
- [ ] T047 [US4] Add quick action buttons to dashboard: "Log Symptom", "Schedule Appointment"
- [ ] T048 [US4] Optimize dashboard queries to limit data (last 30 days for charts, 5 most recent for list)
- [ ] T049 [US4] Test dashboard updates in real-time: log symptom → verify chart updates without page reload

**Checkpoint**: All core user stories should now be independently functional with Convex real-time sync

---

## Phase 6: Migration from localStorage to Convex

**Purpose**: Enable users to migrate existing localStorage data to Convex

- [ ] T050 [P] Create migration utility in `lib/utils/migrate-to-convex.ts` (reads localStorage, calls Convex mutations)
- [ ] T051 [P] Create migration banner component in `components/migration-banner.tsx` (detects localStorage data, prompts user)
- [ ] T052 Add migration banner to `app/layout.tsx` (shows when localStorage data exists and Convex is empty)
- [ ] T053 Implement migration script logic: parse localStorage symptoms → call `api.symptoms.create` for each
- [ ] T054 Implement migration script logic: parse localStorage appointments → call `api.appointments.create` for each
- [ ] T055 Add migration success/error handling with toast notifications
- [ ] T056 Clear localStorage only after successful migration confirmation
- [ ] T057 Test migration with sample localStorage data (create test data, migrate, verify in Convex dashboard)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Add error boundaries for Convex connection failures in `app/layout.tsx`
- [ ] T059 [P] Create Convex connection status indicator component in `components/convex-status.tsx`
- [ ] T060 Add accessibility improvements: keyboard navigation for symptom/appointment lists
- [ ] T061 Add ARIA labels and semantic HTML to all forms (symptom-form.tsx, appointment-form.tsx)
- [ ] T062 Test responsive layout on mobile (375px minimum width) for all pages
- [ ] T063 [P] Add dark mode support verification for all new Convex-integrated components
- [ ] T064 Implement confirmation dialogs for delete operations (symptom and appointment)
- [ ] T065 Add input validation feedback (real-time Zod validation errors displayed)
- [ ] T066 Performance audit: verify Lighthouse scores meet targets (Performance ≥90, Accessibility=100)
- [ ] T067 Test Convex query optimization: verify dashboard loads in <1s with 100+ symptoms
- [ ] T068 Add documentation comments to Convex functions (JSDoc for queries and mutations)
- [ ] T069 Update CLAUDE.md with Convex workflow instructions (npx convex dev, deployment)
- [ ] T070 Run quickstart.md validation: follow setup steps, verify all instructions work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (Symptom Logging) - Phase 3
  - User Story 2 (Appointment Tracking) - Phase 4
  - User Story 4 (Dashboard) - Phase 5
  - User stories can proceed in parallel (if staffed) or sequentially by priority
- **Migration (Phase 6)**: Depends on User Stories 1 and 2 completion
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent, but may reference symptoms for question generation
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Reads symptoms and appointments but doesn't modify them

### Within Each User Story

- Zod schemas before Convex mutations (client-side validation happens first)
- Convex queries before UI components (data layer before presentation)
- Form components before list components (CRUD operations in logical order)
- Core functionality before optimizations (working feature before loading states)

### Parallel Opportunities

- **Setup (Phase 1)**: T003 and T004 [P], T006 [P]
- **Foundational (Phase 2)**: T009 and T010 [P] (different Zod schemas), T012 [P], T014 [P]
- **User Story 1 (Phase 3)**: T016 and T017 [P] (form and list components)
- **User Story 2 (Phase 4)**: T026 and T027 [P]
- **User Story 4 (Phase 5)**: T039, T040, T041, T042 all [P] (different chart components)
- **Migration (Phase 6)**: T050 and T051 [P]
- **Polish (Phase 7)**: T058 and T059 [P], T063 [P]

---

## Parallel Example: User Story 1

```bash
# Launch symptom form and list components together:
Task T016: "Update symptom-form.tsx to use Convex useMutation"
Task T017: "Update symptoms-list.tsx to use Convex useQuery"

# These can run in parallel because they modify different files
```

---

## Parallel Example: User Story 4 (Dashboard)

```bash
# Launch all dashboard chart components together:
Task T039: "Create Convex query for dashboard stats"
Task T040: "Update symptom-heatmap.tsx to use Convex query"
Task T041: "Update severity-trend-chart.tsx to use Convex query"
Task T042: "Update time-distribution-chart.tsx to use Convex query"

# All modify different files and have no dependencies on each other
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Convex initialization)
2. Complete Phase 2: Foundational (Convex schema + functions)
3. Complete Phase 3: User Story 1 (Symptom Logging)
4. **STOP and VALIDATE**: Test symptom logging independently with Convex
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Convex backend ready
2. Add User Story 1 (Symptom Logging) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Appointment Tracking) → Test independently → Deploy/Demo
4. Add User Story 4 (Dashboard) → Test independently → Deploy/Demo
5. Add Migration (Phase 6) → Test with sample data → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Symptom Logging)
   - Developer B: User Story 2 (Appointment Tracking)
   - Developer C: User Story 4 (Dashboard)
3. Stories complete and integrate independently
4. Team together: Migration + Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story (US1, US2, US4)
- Each user story should be independently completable and testable
- Convex queries are reactive - `useQuery` auto-updates UI when data changes
- Always check `if (data === undefined)` for Convex loading state
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run `npx convex dev` in one terminal, `yarn dev` in another during development
- Monitor Convex dashboard (https://dashboard.convex.dev) for real-time database changes

---

## Convex-Specific Considerations

- **Real-time Updates**: All `useQuery` hooks automatically re-render when data changes (zero polling)
- **Optimistic Updates**: Use Convex optimistic mutations for instant UI feedback before server confirmation
- **Error Handling**: Convex mutations throw errors - wrap in try/catch or use error boundaries
- **Authentication**: Using anonymous auth (`ctx.auth.getUserIdentity()`) - session persists in browser
- **Schema Changes**: Run `npx convex deploy` after modifying `convex/schema.ts`
- **Testing**: Use Convex dev deployment for E2E tests, mock Convex hooks for component tests
- **Migration**: LocalStorage → Convex is one-way (don't clear localStorage until migration succeeds)

---

## Task Count Summary

- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 7 tasks
- **Phase 3 (User Story 1)**: 10 tasks
- **Phase 4 (User Story 2)**: 13 tasks
- **Phase 5 (User Story 4)**: 11 tasks
- **Phase 6 (Migration)**: 8 tasks
- **Phase 7 (Polish)**: 13 tasks

**Total**: 70 tasks

**Parallel Opportunities**: 15 tasks marked [P]

**MVP Scope (User Story 1 only)**: 25 tasks (Phase 1 + Phase 2 + Phase 3)
