# Business Dashboard - Project Guidelines

## Project Overview

Analytics + operations dashboard template for small businesses acquired in the 50–100k range.  
Primary goal: standardize unit economics, retention, marketing, journaling, and portfolio tracking across acquisitions.

Built as a full‑stack React Router app with TypeScript, TailwindCSS, and Neon/PostgreSQL.

## Tech Stack

- **Framework**: React Router 7.12.0 (full-stack with server-side rendering)
- **Language**: TypeScript
- **UI Library**: React 19.2.4
- **Styling**: TailwindCSS 4.1.13
- **Forms**: React Hook Form 7.71.1 + React Router Form component
- **State Management**: Zustand 5.0.11
- **Charts**: Recharts 3.7.0
- **Icons**: Lucide React 0.563.0
- **Database**: Neon PostgreSQL (serverless)
- **Build Tool**: Vite 7.1.7
- **Runtime**: Node.js (React Router/Node)

## Project Structure

```
business_dashboard/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── ActionButton.tsx
│   │   ├── ExpandableCard.tsx
│   │   ├── HealthIndicator.tsx
│   │   ├── Layout.tsx       # Main layout wrapper
│   │   ├── MetricComparison.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SparklineChart.tsx
│   │   └── StatCard.tsx
│   ├── data/                # Mock/sample data
│   │   ├── briefing.ts
│   │   ├── experiments.ts
│   │   ├── financials.ts
│   │   ├── journal.ts
│   │   └── portfolio.ts
│   ├── lib/                 # Server utilities
│   │   ├── db.ts            # Database connection (Neon)
│   │   └── journal.server.ts # Journal CRUD operations
│   ├── routes/              # Page routes
│   │   ├── journal.tsx      # Journal entries with CRUD
│   │   ├── experiments.tsx
│   │   ├── financials.tsx
│   │   └── root.tsx         # Root layout
│   └── root.tsx             # App entry point
├── public/                  # Static assets
├── scripts/
│   └── migrate.ts           # Database migration script
├── build/                   # Production build output
├── package.json
├── tsconfig.json
├── vite.config.ts
├── react-router.config.ts
├── JOURNAL_CRUD.md          # Journal feature documentation
└── CLAUDE.md               # This file
```

## Key Features

### 1. **Journal** (`app/routes/journal.tsx`)
- Create, read, delete journal entries
- Fields: business, hypothesis, shipped, learned, blockers, tomorrow, tags
- Search and filter by business
- Database-backed with Neon PostgreSQL
- Real-time UI with optimistic updates

### 2. **Financials** (`app/routes/financials.tsx`)
- Financial tracking and analysis
- Charts and metrics visualization

### 3. **Experiments** (`app/routes/experiments.tsx`)
- Track business experiments and hypotheses
- Monitor results and learnings

### 4. **Portfolio**
- Portfolio/asset tracking
- Health indicators and progress tracking

## Development Workflow

### Installation & Setup

```bash
npm install
npm run migrate          # Initialize database (first time only)
npm run dev            # Start development server
npm run build          # Production build
npm run typecheck      # Type checking
```

### Environment Variables

Create a `.env` file at the root:

```
DATABASE_URL='postgresql://user:password@host/database?sslmode=require&channel_binding=require'
```

### Database

**Connection**: Neon serverless PostgreSQL via `@neondatabase/serverless`

**Schema** (`journal_entries` table):
- `id` (serial primary key)
- `business` (varchar, nullable)
- `hypothesis` (text)
- `shipped` (text)
- `learned` (text)
- `blockers` (text, nullable)
- `tomorrow` (text)
- `tags` (text array)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Server Functions** in `app/lib/journal.server.ts`:
- `getAllJournalEntries()`
- `getJournalEntryById(id)`
- `createJournalEntry(data)`
- `updateJournalEntry(id, data)` (not yet implemented)
- `deleteJournalEntry(id)`
- `searchJournalEntries(query, businessFilter)`

## Code Standards

### TypeScript
- Always use TypeScript - avoid `any` unless absolutely necessary
- Use proper type definitions for function parameters and returns
- Keep types in the same file or in a `types/` folder for shared types

### Components
- Functional components only
- Use Tailwind classes for styling (no inline CSS)
- Extract complex components into separate files
- Keep components focused and composable
- Use semantic HTML

### Server Functions
- Mark server-only code with `.server.ts` extension
- Use React Router's `loader()` for data fetching
- Use React Router's `action()` for mutations
- Use form-based mutations with `<Form>` component, not fetch()

### Forms
- Use React Router's `<Form>` component for all form submissions
- Use `react-hook-form` for complex form logic
- Maintain optimistic UI updates for better UX
- Show loading states during submissions

### Database
- Use parameterized queries to prevent SQL injection
- Add proper error handling and logging
- Index columns used frequently in WHERE/ORDER BY clauses
- Run migrations with `npm run migrate` before deploying

## Important Files & References

- **Root layout**: [app/root.tsx](app/root.tsx)
- **Journal route**: [app/routes/journal.tsx](app/routes/journal.tsx)
- **Journal server functions**: [app/lib/journal.server.ts](app/lib/journal.server.ts)
- **Database config**: [app/lib/db.ts](app/lib/db.ts)
- **Migration script**: [scripts/migrate.ts](scripts/migrate.ts)
- **Layout component**: [app/components/Layout.tsx](app/components/Layout.tsx)
- **Sidebar navigation**: [app/components/Sidebar.tsx](app/components/Sidebar.tsx)

## Common Tasks

### Adding a New Route/Feature
1. Create new file in `app/routes/`
2. Export a React component as default
3. Create server functions in `app/lib/` if needed (`.server.ts` files)
4. Add navigation link in [app/components/Sidebar.tsx](app/components/Sidebar.tsx)
5. Use TypeScript and TailwindCSS
6. Test with `npm run dev`

### Adding Database Tables
1. Create migration SQL in `scripts/migrate.ts`
2. Create corresponding server functions in `app/lib/`
3. Run `npm run migrate`

### Styling
- Use TailwindCSS utility classes exclusively
- Reference TailwindCSS docs for available classes
- Use responsive breakpoints: `sm:`, `md:`, `lg:`, etc.

### Debugging
- Use browser DevTools for client-side debugging
- Check terminal for server-side errors
- Use React Router DevTools extension
- Check database with SQL client pointing to Neon

## Deployment

Build and deploy the `build/` directory:

```bash
npm run build
npm run start  # Production server
```

Supported platforms:
- AWS ECS / Elastic Beanstalk
- Google Cloud Run
- Azure Container Apps
- Fly.io
- Railway
- Any Docker-compatible platform

Set `DATABASE_URL` environment variable in your deployment platform.

## Git Workflow

- Main branch: `main`
- Create feature branches for new features/fixes
- Write meaningful commit messages
- PR review recommended for significant changes

## Next Steps & TODOs

- [ ] Implement UPDATE functionality for journal entries
- [ ] Add tag management and filtering
- [ ] Implement pagination for large entry lists
- [ ] Add export/import functionality for journal entries
- [ ] Add rich text editor for entry fields
- [ ] Implement authentication/user accounts
- [ ] Add more analytics to financials dashboard
- [ ] Create dashboard insights/summary view

## Notes for Claude Code

When working on this project:
1. **Always check JOURNAL_CRUD.md** for recent feature context
2. **Use TypeScript** - avoid JavaScript files
3. **Keep database queries safe** - always use parameterized queries
4. **Test changes** with `npm run dev` before committing
5. **Update JOURNAL_CRUD.md or create new `.md` files** when implementing new features
6. **Use React Router patterns** - leverage loaders, actions, and Form components
7. **Maintain responsive design** - test on mobile/tablet sizes
