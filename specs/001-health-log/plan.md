# Implementation Plan: Healthcare Tracking Application

**Branch**: `001-health-log` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-health-log/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Building a healthcare tracking application with symptom logging, appointment tracking, and dashboard analytics. The application uses **Convex** as the backend-as-a-service for real-time data synchronization, authentication, and cloud storage. The frontend is built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS 4.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.0.8, React 19.2.1

**Primary Dependencies**:
  - **Backend**: Convex (real-time BaaS with TypeScript schema, queries, mutations)
  - **UI Framework**: Next.js 16 App Router, React 19, Tailwind CSS 4
  - **Validation**: Zod 4.1.13 (client-side schemas)
  - **Forms**: react-hook-form 7.68.0, @hookform/resolvers 5.2.2
  - **UI Components**: Radix UI (dialog, dropdown, select, popover), lucide-react (icons)
  - **Charts**: Recharts 3.6.0 (symptom analytics)
  - **Date Handling**: date-fns 4.1.0, react-day-picker 9.12.0
  - **Notifications**: sonner 2.0.7 (toast notifications)

**Storage**: Convex cloud database with real-time synchronization (replaces localStorage)

**Testing**:
  - **Unit/Integration**: Jest 30.2.0, React Testing Library 16.3.0
  - **E2E**: Playwright 1.57.0
  - **Coverage Targets**: 80% utilities, 90% business logic, 100% data validation

**Target Platform**: Web application (responsive mobile-first design, desktop support)

**Project Type**: Web (Next.js full-stack with Convex backend)

**Performance Goals**:
  - FCP < 1.8s, LCP < 2.5s, TTI < 3.5s, CLS < 0.1
  - Data entry forms: <100ms feedback with optimistic updates
  - Charts: <500ms render for 30 days of symptom data
  - Search/Filter: <300ms for typical datasets

**Constraints**:
  - WCAG 2.1 AA accessibility compliance
  - Mobile-first responsive (375px minimum width)
  - Real-time data sync across devices via Convex
  - Lighthouse scores: Performance ≥90, Accessibility=100, Best Practices ≥90
  - Bundle sizes: JS <200KB gzipped, CSS <50KB gzipped

**Scale/Scope**:
  - Single-user health tracking application
  - Expected dataset: 100-500 symptom logs per user
  - 4 main sections: Dashboard, Symptoms, Appointments, (Medical History deferred)
  - Responsive UI with dark mode support

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Code Quality Requirements
- [x] TypeScript strict mode enabled (already configured in tsconfig.json)
- [x] ESLint configured with Next.js rules (eslint-config-next active)
- [x] Zero `any` types policy (will be enforced via review)
- [x] Zod schemas for all data validation (already in use: symptom.ts, appointment.ts)
- [x] Component interfaces with JSDoc (pattern established)
- [x] Functions under 50 lines (will be enforced via review)

### Testing Standards
- [x] Jest + React Testing Library configured (package.json scripts present)
- [x] Playwright for E2E testing (installed and configured)
- [x] Coverage targets defined: 80% utilities, 90% business logic, 100% validation
- [ ] **ACTION REQUIRED**: Convex-specific testing patterns need research (Phase 0)

### User Experience Consistency
- [x] Tailwind CSS 4 with theme variables in globals.css
- [x] Radix UI component library (accessible by default)
- [x] Dark mode support via CSS variables
- [x] Mobile-first responsive design (375px minimum)
- [x] WCAG 2.1 AA compliance required

### Performance Requirements
- [x] Core Web Vitals targets defined
- [x] Bundle size limits: JS <200KB, CSS <50KB
- [x] Performance budgets per feature type
- [ ] **ACTION REQUIRED**: Convex query optimization patterns need research (Phase 0)

### Data Integrity & Security
- [x] Zod validation on client side (already implemented)
- [ ] **ACTION REQUIRED**: Convex validators for server-side validation (Phase 0)
- [ ] **ACTION REQUIRED**: Convex authentication strategy (Phase 0)
- [x] No sensitive data logging (principle documented)

### Gate Evaluation (Initial)

**STATUS**: ✅ PASS with clarifications required in Phase 0

**Required Research Items**:
1. Convex testing patterns and best practices
2. Convex query optimization for health data
3. Convex authentication setup (anonymous vs authenticated users)
4. Convex schema validation approach
5. Migration strategy from localStorage to Convex

---

### Post-Design Re-evaluation

**All research items from Phase 0 have been resolved. Re-evaluating gates:**

### Code Quality Requirements
- [x] TypeScript strict mode enabled (already configured in tsconfig.json)
- [x] ESLint configured with Next.js rules (eslint-config-next active)
- [x] Zero `any` types policy (enforced via review, minimal usage in Convex type casting)
- [x] Zod schemas for client-side validation (lib/schemas/symptom.ts, appointment.ts)
- [x] Convex validators for server-side validation (convex/schema.ts)
- [x] Component interfaces with JSDoc (pattern established)
- [x] Functions under 50 lines (will be enforced via review)

### Testing Standards
- [x] Jest + React Testing Library configured
- [x] Playwright for E2E testing
- [x] **Convex Test** framework for backend function testing (resolved)
- [x] Coverage targets: 80% utilities, 90% business logic, 100% validation
- [x] Test patterns documented in research.md

### User Experience Consistency
- [x] Tailwind CSS 4 with theme variables
- [x] Radix UI component library (accessible)
- [x] Dark mode support via CSS variables
- [x] Mobile-first responsive design (375px minimum)
- [x] WCAG 2.1 AA compliance required

### Performance Requirements
- [x] Core Web Vitals targets defined
- [x] Bundle size limits: JS <200KB, CSS <50KB
- [x] **Convex query optimization patterns documented** (resolved)
- [x] Reactive queries for zero-polling real-time updates
- [x] Pagination strategy for large datasets (500+ records)

### Data Integrity & Security
- [x] Zod validation on client side (lib/schemas/)
- [x] **Convex validators for server-side validation** (resolved)
- [x] **Convex anonymous authentication strategy** (resolved)
- [x] User data ownership enforced via userId field
- [x] No sensitive data logging

### Final Gate Status

**STATUS**: ✅ PASS

**Key Decisions Made**:
1. **Testing**: Convex Test for backend (100% coverage), Jest + RTL for frontend (90% coverage)
2. **Authentication**: Anonymous auth with optional upgrade to authenticated accounts
3. **Query Optimization**: Indexed queries on (userId, date) with reactive subscriptions
4. **Validation**: Dual-layer (Zod client + Convex server validators)
5. **Migration**: Feature flag approach with localStorage → Convex migration utility

**No Constitution Violations**: All requirements met without compromise.

**Ready for Implementation**: All technical unknowns resolved, design artifacts complete.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
health-log/
├── app/                        # Next.js 16 App Router
│   ├── layout.tsx              # Root layout with fonts and metadata
│   ├── page.tsx                # Dashboard (landing page)
│   ├── symptoms/
│   │   └── page.tsx            # Symptom logging and list view
│   ├── appointments/
│   │   └── page.tsx            # Appointment tracking
│   └── globals.css             # Global styles and CSS variables
│
├── components/                 # React components
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── symptom-heatmap.tsx
│   │   ├── severity-trend-chart.tsx
│   │   └── time-distribution-chart.tsx
│   ├── symptoms/               # Symptom feature components
│   │   ├── symptom-form.tsx
│   │   ├── symptoms-list.tsx
│   │   └── symptom-filters.tsx
│   ├── appointments/           # Appointment feature components
│   │   ├── appointment-form.tsx
│   │   ├── appointments-list.tsx
│   │   └── prepare-for-visit.tsx
│   ├── ui/                     # Reusable UI primitives (Radix-based)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   └── [other UI components]
│   └── navigation.tsx          # Main app navigation
│
├── convex/                     # NEW: Convex backend
│   ├── schema.ts               # Database schema definitions
│   ├── symptoms.ts             # Symptom queries and mutations
│   ├── appointments.ts         # Appointment queries and mutations
│   ├── _generated/             # Convex auto-generated files
│   └── tsconfig.json           # Convex TypeScript config
│
├── lib/                        # Frontend utilities and hooks
│   ├── schemas/                # Zod schemas for client-side validation
│   │   ├── symptom.ts
│   │   └── appointment.ts
│   ├── hooks/                  # MODIFIED: React hooks for Convex integration
│   │   ├── use-symptoms.ts     # Replaces localStorage with Convex queries
│   │   └── use-appointments.ts # Replaces localStorage with Convex queries
│   ├── utils/
│   │   ├── symptom-filters.ts
│   │   └── question-generator.ts
│   └── utils.ts                # General utilities
│
├── __tests__/                  # Test suites
│   ├── lib/
│   │   ├── hooks/              # Hook tests (will be updated for Convex)
│   │   └── utils/              # Utility function tests
│   ├── integration/            # Integration tests
│   └── e2e/                    # Playwright E2E tests
│
├── public/                     # Static assets
├── .specify/                   # SpecKit system files
├── specs/                      # Feature specifications
│   └── 001-health-log/
├── package.json                # Dependencies (will add Convex)
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
├── next.config.ts              # Next.js config
└── CLAUDE.md                   # Project instructions
```

**Structure Decision**:

This is a **Next.js full-stack web application** with Convex as the backend-as-a-service. The architecture separates:

1. **Frontend** (app/, components/, lib/): Next.js App Router with React Server/Client Components
2. **Backend** (convex/): Convex schema, queries, and mutations (TypeScript)
3. **Shared Schemas** (lib/schemas/): Zod schemas for client-side validation that mirror Convex validators

The existing localStorage-based implementation in `lib/storage/` will be **replaced** with Convex hooks in `lib/hooks/`. The current `BaseStorage` class approach will be deprecated in favor of Convex's `useQuery` and `useMutation` React hooks.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
