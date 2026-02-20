# Quickstart: Healthcare Tracking Application with Convex

**Feature**: Healthcare Tracking Application
**Branch**: `001-health-log`
**Date**: 2026-02-06

## Prerequisites

- Node.js 20+ installed
- Yarn package manager
- Modern browser for testing (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+)
- Convex account (free tier: https://www.convex.dev/)
- Clerk account (free tier: https://clerk.com/)

## Installation

### 1. Install Dependencies

```bash
yarn install
```

### 2. Configure Environment Variables

Create `.env.local` in project root:

```bash
# Convex deployment URL (from Convex dashboard)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk authentication keys (from Clerk dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Gemini API key (for AI question generation)
# Note: Anthropic integration planned for a future release
GEMINI_API_KEY=AIza...
```

### 3. Set Up Convex

```bash
# Initialize Convex (first time only)
npx convex dev

# This will:
# - Create convex/ directory with generated types
# - Start the Convex development server
# - Auto-deploy schema changes on save
```

### 4. Configure Clerk + Convex JWT

In your Clerk dashboard, add a JWT template named `convex` with the following claims:

```json
{
  "sub": "{{user.id}}"
}
```

In your Convex dashboard, add the Clerk issuer URL to the auth configuration.

## Development Workflow

### Starting Development

```bash
# Terminal 1: Start Convex dev server (auto-deploys on save)
npx convex dev

# Terminal 2: Start Next.js dev server
yarn dev
```

Then open http://localhost:3000.

### Convex Dashboard

Monitor your database in real-time:
- Open: https://dashboard.convex.dev
- View tables, run queries, inspect logs
- Debug function errors in real-time

### Convex Commands

```bash
# Start dev server (auto-deploys on save)
npx convex dev

# Deploy to production
npx convex deploy --prod

# View function logs
npx convex logs
```

## Architecture Overview

### Data Flow

1. User authenticates via Clerk
2. Clerk JWT is passed to Convex via `ConvexProviderWithClerk`
3. Convex functions verify identity with `ctx.auth.getUserIdentity()`
4. All queries/mutations are scoped to `identity.subject` (Clerk user ID)
5. React components use `useQuery` / `useMutation` for real-time reactive data

### Key Files

```
app/
  layout.tsx              # ClerkProvider + ConvexProviderWithClerk
  page.tsx                # Server component — routes auth vs landing page
convex/
  schema.ts               # Database schema (symptoms + appointments tables)
  symptoms.ts             # Symptom queries and mutations
  appointments.ts         # Appointment queries and mutations
  ai.ts                   # Anthropic AI action for question generation
lib/
  hooks/
    use-symptoms.ts       # useQuery wrapper for symptoms
    use-appointments.ts   # useQuery wrapper for appointments
  schemas/
    symptom.ts            # Zod validation schema
    appointment.ts        # Zod validation schema
components/
  convex-client-provider.tsx   # ConvexProviderWithClerk setup
  convex-error-boundary.tsx    # Error boundary for connection failures
  convex-status.tsx            # Connection status indicator
```

## Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  symptoms: defineTable({
    userId: v.string(),          // Clerk user ID (identity.subject)
    symptomType: v.string(),
    severity: v.number(),
    triggers: v.optional(v.string()),
    notes: v.optional(v.string()),
    loggedAt: v.number(),        // Unix timestamp (ms)
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "loggedAt"]),

  appointments: defineTable({
    userId: v.string(),          // Clerk user ID (identity.subject)
    date: v.number(),            // Unix timestamp (ms)
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

## Convex Function Patterns

### Query Pattern

```typescript
// convex/symptoms.ts
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
```

### Mutation Pattern

```typescript
export const create = mutation({
  args: {
    symptomType: v.string(),
    severity: v.number(),
    triggers: v.optional(v.string()),
    notes: v.optional(v.string()),
    loggedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    return await ctx.db.insert("symptoms", {
      userId: identity.subject,
      ...args,
    });
  },
});
```

### React Hook Pattern

```typescript
// lib/hooks/use-symptoms.ts
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useSymptoms() {
  const symptoms = useQuery(api.symptoms.getAll) ?? [];
  const createMutation = useMutation(api.symptoms.create);

  const create = async (data: CreateSymptomInput) => {
    await createMutation(data);
  };

  return { symptoms, create, loading: symptoms === undefined };
}
```

## AI Question Generation

The app uses Google Gemini (`gemini-2.5-flash`) to generate appointment questions. The action runs server-side via Convex:

```typescript
// convex/ai.ts
export const generateAppointmentQuestions = action({
  args: {
    appointmentSymptoms: v.optional(v.string()),
    appointmentDate: v.number(),
    startDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Fetches symptoms between the last and next appointment
    // Calls Gemini API to generate 5 personalized doctor questions
    // Returns string[]
  },
});
```

The `GEMINI_API_KEY` environment variable must be set in the Convex dashboard (not just `.env.local`) for production use:

```bash
npx convex env set GEMINI_API_KEY AIza...
```

> **Note**: Anthropic Claude integration is planned for a future release.

## Troubleshooting

### Convex Connection Issues

**Problem**: "Failed to connect to Convex"
**Solution**:
1. Check `.env.local` has correct `NEXT_PUBLIC_CONVEX_URL`
2. Ensure `npx convex dev` is running
3. Verify deployment exists in Convex dashboard

### Auth Issues

**Problem**: Queries return empty / mutations throw "Unauthorized"
**Solution**:
1. Verify Clerk JWT template named `convex` exists in Clerk dashboard
2. Check Clerk issuer URL is configured in Convex auth settings
3. Ensure `ConvexProviderWithClerk` wraps the app in `app/layout.tsx`

### Schema Sync Issues

**Problem**: TypeScript errors on Convex function args
**Solution**:
1. Run `npx convex dev` to regenerate types in `convex/_generated/`
2. Ensure `convex/schema.ts` matches the validators in your functions
3. Zod schemas in `lib/schemas/` are client-side only — keep them in sync with Convex validators manually

### AI Generation Not Working

**Problem**: `generateAppointmentQuestions` action fails
**Solution**:
1. Set `GEMINI_API_KEY` in Convex environment: `npx convex env set GEMINI_API_KEY AIza...`
2. Check Convex function logs: `npx convex logs`
3. Verify the key has access to `gemini-2.5-flash`

## Pre-Deploy Checklist

- [ ] `npx convex deploy --prod` — deploy Convex functions to production
- [ ] Convex env vars set: `GEMINI_API_KEY`
- [ ] Clerk JWT template `convex` configured
- [ ] Clerk production keys in hosting environment variables
- [ ] `NEXT_PUBLIC_CONVEX_URL` points to production deployment
- [ ] `yarn build` passes with no errors
- [ ] `yarn lint` passes with no warnings

## Resources

### Convex Documentation
- [Convex Quickstart](https://docs.convex.dev/quickstart)
- [Convex React Integration](https://docs.convex.dev/client/react)
- [Convex Schema Design](https://docs.convex.dev/database/schemas)
- [Convex + Clerk Auth](https://docs.convex.dev/auth/clerk)

### Project Documentation
- [research.md](./research.md) - Architecture decisions
- [data-model.md](./data-model.md) - Schema definitions
- [contracts/](./contracts/) - API contracts for Convex functions
- [CLAUDE.md](../../CLAUDE.md) - Project-wide conventions

### Next.js & React
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [React 19 Documentation](https://react.dev)
- [Zod Documentation](https://zod.dev)
- [React Hook Form Documentation](https://react-hook-form.com)
