# Implementation Plan: Healthcare Tracking Application

**Branch**: `001-health-log` | **Date**: 2025-12-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-health-log/spec.md`

## Summary

Build a healthcare tracking application where users can log and organize their medical information across four main sections: Symptoms (daily symptom logging with severity tracking), Medical History (conditions, medications, allergies), Appointments (upcoming visits with AI-generated questions), and Dashboard (symptom analytics and recent activity overview). The application uses Next.js 16 with TypeScript, Tailwind CSS 4, shadcn/ui components, and localStorage for data persistence.

## Technical Context

**Language/Version**: TypeScript 5.x with React 19, Node.js 20+
**Primary Dependencies**: Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui, Zod, React Hook Form
**Storage**: Browser localStorage (5-10MB limit per origin)
**Testing**: Jest + React Testing Library, Playwright for E2E
**Target Platform**: Modern browsers (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+)
**Project Type**: Web application - Next.js App Router architecture
**Performance Goals**: FCP < 1.8s, LCP < 2.5s, TTI < 3.5s, form feedback < 100ms
**Constraints**: 200KB JS bundle (gzipped), 50KB CSS bundle, 10MB per-file upload limit
**Scale/Scope**: Single-user application, ~100 entries per section typical, 4 main sections

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Code Quality First

✅ **PASS** - TypeScript strict mode enforced in tsconfig.json, ESLint configured with Next.js rules, zero `any` types policy established

### II. Testing Standards (NON-NEGOTIABLE)

✅ **PASS** - Test coverage thresholds defined (80% utilities, 90% business logic, 100% validation), Jest + RTL + Playwright configured, all acceptance scenarios in spec.md map to integration tests

### III. User Experience Consistency

✅ **PASS** - shadcn/ui components provide WCAG 2.1 AA compliance, Tailwind theme variables in globals.css, responsive breakpoints defined (mobile-first 375px minimum)

### IV. Performance Requirements

✅ **PASS** - Next.js 16 provides automatic optimization (code splitting, image optimization), performance budgets defined in constitution align with Core Web Vitals, bundle size limits enforced via next.config.js

### V. Data Integrity & Security

✅ **PASS** - Zod schemas for all data validation (client + future server-side), file upload validation (type, size), no sensitive data logging, localStorage with proper error boundaries

**Constitution Check Result**: ✅ ALL GATES PASSED

## Project Structure

### Documentation (this feature)

```text
specs/001-health-log/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output: Technology decisions and rationale
├── data-model.md        # Phase 1 output: Entity schemas and storage structure
├── quickstart.md        # Phase 1 output: Developer setup guide
├── contracts/           # Phase 1 output: TypeScript interfaces
│   └── storage-service.ts
└── tasks.md             # Phase 2 output: NOT created yet (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                    # Root layout with Geist fonts and metadata
├── page.tsx                      # Dashboard with symptom analytics and stats cards
├── globals.css                   # OKLCH color theme and Tailwind base
├── symptoms/
│   └── page.tsx                  # Symptoms list with filtering/sorting
├── medical-history/
│   └── page.tsx                  # Medical History section
├── appointments/
│   └── page.tsx                  # Appointments with AI question generation
└── onboarding/
    └── page.tsx                  # Onboarding flow

components/
├── ui/                           # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── label.tsx
│   ├── dialog.tsx
│   ├── select.tsx
│   ├── table.tsx                 # Table component for data display
│   ├── dropdown-menu.tsx         # Dropdown menu component
│   ├── calendar.tsx
│   ├── popover.tsx
│   ├── date-time-picker.tsx      # Custom date/time picker with future date prevention
│   └── textarea.tsx
├── symptoms/
│   ├── symptom-form.tsx          # Form with 0-10 severity selector and pain icons
│   ├── symptoms-list.tsx         # Table view with severity badges and actions
│   └── symptom-filters.tsx       # Filtering and sorting controls
├── medical-history/
│   ├── condition-form.tsx
│   ├── medication-form.tsx
│   ├── allergy-form.tsx
│   └── medical-history-list.tsx
├── appointments/
│   ├── appointment-form.tsx
│   └── appointments-list.tsx
└── dashboard/
    ├── symptom-frequency-chart.tsx  # Heatmap visualization (30/60/90 days)
    ├── category-breakdown-chart.tsx # Time-of-day distribution chart
    └── storage-warning-banner.tsx   # localStorage capacity warning

lib/
├── storage/
│   ├── base.ts                   # Base storage service with localStorage wrapper
│   ├── symptoms.ts               # Symptom CRUD operations
│   ├── conditions.ts             # Condition CRUD operations
│   ├── medications.ts            # Medication CRUD operations
│   ├── allergies.ts              # Allergy CRUD operations
│   └── appointments.ts           # Appointment CRUD operations
├── schemas/
│   ├── symptom.ts                # Zod schema + TypeScript interface
│   ├── condition.ts              # Zod schema + TypeScript interface
│   ├── medication.ts             # Zod schema + TypeScript interface
│   ├── allergy.ts                # Zod schema + TypeScript interface
│   └── appointment.ts            # Zod schema + TypeScript interface
├── hooks/
│   ├── use-symptoms.ts           # React hook for symptom state with stats
│   ├── use-conditions.ts         # React hook for condition state
│   ├── use-medications.ts        # React hook for medication state
│   ├── use-allergies.ts          # React hook for allergy state
│   └── use-appointments.ts       # React hook for appointment state
└── utils/
    ├── storage.ts                # Generic localStorage utilities
    ├── symptom-filters.ts        # Symptom filtering and sorting logic
    └── question-generator.ts     # AI question generation for appointments

__tests__/
├── components/                   # Component tests (React Testing Library)
│   ├── symptoms/
│   ├── medical-history/
│   ├── appointments/
│   └── dashboard/
├── lib/                          # Unit tests for services/utils
│   ├── storage/
│   ├── schemas/
│   └── utils/
├── integration/                  # Integration tests (user journeys)
│   ├── symptoms.test.tsx
│   ├── medical-history.test.tsx
│   ├── appointments.test.tsx
│   └── dashboard.test.tsx
└── e2e/                          # Playwright E2E tests
    ├── critical-paths.spec.ts
    └── data-persistence.spec.ts
```

**Structure Decision**: Web application using Next.js App Router architecture. The `app/` directory contains route pages following Next.js 16 file-based routing conventions. The `components/` directory separates shadcn/ui primitives from feature-specific components. The `lib/` directory houses all business logic (storage services, Zod schemas, custom hooks, utilities) to keep components thin and focused on presentation. Tests mirror the source structure with separate directories for component, unit, integration, and E2E tests.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all constitution gates passed.
