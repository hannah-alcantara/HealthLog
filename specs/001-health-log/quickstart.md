# Quickstart: Healthcare Tracking Application with Convex

**Feature**: Healthcare Tracking Application
**Branch**: `001-health-log`
**Date**: 2026-02-06

## Prerequisites

- Node.js 20+ installed
- Yarn package manager
- Modern browser for testing (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+)
- Convex account (free tier: https://www.convex.dev/)

## Installation

### 1. Install Convex

```bash
# Install Convex globally
npm install -g convex

# Initialize Convex in the project
npx convex dev

# This will:
# - Create convex/ directory
# - Generate convex.json config
# - Start Convex development server
# - Provide deployment URL (save this for .env.local)
```

### 2. Install Dependencies

```bash
# Convex client libraries
yarn add convex @convex-dev/auth

# Form handling and validation (already installed)
# yarn add react-hook-form @hookform/resolvers zod

# UI components (Radix UI - already installed)
# Recharts for charts (already installed)
```

### 3. Configure Environment Variables

Create `.env.local` in project root:

```bash
# Convex deployment URL (from npx convex dev output)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Feature flag for gradual migration
NEXT_PUBLIC_USE_CONVEX=true
```

### 4. Update Next.js Config

Add to `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ... existing config

  // Enable Convex
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
```

### 5. Install Testing Dependencies

```bash
# Convex testing utilities
yarn add -D convex-test

# Jest and React Testing Library (already installed)
# Playwright for E2E tests (already installed)
```

## Convex Setup

### 1. Create Schema (`convex/schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  symptoms: defineTable({
    userId: v.id("users"),
    symptomType: v.string(),
    severity: v.number(),
    bodyPart: v.optional(v.string()),
    triggers: v.optional(v.string()),
    notes: v.optional(v.string()),
    loggedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "loggedAt"]),

  appointments: defineTable({
    userId: v.id("users"),
    date: v.number(),
    doctorName: v.string(),
    reason: v.string(),
    symptoms: v.optional(v.string()),
    notes: v.optional(v.string()),
    generatedQuestions: v.optional(v.array(v.string())),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "date"]),
});
```

### 2. Create Symptom Functions (`convex/symptoms.ts`)

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query: Get all symptoms
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return await ctx.db
      .query("symptoms")
      .withIndex("by_user_and_date", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
  },
});

// Mutation: Create symptom
export const create = mutation({
  args: {
    symptomType: v.string(),
    severity: v.number(),
    bodyPart: v.optional(v.string()),
    triggers: v.optional(v.string()),
    notes: v.optional(v.string()),
    loggedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("symptoms", {
      userId: identity.subject as any,
      ...args,
    });
  },
});

// Add update and remove mutations...
```

### 3. Create Appointment Functions (`convex/appointments.ts`)

Similar structure to symptoms.ts (see [data-model.md](./data-model.md) for full implementation).

### 4. Setup Convex Provider (`app/layout.tsx`)

```typescript
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      </body>
    </html>
  );
}
```

## Implementation Phases

### Phase 0: Convex Setup (CRITICAL)
1. Run `npx convex dev` and save deployment URL
2. Create `convex/schema.ts` with symptoms and appointments tables
3. Push schema: `npx convex deploy` (or auto-deploys with `npx convex dev`)
4. Verify schema in Convex dashboard: https://dashboard.convex.dev
5. Add ConvexProvider to `app/layout.tsx`

### Phase 1: Symptom Feature (Test-First)
**Goal**: Implement symptom logging with Convex backend

**Order**:
1. **Convex Backend**:
   - Create `convex/symptoms.ts` with queries and mutations
   - Write tests using `convex-test` (see [research.md](./research.md) for examples)
   - Deploy: `npx convex deploy`

2. **Client-side Zod Schemas** (`lib/schemas/symptom.ts`):
   - Create Zod schema for form validation
   - Write unit tests for schema validation rules
   - Ensure Convex validators and Zod schemas are in sync

3. **React Components**:
   - Update `components/symptoms/symptom-form.tsx` to use Convex `useMutation`
   - Update `components/symptoms/symptoms-list.tsx` to use Convex `useQuery`
   - Write component tests with mocked Convex client
   - Update `app/symptoms/page.tsx`

4. **Integration Tests**:
   - Test full symptom logging flow
   - Verify real-time updates (add symptom → automatically appears in list)
   - Test optimistic updates

**Testing**:
```bash
# Convex function tests
yarn test convex/symptoms.test.ts

# Component tests
yarn test components/symptoms

# E2E tests (uses Convex dev deployment)
yarn test:e2e symptom-logging.spec.ts
```

### Phase 2: Appointments Feature
**Goal**: Implement appointment tracking with Convex

**Order**: Same as Phase 1, but for appointments
- Create `convex/appointments.ts`
- Update components to use Convex hooks
- Test appointment creation, editing, and question generation

### Phase 3: Dashboard Analytics
**Goal**: Create dashboard with real-time symptom stats

**Order**:
1. Create Convex queries for dashboard data aggregation
2. Update dashboard components to use reactive Convex queries
3. Implement charts with automatic updates (zero polling)
4. Test real-time dashboard updates

### Phase 4: Migration from localStorage
**Goal**: Migrate existing localStorage data to Convex

**Order**:
1. Create migration utility (`lib/utils/migrate-to-convex.ts`)
2. Add migration banner component
3. Test migration with sample localStorage data
4. Document rollback procedure

**Migration Script** (see [research.md](./research.md) for full implementation):
```typescript
import { api } from "@/convex/_generated/api";

export async function migrateLocalStorageToConvex(convex) {
  const symptomsRaw = localStorage.getItem('health-log:symptoms');

  if (symptomsRaw) {
    const symptoms = JSON.parse(symptomsRaw);
    for (const symptom of symptoms) {
      await convex.mutation(api.symptoms.create, {
        symptomType: symptom.symptomType,
        severity: symptom.severity,
        loggedAt: new Date(symptom.loggedAt).getTime(),
        // ... other fields
      });
    }
  }

  // Clear localStorage after successful migration
  localStorage.removeItem('health-log:symptoms');
}
```

### Phase 5: Authentication (Optional for MVP)
**Goal**: Add Convex anonymous authentication

**Order**:
1. Install `@convex-dev/auth`: `yarn add @convex-dev/auth`
2. Configure auth in `convex/auth.config.ts`
3. Update queries/mutations to use `ctx.auth.getUserIdentity()`
4. Test anonymous sessions persist across page reloads

### Phase 6: Performance Optimization
**Goal**: Meet performance budgets with Convex

**Optimizations**:
- Use Convex pagination for large datasets (500+ symptoms)
- Limit dashboard queries to last 30 days
- Implement client-side filtering for instant search
- Use Convex's automatic memoization (queries are cached)

**Testing**: Lighthouse audit with Convex data
- Performance ≥ 90
- Accessibility = 100
- Best Practices ≥ 90

## Development Workflow

### Starting Development

```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start Next.js dev server
yarn dev

# Terminal 3: Run tests in watch mode
yarn test:watch
```

### Convex Dashboard

Monitor your database in real-time:
- Open: https://dashboard.convex.dev
- View tables, run queries, inspect logs
- Debug function errors in real-time

### Running Tests

```bash
# Unit tests (Zod schemas, utilities)
yarn test lib/

# Convex function tests
yarn test convex/

# Component tests
yarn test components/

# E2E tests (uses Convex dev deployment)
yarn test:e2e

# All tests with coverage
yarn test:coverage
```

### Convex Commands

```bash
# Start dev server (auto-deploys on save)
npx convex dev

# Deploy to production
npx convex deploy --prod

# View function logs
npx convex logs

# Reset database (DEV ONLY - DESTRUCTIVE)
npx convex data delete symptoms --all
```

## Troubleshooting

### Convex Connection Issues

**Problem**: "Failed to connect to Convex"
**Solution**:
1. Check `.env.local` has correct `NEXT_PUBLIC_CONVEX_URL`
2. Ensure `npx convex dev` is running
3. Verify deployment exists in Convex dashboard

### Schema Sync Issues

**Problem**: Convex validators don't match Zod schemas
**Solution**:
1. Compare `convex/schema.ts` with `lib/schemas/*.ts`
2. Update both manually (no auto-sync yet)
3. Run tests to verify both sides validate correctly

### Migration Failures

**Problem**: localStorage migration fails partway through
**Solution**:
1. Migration script should be idempotent (check if data already exists)
2. Don't clear localStorage until ALL data is successfully migrated
3. Provide export to JSON as backup before migration

### Test Failures with Convex

**Common issues**:
- **Mock Convex hooks**: Use `vi.mock('convex/react')` for component tests
- **Convex dev server**: Ensure running for E2E tests
- **Async queries**: Use `waitFor` from React Testing Library

## Pre-Commit Checklist

- [ ] All tests passing: `yarn test`
- [ ] Convex functions deployed: `npx convex deploy`
- [ ] Schema matches validators and Zod schemas
- [ ] ESLint passing: `yarn lint`
- [ ] TypeScript compiling: `yarn build`
- [ ] E2E tests passing: `yarn test:e2e`

## Resources

### Convex Documentation
- [Convex Quickstart](https://docs.convex.dev/quickstart)
- [Convex React Integration](https://docs.convex.dev/client/react)
- [Convex Schema Design](https://docs.convex.dev/database/schemas)
- [Convex Authentication](https://docs.convex.dev/auth)
- [Convex Testing](https://docs.convex.dev/functions/testing)

### Project Documentation
- [research.md](./research.md) - Convex architecture decisions
- [data-model.md](./data-model.md) - Schema definitions and examples
- [contracts/](./contracts/) - API contracts for Convex functions
- [CLAUDE.md](../../CLAUDE.md) - Project-wide conventions

### Next.js & React
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Zod Documentation](https://zod.dev)
- [React Hook Form Documentation](https://react-hook-form.com)

## Next Steps After Implementation

1. Run `/speckit.tasks` to generate task breakdown
2. Run `/speckit.implement` to execute tasks
3. Run `/speckit.analyze` to validate consistency
4. Create pull request with:
   - Lighthouse scores
   - Test coverage reports
   - Convex deployment link
