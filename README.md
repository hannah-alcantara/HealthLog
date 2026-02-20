# HealthLog 🏥

A modern health tracking application that helps you log symptoms, track appointments, and prepare for doctor visits with AI-generated questions.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![Convex](https://img.shields.io/badge/Convex-Backend-orange)

## ✨ Features

### 📊 Symptom Tracking
- **Visual Severity Scale**: Rate symptoms 0-10 with color-coded buttons
- **Trigger Tracking**: Multi-select common triggers (stress, caffeine, sleep, etc.) + custom triggers
- **Timeline View**: Sort and filter symptoms by date, severity, or type
- **Detailed Notes**: Add context to each symptom log
- **Mobile Responsive**: Card layout on mobile, table on desktop

### 📅 Appointment Management
- **Schedule Tracking**: Keep track of upcoming doctor appointments
- **Doctor Information**: Record doctor name, appointment date, reason for visit
- **Appointment History**: View past and future appointments chronologically

### 🤖 AI-Powered Question Generation
- **Smart Analysis**: Gemini AI analyzes symptom patterns between appointments
- **Personalized Questions**: Generates 5 conversational questions based on your symptom history
- **Editable Output**: Review and customize AI-generated questions before saving
- **Context-Aware**: Considers frequency, severity, triggers, and timing patterns

### 📈 Analytics Dashboard
- **Severity Trends**: Line chart showing top 3 symptoms over the past month
- **Time Distribution**: Bar chart showing when symptoms occur (morning/afternoon/evening/night)
- **Activity Heatmap**: GitHub-style calendar showing symptom frequency over 3 months
- **Insight Cards**: Most frequent symptom, common triggers, pattern alerts
- **Quick Actions**: Floating action button (mobile) for fast symptom logging

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Convex](https://convex.dev/) (real-time reactive queries)
- **Authentication**: [Clerk](https://clerk.com/) (JWT-based)
- **AI**: [Google Gemini 2.0 Flash](https://ai.google.dev/gemini-api) (question generation)
- **Charts**: [Recharts](https://recharts.org/) (lazy-loaded)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation
- **Deployment**: [Vercel](https://vercel.com/) (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ (required for Convex CLI)
- Yarn package manager
- Accounts for:
  - [Clerk](https://clerk.com/) (authentication)
  - [Convex](https://convex.dev/) (database)
  - [Google AI Studio](https://aistudio.google.com/) (Gemini API)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hannah-alcantara/HealthLog.git
   cd HealthLog
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   # Convex
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Clerk Redirect URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

   # Gemini API Key (for AI question generation)
   # Note: This is set in Convex environment, not Next.js
   GEMINI_API_KEY=AIza...
   ```

4. **Set up Convex**

   ```bash
   # Initialize Convex (first time)
   npx convex dev

   # In a separate terminal, set Gemini API key in Convex
   npx convex env set GEMINI_API_KEY AIza...
   ```

5. **Run development server**

   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy Convex Backend**

   Option A: Via Dashboard (recommended if Node.js < 20)
   - Go to https://dashboard.convex.dev/
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add `GEMINI_API_KEY` for production

   Option B: Via CLI (requires Node.js 20+)
   ```bash
   npx convex deploy --prod
   npx convex env set GEMINI_API_KEY AIza... --prod
   ```

3. **Deploy to Vercel**

   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hannah-alcantara/HealthLog)

   Set these environment variables in Vercel:
   - `NEXT_PUBLIC_CONVEX_URL` - Your Convex production URL
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/`

4. **Update Clerk Settings**
   - Go to Clerk Dashboard → **Settings** → **Allowed Origins**
   - Add your Vercel production URL (e.g., `https://health-log.vercel.app`)

## 📁 Project Structure

```
health-log/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout (Clerk provider, fonts)
│   ├── page.tsx             # Landing page / Dashboard (server component)
│   ├── appointments/        # Appointments page
│   ├── symptoms/            # Symptoms page + [id] detail
│   └── globals.css          # Global styles & theme variables
├── components/              # React components
│   ├── ui/                  # shadcn/ui primitives
│   ├── appointments/        # Appointment-specific components
│   ├── symptoms/            # Symptom-specific components
│   └── dashboard/           # Dashboard charts & widgets
├── convex/                  # Convex backend
│   ├── schema.ts            # Database schema (symptoms, appointments)
│   ├── symptoms.ts          # Symptom queries & mutations
│   ├── appointments.ts      # Appointment queries & mutations
│   └── ai.ts                # Gemini AI integration
├── lib/                     # Utilities
│   ├── hooks/               # Custom React hooks
│   ├── schemas/             # Zod validation schemas
│   └── utils.ts             # Helper functions
└── specs/                   # Feature specifications & planning docs
```

## 🔑 Key Features Explained

### Real-time Sync
All data updates propagate instantly across tabs/devices using Convex's reactive queries. No polling or manual refresh needed.

### AI Question Generation
The Gemini AI analyzes:
- Symptom frequency and severity trends
- Common triggers across symptoms
- Temporal patterns (time of day, day of week)
- Time since last appointment

It generates 5 conversational questions like:
> "I've been getting headaches 3-4 times a week lately — could stress be a trigger?"

### Performance Optimizations
- **Lighthouse Performance**: 97/100
- **Lighthouse Accessibility**: 96/100
- Server component for landing page (no auth JS on unauthenticated views)
- Lazy-loaded charts and forms with `next/dynamic`
- Font optimization with `next/font` and `display: swap`

## 🧪 Testing

```bash
# Run type checking
yarn type-check

# Run linter
yarn lint

# Build production bundle
yarn build
```

## 📊 Data Model

### Symptoms Table
```typescript
{
  userId: string              // Clerk user ID
  symptomType: string         // e.g., "Headache"
  severity: number            // 0-10 scale
  triggers: string | null     // Comma-separated
  notes: string | null
  loggedAt: number            // Unix timestamp (ms)
}
```

### Appointments Table
```typescript
{
  userId: string                    // Clerk user ID
  date: number                      // Unix timestamp (ms)
  doctorName: string
  reason: string
  symptoms: string | null           // Freeform current symptoms
  notes: string | null
  generatedQuestions: string[] | null  // AI-generated questions
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Fonts**: [Manrope](https://fonts.google.com/specimen/Manrope) & [Roboto Mono](https://fonts.google.com/specimen/Roboto+Mono)
- **AI**: [Google Gemini](https://ai.google.dev/)

## 📧 Contact

Hannah Alcantara - [@hannah-alcantara](https://github.com/hannah-alcantara)

Project Link: [https://github.com/hannah-alcantara/HealthLog](https://github.com/hannah-alcantara/HealthLog)

---

Built with ❤️ using Next.js and Convex
