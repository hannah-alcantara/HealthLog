# Feature Specification: Healthcare Tracking Application

**Feature Branch**: `001-health-log`
**Created**: 2025-12-09
**Status**: Implemented
**Architecture**: Next.js 16, React 19, Convex (database), Clerk (auth), Gemini AI (question generation)

## Summary

A healthcare tracking application focused on **symptom logging** and **appointment preparation**. Users log symptoms with severity ratings, triggers, and notes. The app visualizes symptom patterns through charts and generates AI-powered questions for doctor appointments based on symptom history.

## Key Features Implemented

1. **Symptom Logging** (P1) — Log symptoms with severity (0-10), triggers, notes, and timestamps
2. **Appointment Tracking** (P2) — Track appointments with AI-generated questions based on symptom history
3. **Symptom Dashboard** (P4) — Analytics dashboard with severity trends, time distribution, and heatmap

## Clarifications

### Session 2025-12-09

- Q: AI Question Generation - Where should this feature appear? → A: Integrated into the Appointments section as an optional "Prepare for Next Visit" action that generates questions based on user's symptoms
- Q: AI Question Generation - What data should the AI analyze to generate questions? → A: User's symptom history between appointments
- Q: AI API Integration - Which AI service should be used for generating appointment questions? → A: Initially Gemini (`gemini-2.5-flash`), with Anthropic Claude planned for future release
- Q: Symptoms Input - How should users enter symptoms? → A: Dedicated Symptoms section with structured form (symptom type, severity scale 0-10, triggers, notes, timestamp)
- Q: Generated Questions Storage - How should AI-generated questions be stored and displayed? → A: Saved as `generatedQuestions` field on Appointment entity (array of strings)

## User Stories & Testing

### User Story 1 - Symptom Logging (Priority: P1) 🎯 MVP

Users need to track symptoms with severity ratings, triggers, and notes to identify patterns and prepare for doctor appointments.

**Why this priority**: Symptom tracking is the core value proposition. Without symptom data, the app cannot generate meaningful appointment questions or show health trends.

**Implementation Details**:
- **Symptom Type**: Free text with autocomplete suggestions (headache, fatigue, nausea, etc.)
- **Severity**: Visual scale 0-10 with color-coded buttons (green → yellow → orange → red)
- **Triggers**: Multi-select with common triggers (stress, caffeine, weather, exercise, etc.) + custom trigger support
- **Notes**: Optional free text for context ("worse after eating", "better when lying down")
- **Timestamp**: Date/time picker (defaults to now, cannot be future)

**Data Storage**: Convex database with user isolation via Clerk authentication

**Acceptance Scenarios**:

1. **Given** the user is on the Symptoms page, **When** they log a new symptom with type "Headache", severity 7, trigger "Stress", **Then** the symptom appears in their symptoms list with all details
2. **Given** the user starts typing a symptom type, **When** they type "hea", **Then** autocomplete shows "Headache" as a suggestion
3. **Given** the user has logged symptoms, **When** they view the symptoms list, **Then** symptoms are sorted by date (most recent first) and show severity with color coding
4. **Given** the user clicks on a symptom, **When** they update the severity from 7 to 5, **Then** the change is saved and reflected immediately
5. **Given** the user deletes a symptom, **When** they confirm deletion, **Then** it is removed from the list in real-time
6. **Given** the user is on mobile, **When** they view the symptoms page, **Then** the table switches to a card layout for better readability

**Independent Test**: Log multiple symptoms with varying severities and triggers, edit existing symptoms, delete symptoms, verify data persists across page reloads and updates in real-time.

---

### User Story 2 - Appointment Tracking (Priority: P2)

Users want to track doctor appointments with AI-generated questions based on their symptom history to prepare effectively for visits.

**Why this priority**: Appointments build on symptom data and provide the context for AI question generation. This is the primary use case for the symptom logs.

**Implementation Details**:
- **Appointment Fields**: Date, doctor name, reason, symptoms (optional text), notes (optional)
- **AI Question Generation**:
  - Triggered via "Generate Questions" button on appointment card
  - Analyzes symptoms logged between last appointment and upcoming appointment (or last 30 days if no previous appointment)
  - Uses Gemini `gemini-2.5-flash` model via Convex action
  - Generates 5 conversational questions in natural language
  - Questions saved to `generatedQuestions` array on appointment record
- **Questions Display**: Shows generated questions on appointment detail with ability to regenerate

**Data Storage**: Convex database, AI action uses Gemini API key stored in Convex environment

**Acceptance Scenarios**:

1. **Given** the user is on the Appointments page, **When** they add a new appointment with date, doctor name "Dr. Smith", reason "Annual checkup", **Then** the appointment is saved and appears in chronological order
2. **Given** the user has logged symptoms between appointments, **When** they click "Generate Questions" for an upcoming appointment, **Then** the system generates 5 personalized questions based on symptom patterns
3. **Given** questions have been generated, **When** the user views the appointment, **Then** the questions are displayed in a list format and can be copied/referenced during the visit
4. **Given** the user wants to regenerate questions, **When** they click "Generate Questions" again, **Then** new questions replace the previous ones
5. **Given** the user deletes an appointment, **When** they confirm deletion, **Then** the appointment and its generated questions are removed

**Independent Test**: Create appointments, log symptoms between appointments, generate questions, verify questions reflect symptom patterns, edit/delete appointments.

---

### User Story 3 - Medical History Management (Priority: P3) **[DEFERRED]**

**Status**: Deferred to a future iteration. The app focuses on symptom tracking and appointment preparation for MVP.

Users would track ongoing medical conditions, current medications, and known allergies as foundational information for appointments.

**Why deferred**:
- Symptom logging provides immediate value without requiring users to input extensive medical history first
- MVP focuses on forward-looking symptom tracking rather than retrospective history
- Can be added in future iteration to enhance AI question generation context

---

### User Story 4 - Symptom Dashboard (Priority: P4)

Users want a dashboard showing symptom analytics, upcoming appointments, and quick access to log symptoms.

**Why this priority**: Dashboard is the landing page for authenticated users and provides immediate value through data visualization and insights.

**Implementation Details**:

**Insight Cards** (if sufficient data):
- **Most Frequent Symptom**: Shows most common symptom this month with occurrence count
- **Common Trigger**: Shows trigger most associated with frequent symptom
- **Pattern Alert**: Shows day of week when symptoms peak

**Charts**:
- **Severity Trends**: Line chart showing top 3 symptoms by severity over the past month (weekly averages)
- **Time of Day Distribution**: Bar chart showing when symptoms occur (Morning/Afternoon/Evening/Night) with percentage breakdown
- **Symptom Activity Calendar**: GitHub-style heatmap showing symptom count per day over past 3 months

**Recent Activity**:
- Shows 5 most recent symptom logs with quick edit/delete
- "View All" link to symptoms page if more than 5 exist

**Appointment Card** (if upcoming appointment exists):
- Shows days until next appointment with doctor name
- Indicates if questions have been generated (green badge) or not (gray badge)
- "Generate Questions" button for quick access

**Quick Actions**:
- Floating Action Button (mobile) to log symptom
- Desktop: "Log Symptom" button in header

**Acceptance Scenarios**:

1. **Given** the user has logged symptoms, **When** they view the Dashboard, **Then** they see insight cards showing most frequent symptom, common trigger, and pattern alert
2. **Given** the user has logged multiple symptoms, **When** they view the Dashboard, **Then** they see severity trends chart showing top 3 symptoms over the past month
3. **Given** the user has logged symptoms at different times, **When** they view the Dashboard, **Then** the time distribution chart shows when symptoms occur (morning/afternoon/evening/night)
4. **Given** the user has logged symptoms over 3 months, **When** they view the Dashboard, **Then** the calendar heatmap shows daily symptom activity with color intensity
5. **Given** the user has an upcoming appointment, **When** they view the Dashboard, **Then** they see a countdown card with days until appointment and quick access to generate questions
6. **Given** the user is new with no symptoms logged, **When** they view the Dashboard, **Then** they see an empty state with "No symptoms logged yet" and a call-to-action to log their first symptom
7. **Given** the user opens the app on mobile, **When** they land on the dashboard, **Then** they see a floating "+" button to quickly log a symptom

**Independent Test**: Log multiple symptoms over time, schedule an appointment, verify dashboard updates in real-time, check all charts render correctly with live data.

---

### User Story 5 - Document Management (Priority: P5) **[DEFERRED]**

**Status**: Deferred to a future iteration.

Users would upload and store medical documents (lab results, prescriptions, medical images) for easy reference.

**Why deferred**:
- File uploads add scope complexity
- Core symptom tracking and appointment features provide sufficient MVP value
- Physical/digital documents can be referenced externally until file storage is implemented
- Convex supports file storage, so this can be added in a future iteration

---

## Success Criteria

### Performance (WCAG 2.1 AA)

- **SC-001**: Lighthouse Performance score ≥ 90 ✅ **Achieved: 97**
- **SC-002**: Lighthouse Accessibility score = 100 ⚠️ **Achieved: 96** (contrast issues on severity buttons)
- **SC-003**: First Contentful Paint (FCP) < 1.8s ✅ **Achieved**
- **SC-004**: Largest Contentful Paint (LCP) < 2.5s ✅ **Achieved: 1.9s with server components**

### Usability

- **SC-005**: Dashboard loads in < 1s with 100+ symptoms ⏸️ **Deferred for now** (T067 skipped)
- **SC-006**: Users can log a symptom in ≤ 5 clicks/taps ✅ **Achieved** (FAB → form → save)

### User Experience

- **SC-007**: Mobile responsive (375px minimum width) ✅ **Achieved** (card layouts, responsive tables)
- **SC-008**: Dark mode support ✅ **Achieved** (full theme support via Tailwind)

### Data Integrity

- **SC-009**: Real-time sync across tabs/devices ✅ **Achieved** (Convex reactive queries)
- **SC-010**: No data loss on browser refresh ✅ **Achieved** (Convex persistent storage)

---

## Technical Architecture

### Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Database**: Convex (real-time reactive queries)
- **Authentication**: Clerk (JWT-based auth)
- **AI**: Gemini `gemini-2.5-flash` (via Convex actions)
- **Charts**: Recharts (lazy-loaded)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives + shadcn/ui

### Data Model

**Symptom** (Convex table: `symptoms`):
```typescript
{
  _id: Id<"symptoms">,
  userId: string,              // Clerk user ID
  symptomType: string,         // e.g., "Headache"
  severity: number,            // 0-10
  triggers: string | null,     // Comma-separated
  notes: string | null,
  loggedAt: number,            // Unix timestamp (ms)
  _creationTime: number
}
```

**Appointment** (Convex table: `appointments`):
```typescript
{
  _id: Id<"appointments">,
  userId: string,              // Clerk user ID
  date: number,                // Unix timestamp (ms)
  doctorName: string,
  reason: string,
  symptoms: string | null,     // Optional current symptoms
  notes: string | null,
  generatedQuestions: string[] | null,  // AI-generated questions
  _creationTime: number
}
```

### Real-time Features
- All `useQuery` hooks automatically re-render when data changes (zero polling)
- Optimistic updates for instant UI feedback before server confirmation
- Convex handles conflict resolution automatically

---

## Future Enhancements

1. **Medical History** (User Story 3) — Track conditions, medications, allergies
2. **Document Storage** (User Story 5) — Upload lab results, prescriptions
3. **Export Data** — Download all data as JSON/CSV
4. **Anthropic Claude Integration** — Replace Gemini with Claude for question generation
5. **Multi-language Support** — i18n for symptom types and UI
6. **Reminders** — Push notifications for medication or appointment reminders
