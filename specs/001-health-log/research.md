# Research: Convex Integration for Health Log Application

**Feature**: Healthcare Tracking Application
**Branch**: `001-health-log`
**Date**: 2026-02-06
**Purpose**: Resolve technical unknowns for migrating from localStorage to Convex

---

## Research Questions

1. Convex authentication strategy for health data
2. Convex schema design for symptoms and appointments
3. Convex query optimization patterns
4. Convex testing best practices
5. Migration strategy from localStorage to Convex
6. Convex real-time subscriptions for dashboard

---

## 1. Convex Authentication Strategy

### Decision: Anonymous Authentication with Optional User Accounts

**Rationale**:
- Health data is highly sensitive - users should control whether to create accounts
- Support "try before commit" - users can log symptoms immediately without signup
- Convex supports anonymous sessions that can later be upgraded to authenticated accounts
- Data portability: anonymous data can be migrated to authenticated user when ready

**Implementation Approach**:
```typescript
// convex/auth.config.ts
import { defineAuthConfig } from "@convex-dev/auth/server";

export default defineAuthConfig({
  providers: [
    // Start with anonymous auth for MVP
    // Can add OAuth providers (Google, GitHub) later
  ]
});
```

**Data Ownership**:
- Each symptom/appointment has `userId: v.id("users")` for authenticated users
- For anonymous users: use Convex anonymous auth (creates temporary user ID in browser)
- Convex functions filter by current user automatically: `ctx.auth.getUserIdentity()`
- Session persists in browser cookie - survives page refresh but not browser data clear

**Alternatives Considered**:
- **Required authentication**: Rejected - creates friction for first-time users trying the app
- **Fully public data**: Rejected - health data must be private per-user
- **Device-only storage (localStorage)**: Original approach, replaced by Convex for cross-device sync

---

## 2. Convex Schema Design

### Decision: Document-based schema with embedded relationships

**Symptom Schema**:
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  symptoms: defineTable({
    userId: v.id("users"),           // Owner (authenticated or anonymous)
    symptomType: v.string(),         // e.g., "Headache", "Nausea"
    severity: v.number(),            // 1-10 scale
    bodyPart: v.optional(v.string()),
    triggers: v.optional(v.string()),
    notes: v.optional(v.string()),
    loggedAt: v.number(),            // Unix timestamp
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "loggedAt"]),

  appointments: defineTable({
    userId: v.id("users"),
    date: v.number(),                // Unix timestamp
    doctorName: v.string(),
    reason: v.string(),
    symptoms: v.optional(v.string()), // Freeform text
    notes: v.optional(v.string()),
    generatedQuestions: v.optional(v.array(v.string())),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),
});
```

**Key Design Decisions**:
- **Timestamps as numbers**: Convex uses Unix timestamps (ms) for efficient querying
- **Indexes**: Primary access pattern is "all symptoms/appointments for user, sorted by date"
- **Optional fields**: Convex uses `v.optional()` instead of nullable
- **No separate `createdAt`/`updatedAt`**: Convex provides `_creationTime` system field automatically
- **Embedded arrays**: `generatedQuestions` stored directly (small array, max ~10 questions)

**Validation**:
- Convex validators enforce types at runtime (server-side)
- Client-side Zod schemas remain for form validation (better UX, immediate feedback)
- Both must be kept in sync manually (no automatic schema sharing yet)

---

## 3. Convex Query Optimization

### Decision: Leverage indexes and reactive queries

**Patterns**:

1. **Indexed Queries** (Fast):
```typescript
// convex/symptoms.ts
import { query } from "./_generated/server";

export const getSymptomsByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Uses index "by_user_and_date" for O(log n + k) lookup
    return await ctx.db
      .query("symptoms")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", identity.subject)
      )
      .order("desc") // Most recent first
      .take(100);     // Limit for dashboard
  },
});
```

2. **Reactive Subscriptions** (Real-time):
```typescript
// Frontend: components/symptoms/symptoms-list.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SymptomsList() {
  const symptoms = useQuery(api.symptoms.getSymptomsByUser);
  // Auto-updates when data changes (no polling needed)

  if (symptoms === undefined) {
    return <LoadingSkeleton />;
  }

  return <div>{/* Render symptoms */}</div>;
}
```

3. **Pagination for Large Datasets**:
```typescript
// For users with 500+ symptoms
export const getSymptomsPaginated = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { page: [], continueCursor: null };

    return await ctx.db
      .query("symptoms")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
      .paginate(args.paginationOpts);
  },
});
```

**Performance Targets**:
- Dashboard query (last 30 symptoms): <50ms
- Symptom filters (client-side on already-loaded data): <10ms
- Chart aggregations (7/30 day ranges): <100ms

---

## 4. Convex Testing Best Practices

### Decision: Component tests + Convex function tests + E2E

**Testing Layers**:

1. **Convex Function Tests** (Unit):
```typescript
// convex/symptoms.test.ts (using Convex testing utilities)
import { convexTest } from "convex-test";
import { api } from "./_generated/api";
import schema from "./schema";

test("should create symptom with valid data", async () => {
  const t = convexTest(schema);

  const symptomId = await t.mutation(api.symptoms.create, {
    symptomType: "Headache",
    severity: 7,
    loggedAt: Date.now(),
  });

  const symptom = await t.query(api.symptoms.getById, { id: symptomId });
  expect(symptom?.symptomType).toBe("Headache");
});
```

2. **React Component Tests** (Integration):
```typescript
// __tests__/components/symptoms/symptom-form.test.tsx
import { render, screen } from "@testing-library/react";
import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import SymptomForm from "@/components/symptoms/symptom-form";

test("should submit symptom form", async () => {
  // Mock Convex client for tests
  const mockConvex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

  render(
    <ConvexProvider client={mockConvex}>
      <SymptomForm />
    </ConvexProvider>
  );

  // Test form interaction...
});
```

3. **E2E Tests** (Critical paths):
```typescript
// __tests__/e2e/symptom-logging.spec.ts
import { test, expect } from "@playwright/test";

test("should log symptom and see it in dashboard", async ({ page }) => {
  await page.goto("/symptoms");
  await page.fill('[name="symptomType"]', 'Headache');
  await page.fill('[name="severity"]', '7');
  await page.click('button[type="submit"]');

  await page.goto("/");
  await expect(page.locator('text=Headache')).toBeVisible();
});
```

**Coverage Strategy**:
- **100%** Convex mutation/query functions (business logic)
- **90%** React components using Convex hooks
- **80%** Utility functions (filters, generators)
- **E2E** for: symptom logging → dashboard, appointment creation → question generation

**Mocking Approach**:
- Use `convex-test` for Convex function tests (real schema, in-memory DB)
- Mock Convex React hooks for component tests (`vi.mock('convex/react')`)
- No mocking for E2E (test against Convex dev deployment)

---

## 5. Migration Strategy from localStorage to Convex

### Decision: Dual-write transition with user-initiated migration

**Migration Phases**:

**Phase 1: Install Convex alongside localStorage**
```bash
npm install convex @convex-dev/auth
npx convex dev
```
- Deploy schema without touching localStorage code
- No data migration yet

**Phase 2: Implement Convex hooks with feature flag**
```typescript
// lib/hooks/use-symptoms.ts
const USE_CONVEX = process.env.NEXT_PUBLIC_USE_CONVEX === 'true';

export function useSymptoms() {
  if (USE_CONVEX) {
    return useConvexSymptoms(); // New implementation
  }
  return useLocalStorageSymptoms(); // Existing implementation
}
```

**Phase 3: One-time migration prompt**
```typescript
// components/migration-banner.tsx
export function MigrationBanner() {
  const hasLocalData = checkLocalStorage();
  const [migrated, setMigrated] = useState(false);

  async function migrate() {
    const symptoms = JSON.parse(localStorage.getItem('health-log:symptoms') || '[]');
    const appointments = JSON.parse(localStorage.getItem('health-log:appointments') || '[]');

    // Batch upload to Convex
    await Promise.all([
      ...symptoms.map(s => createSymptom.mutate(s)),
      ...appointments.map(a => createAppointment.mutate(a)),
    ]);

    // Clear localStorage after successful migration
    localStorage.removeItem('health-log:symptoms');
    localStorage.removeItem('health-log:appointments');
    setMigrated(true);
  }

  if (!hasLocalData || migrated) return null;

  return (
    <Banner>
      <p>Migrate your local data to cloud storage?</p>
      <button onClick={migrate}>Migrate Now</button>
    </Banner>
  );
}
```

**Phase 4: Remove localStorage code**
- After migration period (e.g., 2 weeks), remove feature flag
- Delete `lib/storage/` directory
- Remove localStorage tests

**Rollback Plan**:
- Keep localStorage code for 2 weeks
- Feature flag allows instant rollback if Convex issues
- Export function to download data as JSON backup

---

## 6. Convex Real-time Subscriptions for Dashboard

### Decision: Use reactive queries with automatic updates

**Implementation**:
```typescript
// components/dashboard/symptom-heatmap.tsx
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SymptomHeatmap() {
  // Automatically re-renders when new symptoms are logged
  const symptoms = useQuery(api.symptoms.getRecentSymptoms, {
    days: 30
  });

  if (symptoms === undefined) {
    return <LoadingSkeleton />;
  }

  const heatmapData = processHeatmapData(symptoms);
  return <HeatmapChart data={heatmapData} />;
}
```

**Benefits**:
- **Zero polling**: Convex pushes updates via WebSocket
- **Optimistic updates**: Mutations show UI changes immediately
- **Offline support**: Convex queues mutations when offline
- **Conflict resolution**: Last-write-wins for health data (appropriate for single-user)

**Performance Considerations**:
- Convex queries are memoized (won't re-fetch if already subscribed)
- Multiple components can subscribe to same query (shared subscription)
- Dashboard should limit queries to recent data (last 30 days) to avoid large payloads

---

## Summary of Decisions

| Question | Decision | Key Rationale |
|----------|----------|---------------|
| Authentication | Anonymous + optional accounts | Low friction, data privacy |
| Schema design | Document-based with indexes | Aligns with Convex best practices |
| Query optimization | Indexed queries + reactive subscriptions | Fast lookups, real-time updates |
| Testing strategy | 3-layer: Convex unit + React integration + E2E | 100% backend coverage, 90% frontend |
| Migration approach | Feature flag + one-time migration prompt | Safe rollback, user control |
| Real-time updates | Reactive useQuery hooks | Zero polling, automatic UI updates |

---

## Technology Stack Summary

**Frontend**:
- Next.js 16 (App Router)
- React 19
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- Radix UI components
- Zod (client-side validation)
- React Hook Form
- Recharts (data visualization)

**Backend**:
- Convex (BaaS with real-time sync)
- TypeScript for Convex functions
- Convex validators (server-side validation)
- Convex auth (anonymous + optional accounts)

**Testing**:
- Jest + React Testing Library (unit/integration)
- Convex Test (backend function tests)
- Playwright (E2E)

---

## Next Steps (Phase 1)

1. ✅ Generate `data-model.md` with Convex schema definitions
2. ✅ Create `contracts/` directory with Convex function signatures
3. ✅ Generate `quickstart.md` with Convex setup instructions
4. ✅ Update agent context files with Convex technology
