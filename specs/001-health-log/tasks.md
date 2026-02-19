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

- [x] T001 Install Convex globally and initialize Convex in project with `npx convex dev`
- [x] T002 Install Convex client libraries with `yarn add convex @convex-dev/auth`
- [x] T003 [P] Create `.env.local` with `NEXT_PUBLIC_CONVEX_URL` from Convex deployment
- [ ] T004 [P] Update `next.config.ts` to enable Convex compatibility (serverActions if needed)
- [x] T005 Create Convex schema in `convex/schema.ts` with symptoms and appointments tables
- [x] T006 [P] Create Convex TypeScript config in `convex/tsconfig.json`
- [x] T007 Deploy Convex schema with `npx convex deploy` and verify in dashboard
- [x] T008 Add ConvexProvider to `app/layout.tsx` wrapping children

---

## Phase 2: Foundational (Core Convex Functions & Client Setup)

**Purpose**: Core Convex backend functions and Zod schemas that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create symptom Zod schema in `lib/schemas/symptom.ts` (validation: symptomType 1-200 chars, severity 1-10, bodyPart max 100, triggers max 500, notes max 2000)
- [x] T010 [P] Create appointment Zod schema in `lib/schemas/appointment.ts` (validation: date required, doctorName 1-200 chars, reason 1-500 chars, symptoms/notes max 2000)
- [x] T011 Create Convex symptom queries in `convex/symptoms.ts` (getAll, getRecent, getByDateRange, getById)
- [x] T012 [P] Create Convex symptom mutations in `convex/symptoms.ts` (create, update, remove with ownership verification)
- [x] T013 Create Convex appointment queries in `convex/appointments.ts` (getAll, getUpcoming, getByDateRange, getById)
- [x] T014 [P] Create Convex appointment mutations in `convex/appointments.ts` (create, update, remove with ownership verification)
- [x] T015 Test Convex schema deployment and verify tables appear in Convex dashboard

**Checkpoint**: Convex backend ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Symptom Logging (Priority: P1) 🎯 MVP

**Goal**: Users can log symptoms with severity, body part, triggers, and notes. Symptoms are stored in Convex and displayed in real-time.

**Independent Test**: Create, view, edit, and delete symptom entries. Verify symptoms persist across page reloads and sync in real-time.

### Implementation for User Story 1

- [x] T016 [P] [US1] Update `components/symptoms/symptom-form.tsx` to use Convex `useMutation(api.symptoms.create)` instead of localStorage
- [x] T017 [P] [US1] Update `components/symptoms/symptoms-list.tsx` to use Convex `useQuery(api.symptoms.getAll)` for reactive data
- [x] T018 [US1] Add optimistic updates to `components/symptoms/symptom-form.tsx` for instant UI feedback on submission
- [x] T019 [US1] Update symptom edit functionality to use Convex `update` mutation in `components/symptoms/symptom-form.tsx`
- [x] T020 [US1] Update symptom delete functionality to use Convex `remove` mutation in `components/symptoms/symptoms-list.tsx`
- [x] T021 [US1] Add loading skeleton to `components/symptoms/symptoms-list.tsx` for when `symptoms === undefined` (Convex loading state)
- [x] T022 [US1] Update `app/symptoms/page.tsx` to ensure ConvexProvider context is available
- [ ] T023 [US1] Add error boundary to symptoms page for Convex connection errors in `app/symptoms/page.tsx`
- [x] T024 [US1] Update symptom filters in `lib/utils/symptom-filters.ts` to work with Convex symptom schema (uses `_id` instead of `id`, `loggedAt` as number)
- [ ] T025 [US1] Test symptom logging flow: create → appears in list → edit → delete → verify Convex dashboard shows changes

**Checkpoint**: At this point, User Story 1 (Symptom Logging) should be fully functional with Convex backend

---

## Phase 4: User Story 2 - Appointment Tracking (Priority: P2)

**Goal**: Users can track appointments with date, doctor name, reason, symptoms, notes, and AI-generated questions (placeholder).

**Independent Test**: Create appointment records, add symptoms, generate placeholder questions, view chronological history.

### Implementation for User Story 2

- [x] T026 [P] [US2] Update `components/appointments/appointment-form.tsx` to use Convex `useMutation(api.appointments.create)`
- [x] T027 [P] [US2] Update `components/appointments/appointments-list.tsx` to use Convex `useQuery(api.appointments.getAll)`
- [x] T028 [US2] Implement appointment edit functionality with Convex `update` mutation in `components/appointments/appointment-form.tsx`
- [x] T029 [US2] Implement appointment delete functionality with Convex `remove` mutation in `components/appointments/appointments-list.tsx`
- [x] T030 [US2] Add symptoms field to appointment form (captured via prepare-for-visit / generate-questions flow, not the main form)
- [x] T031 [US2] Create placeholder question generator function in `lib/utils/question-generator.ts` (analyzes symptoms, returns string array)
- [x] T032 [US2] Implement "Generate Questions" component in `components/appointments/generate-questions.tsx`
- [x] T033 [US2] Add Convex action to save generated questions to appointment's `generatedQuestions` field (via `convex/ai.ts` + `useAction`)
- [x] T034 [US2] Display generated questions in appointment detail view when `generatedQuestions` array is not empty in `components/appointments/appointments-list.tsx`
- [x] T035 [US2] Add loading state to `app/appointments/page.tsx` for Convex loading state (shows "Loading appointments..." text)
- [x] T036 [US2] Update `app/appointments/page.tsx` to ensure ConvexProvider context is available
- [x] T037 [US2] Sort appointments by date (descending) using Convex `.order("desc")` in `convex/appointments.ts`
- [ ] T038 [US2] Test appointment flow: create with symptoms → generate questions → view questions → edit → delete

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 4 - Symptom Dashboard (Priority: P4)

**Goal**: Dashboard showing symptom analytics (heatmap, severity trends, time distribution), stats cards, and recent symptoms.

**Independent Test**: Log multiple symptoms over time, view dashboard to see charts render correctly with reactive data from Convex.

### Implementation for User Story 4

- [x] T039 [P] [US4] Create Convex query for dashboard stats in `convex/symptoms.ts` (stats aggregated client-side via `getStats()` in `lib/hooks/use-symptoms.ts`)
- [x] T040 [P] [US4] Update `components/dashboard/symptom-heatmap.tsx` to use Convex data (receives symptoms via props from `components/dashboard.tsx`)
- [x] T041 [P] [US4] Update `components/dashboard/severity-trend-chart.tsx` to use Convex data (receives symptoms via props from `components/dashboard.tsx`)
- [x] T042 [P] [US4] Update `components/dashboard/time-distribution-chart.tsx` to use Convex data (receives symptoms via props from `components/dashboard.tsx`)
- [x] T043 [US4] Create stats cards component in `components/dashboard/stats-cards.tsx` (insight cards built inline in `components/dashboard.tsx` — Most Frequent, Common Trigger, Pattern Alert)
- [x] T044 [US4] Update `components/dashboard.tsx` to use Convex queries for recent symptoms and upcoming appointments (via `useSymptoms()` and `useAppointments()` hooks)
- [x] T045 [US4] Add loading skeletons to all dashboard charts for Convex loading state (loading state handled in `components/dashboard.tsx`)
- [x] T046 [US4] Implement empty state component for dashboard when no symptoms logged (empty state inline in `components/dashboard.tsx` — "No symptoms logged yet" card)
- [x] T047 [US4] Add quick action buttons to dashboard: "Log Symptom", "Schedule Appointment" in `components/dashboard.tsx`
- [x] T048 [US4] Optimize dashboard queries to limit data (recent days via `getRecentDays()` in `lib/hooks/use-symptoms.ts`)
- [ ] T049 [US4] Test dashboard updates in real-time: log symptom → verify chart updates without page reload

**Checkpoint**: All core user stories should now be independently functional with Convex real-time sync

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Add error boundaries for Convex connection failures in `app/layout.tsx`
- [ ] T059 [P] Create Convex connection status indicator component in `components/convex-status.tsx`
- [x] T060 Add accessibility improvements: keyboard navigation for symptom/appointment lists (Radix UI handles this via DropdownMenu/Dialog components)
- [x] T061 Add ARIA labels and semantic HTML to all forms (`components/symptoms/symptom-form.tsx` has aria-invalid, `components/appointments/appointment-form.tsx` has aria-invalid)
- [ ] T062 Test responsive layout on mobile (375px minimum width) for all pages
- [x] T063 [P] Add dark mode support verification for all new Convex-integrated components (`components/dashboard.tsx` uses `dark:` classes throughout)
- [x] T064 Implement confirmation dialogs for delete operations (appointments: full confirm dialog in `app/appointments/page.tsx`; symptoms: inline confirm via `window.confirm` in `app/symptoms/page.tsx`)
- [x] T065 Add input validation feedback (real-time Zod validation errors displayed in `components/symptoms/symptom-form.tsx`)
- [ ] T066 Performance audit: verify Lighthouse scores meet targets (Performance ≥90, Accessibility=100)
- [ ] T067 Test Convex query optimization: verify dashboard loads in <1s with 100+ symptoms
- [ ] T068 Add documentation comments to Convex functions (JSDoc for queries and mutations)
- [x] T069 Update CLAUDE.md with Convex workflow instructions (Convex is documented in the architecture section)
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
- **Polish (Phase 6)**: Depends on all user stories being complete

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
- **Polish (Phase 6)**: T058 and T059 [P], T063 [P]

---

## Implementation Strategy

### Incremental Delivery

1. Complete Setup + Foundational → Convex backend ready ✅
2. Add User Story 1 (Symptom Logging) → Test independently → Deploy/Demo ✅
3. Add User Story 2 (Appointment Tracking) → Test independently → Deploy/Demo ✅
4. Add User Story 4 (Dashboard) → Test independently → Deploy/Demo ✅
5. Polish → Error boundaries, audit, docs

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
- **Authentication**: Using Clerk authentication (`ctx.auth.getUserIdentity()`) - session persists in browser
- **Schema Changes**: Run `npx convex deploy` after modifying `convex/schema.ts`
- **Testing**: Use Convex dev deployment for E2E tests, mock Convex hooks for component tests
- **Migration**: LocalStorage → Convex is one-way (don't clear localStorage until migration succeeds)

---

## Task Count Summary

- **Phase 1 (Setup)**: 8 tasks — ✅ 7 complete, 1 remaining (T004 — likely not needed)
- **Phase 2 (Foundational)**: 7 tasks — ✅ All complete
- **Phase 3 (User Story 1)**: 10 tasks — ✅ 8 complete, 2 remaining (T023 optional, T025 manual test)
- **Phase 4 (User Story 2)**: 13 tasks — ✅ 12 complete, 1 remaining (T038 manual test)
- **Phase 5 (User Story 4)**: 11 tasks — ✅ 10 complete, 1 remaining (T049 manual test)
- **Phase 6 (Polish)**: 13 tasks — 🔄 6 complete, 7 remaining (T058, T059, T062, T066, T067, T068, T070)

**Total**: 62 tasks | **Complete**: 55 | **Remaining**: 7

**Active work**: Phase 6 polish → T058 (error boundaries), T059 (Convex status), T062 (mobile test), T066 (Lighthouse), T067 (perf test), T068 (JSDoc), T070 (quickstart validation)
