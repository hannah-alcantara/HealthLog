# Convex Setup Guide (Windows)

## Issue: npx Command Fails on Windows

**Error**: "The system cannot find the path specified"

**Root Cause**: The `npx` command has compatibility issues on some Windows systems with certain packages.

**Solution**: Use `yarn` scripts instead (already configured in package.json)

---

## ✅ Step-by-Step Setup

### 1. Initialize Convex (One-Time Setup)

Open **PowerShell** or **Command Prompt** and run:

```bash
yarn convex:dev
```

This will:
1. Prompt you to log in to Convex (creates free account if needed)
2. Ask you to create a new project
3. Generate `convex.json` with your deployment URL
4. Create `convex/_generated/` directory
5. Start the development server

**Example Output**:
```
? Log in or create an account at https://convex.dev
✔ Saved credentials to ~/.convex/config.json

? What would you like to name your Convex project? › health-log

✔ Created project health-log (https://dashboard.convex.dev/t/your-team/your-project)

Deployment URL: https://your-project.convex.cloud
```

### 2. Create Environment File

Copy the deployment URL from the output above and create `.env.local`:

```bash
# Copy .env.local.example to .env.local
cp .env.local.example .env.local
```

Then edit `.env.local` and add your deployment URL:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

**Important**: Replace `your-project` with your actual project ID from the Convex output.

### 3. Verify Setup

The Convex dev server should now be running and show:

```
✔ Schema pushed
✔ 00:00:00 Convex is running
  Functions: http://localhost:3210
  Dashboard: https://dashboard.convex.dev/t/your-team/your-project
```

Keep this terminal window open!

### 4. Start Next.js Development Server

Open a **second terminal** and run:

```bash
yarn dev
```

You should now have:
- **Terminal 1**: Convex dev server (port 3210)
- **Terminal 2**: Next.js dev server (port 3000)

---

## Development Workflow

### Daily Development

```bash
# Terminal 1: Start Convex (watches for schema/function changes)
yarn convex:dev

# Terminal 2: Start Next.js
yarn dev
```

### Available Commands

```bash
# Initialize/start Convex dev server
yarn convex:dev

# Deploy to production
yarn convex:deploy --prod

# View deployment status
node node_modules/convex/bin/main.js dashboard

# Clear local cache
node node_modules/convex/bin/main.js codegen --clean
```

---

## Troubleshooting

### "convex.json not found"

Run `yarn convex:dev` to initialize Convex.

### "NEXT_PUBLIC_CONVEX_URL is not defined"

1. Check that `.env.local` exists in project root
2. Verify the URL matches your Convex deployment
3. Restart the Next.js dev server (`yarn dev`)

### Changes to schema.ts not detected

1. Make sure `yarn convex:dev` is running
2. Check terminal for errors
3. Try restarting the Convex dev server

### "Failed to connect to Convex"

1. Check that `yarn convex:dev` is running
2. Verify `.env.local` has the correct URL
3. Check network connection
4. Visit Convex dashboard to verify deployment is active

---

## Project Structure

```
health-log/
├── convex/                    # Convex backend
│   ├── schema.ts              # Database tables (symptoms, appointments)
│   ├── symptoms.ts            # Symptom queries and mutations (to be created)
│   ├── appointments.ts        # Appointment queries and mutations (to be created)
│   ├── tsconfig.json          # Convex TypeScript config
│   └── _generated/            # Auto-generated types (gitignored)
│
├── .env.local                 # Environment variables (create this)
├── .env.local.example         # Environment template
└── convex.json                # Convex config (created by convex:dev)
```

---

## Next Steps After Setup

Once Convex is initialized and running:

1. ✅ Phase 1 complete (Convex infrastructure)
2. ⏭️ Phase 2: Create Convex backend functions
   - Symptom queries and mutations
   - Appointment queries and mutations
   - Zod validation schemas
3. ⏭️ Phase 3: Update frontend components to use Convex hooks
   - Replace localStorage with `useQuery` and `useMutation`
   - Add real-time sync functionality

---

## Resources

- [Convex Dashboard](https://dashboard.convex.dev)
- [Convex Documentation](https://docs.convex.dev)
- [Next.js + Convex Guide](https://docs.convex.dev/quickstart/nextjs)
- [Convex React Hooks](https://docs.convex.dev/client/react)
