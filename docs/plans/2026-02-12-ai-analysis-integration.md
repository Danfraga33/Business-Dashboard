# AI Analysis Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add AI-powered business analysis (Strategy Advisor, Financial Analysis, Pricing Strategy) with Morning Briefing dashboard

**Architecture:** Three dedicated analysis pages + unified briefing. Claude API generates insights from journals/financials/experiments. Store analyses in new `analyses` table. 24-hour caching with manual refresh.

**Tech Stack:** React Router 7, Neon PostgreSQL, @anthropic-ai/sdk, TypeScript, TailwindCSS

---

## Phase 1: Foundation

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

Expected: Package added to dependencies

**Step 2: Verify installation**

```bash
npm list @anthropic-ai/sdk
```

Expected: Shows installed version

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add anthropic sdk dependency"
```

---

### Task 2: Environment Setup

**Files:**
- Create: `.env.example`
- Modify: `.env` (local only, not committed)

**Step 1: Create example env file**

Create `.env.example`:
```
DATABASE_URL='postgresql://user:password@host/database?sslmode=require&channel_binding=require'
ANTHROPIC_API_KEY='your_api_key_here'
```

**Step 2: Add to .env (local)**

Add to your local `.env` file:
```
ANTHROPIC_API_KEY='your_actual_api_key'
```

**Step 3: Verify .gitignore**

Check `.gitignore` contains `.env` (not `.env.example`)

**Step 4: Commit**

```bash
git add .env.example
git commit -m "chore: add anthropic api key to env setup"
```

---

### Task 3: Database Migration - Analyses Table

**Files:**
- Modify: `scripts/migrate.ts`

**Step 1: Add analyses table migration**

In `scripts/migrate.ts`, add after existing migrations:

```typescript
await sql`
  CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    summary TEXT NOT NULL,
    full_analysis JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    refreshed_at TIMESTAMP DEFAULT NOW()
  )
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_analyses_type ON analyses(type)
`;

await sql`
  CREATE INDEX IF NOT EXISTS idx_analyses_refreshed_at ON analyses(refreshed_at DESC)
`;

console.log('✅ Created analyses table with indexes');
```

**Step 2: Run migration**

```bash
npm run migrate
```

Expected: "✅ Created analyses table with indexes"

**Step 3: Verify table exists**

Connect to your Neon database and run:
```sql
SELECT * FROM analyses LIMIT 1;
```

Expected: Empty result set (table exists but no data)

**Step 4: Commit**

```bash
git add scripts/migrate.ts
git commit -m "feat: add analyses table migration"
```

---

### Task 4: TypeScript Types

**Files:**
- Create: `app/lib/types/analysis.ts`

**Step 1: Create types file**

Create `app/lib/types/analysis.ts`:

```typescript
export type AnalysisType = 'strategy' | 'financial' | 'pricing';

export interface Analysis {
  id: number;
  type: AnalysisType;
  summary: string;
  full_analysis: StrategyAnalysis | FinancialAnalysis | PricingAnalysis;
  metadata?: Record<string, any>;
  created_at: Date;
  refreshed_at: Date;
}

export interface StrategyAnalysis {
  patterns: Array<{
    title: string;
    description: string;
    frequency: string;
  }>;
  key_learnings: Array<{
    learning: string;
    source: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  recurring_blockers: Array<{
    blocker: string;
    occurrences: number;
    suggested_action: string;
  }>;
  recommendations: Array<{
    priority: number;
    recommendation: string;
    rationale: string;
  }>;
  momentum_score: number;
}

export interface FinancialAnalysis {
  health_score: number;
  key_metrics: Array<{
    metric: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    change_pct: number;
  }>;
  trends: Array<{
    trend: string;
    description: string;
    time_period: string;
  }>;
  forecasts: Array<{
    metric: string;
    prediction: string;
    confidence: 'high' | 'medium' | 'low';
    timeframe: string;
  }>;
  optimization_levers: Array<{
    lever: string;
    potential_impact: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  alerts: Array<{
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }>;
}

export interface PricingAnalysis {
  current_positioning: {
    segment: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  };
  market_insights: Array<{
    insight: string;
    implication: string;
  }>;
  pricing_models: Array<{
    model: string;
    pros: string[];
    cons: string[];
    fit_score: number;
  }>;
  recommendations: Array<{
    category: 'pricing' | 'packaging' | 'positioning' | 'marketing';
    recommendation: string;
    expected_impact: string;
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
  quick_wins: Array<{
    action: string;
    rationale: string;
  }>;
}
```

**Step 2: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Commit**

```bash
git add app/lib/types/analysis.ts
git commit -m "feat: add analysis type definitions"
```

---

### Task 5: Analysis Server Functions - Part 1 (Database Operations)

**Files:**
- Create: `app/lib/analysis.server.ts`

**Step 1: Create basic server file with database operations**

Create `app/lib/analysis.server.ts`:

```typescript
import { sql } from "./db";
import type { Analysis, AnalysisType, StrategyAnalysis, FinancialAnalysis, PricingAnalysis } from "./types/analysis";

export async function getLatestAnalysis(type: AnalysisType): Promise<Analysis | null> {
  const results = await sql`
    SELECT * FROM analyses
    WHERE type = ${type}
    ORDER BY refreshed_at DESC
    LIMIT 1
  `;

  if (results.length === 0) return null;

  return {
    ...results[0],
    created_at: new Date(results[0].created_at),
    refreshed_at: new Date(results[0].refreshed_at),
  } as Analysis;
}

export async function getAllLatestAnalyses(): Promise<{
  strategy: Analysis | null;
  financial: Analysis | null;
  pricing: Analysis | null;
}> {
  const [strategy, financial, pricing] = await Promise.all([
    getLatestAnalysis('strategy'),
    getLatestAnalysis('financial'),
    getLatestAnalysis('pricing'),
  ]);

  return { strategy, financial, pricing };
}

async function saveAnalysis(
  type: AnalysisType,
  summary: string,
  fullAnalysis: StrategyAnalysis | FinancialAnalysis | PricingAnalysis,
  metadata?: Record<string, any>
): Promise<Analysis> {
  const results = await sql`
    INSERT INTO analyses (type, summary, full_analysis, metadata)
    VALUES (${type}, ${summary}, ${JSON.stringify(fullAnalysis)}, ${metadata ? JSON.stringify(metadata) : null})
    RETURNING *
  `;

  return {
    ...results[0],
    created_at: new Date(results[0].created_at),
    refreshed_at: new Date(results[0].refreshed_at),
  } as Analysis;
}

// Placeholder for AI integration (Task 6)
export async function refreshAnalysis(type: AnalysisType): Promise<Analysis> {
  // TODO: Implement in Task 6
  throw new Error('Not implemented yet');
}
```

**Step 2: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Commit**

```bash
git add app/lib/analysis.server.ts
git commit -m "feat: add analysis database operations"
```

---

### Task 6: Analysis Server Functions - Part 2 (AI Integration)

**Files:**
- Modify: `app/lib/analysis.server.ts`

**Step 1: Add imports and helper functions**

At top of `app/lib/analysis.server.ts`, add:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { getAllJournalEntries } from './journal.server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function fetchDataForAnalysis(type: AnalysisType) {
  const journals = await getAllJournalEntries();
  const recentJournals = journals.slice(0, 30); // Last 30 entries

  // TODO: Add financials, experiments, portfolio data when needed
  return {
    journals: recentJournals,
  };
}
```

**Step 2: Add prompt builders**

Add before `refreshAnalysis`:

```typescript
function buildStrategyPrompt(data: any): string {
  const journalsText = data.journals
    .map((j: any) => `
Date: ${j.created_at}
Business: ${j.business || 'N/A'}
Hypothesis: ${j.hypothesis}
Shipped: ${j.shipped}
Learned: ${j.learned}
Blockers: ${j.blockers || 'None'}
Tomorrow: ${j.tomorrow}
Tags: ${j.tags.join(', ')}
---`)
    .join('\n');

  return `You are a business strategy advisor. Analyze the following journal entries and provide strategic insights.

Journal Entries:
${journalsText}

Analyze these entries and return a JSON object with this exact structure:
{
  "summary": "2-3 sentence summary of key strategic insights",
  "patterns": [{"title": "...", "description": "...", "frequency": "weekly|monthly|recurring"}],
  "key_learnings": [{"learning": "...", "source": "journal entry reference", "impact": "high|medium|low"}],
  "recurring_blockers": [{"blocker": "...", "occurrences": number, "suggested_action": "..."}],
  "recommendations": [{"priority": 1-5, "recommendation": "...", "rationale": "..."}],
  "momentum_score": 0-100
}

Focus on actionable insights. Identify patterns across entries. Prioritize high-impact learnings.`;
}

function buildFinancialPrompt(data: any): string {
  // For now, return a simple prompt - enhance with real financial data later
  return `You are a financial analyst. Provide a financial health analysis.

Return a JSON object with this structure:
{
  "summary": "2-3 sentence financial health summary",
  "health_score": 0-100,
  "key_metrics": [{"metric": "...", "value": "...", "trend": "up|down|stable", "change_pct": number}],
  "trends": [{"trend": "...", "description": "...", "time_period": "..."}],
  "forecasts": [{"metric": "...", "prediction": "...", "confidence": "high|medium|low", "timeframe": "..."}],
  "optimization_levers": [{"lever": "...", "potential_impact": "...", "difficulty": "easy|medium|hard"}],
  "alerts": [{"severity": "critical|warning|info", "message": "..."}]
}

Provide realistic placeholder insights for now.`;
}

function buildPricingPrompt(data: any): string {
  return `You are a pricing strategy expert. Analyze pricing and positioning.

Return a JSON object with this structure:
{
  "summary": "2-3 sentence pricing strategy summary",
  "current_positioning": {"segment": "...", "description": "...", "strengths": ["..."], "weaknesses": ["..."]},
  "market_insights": [{"insight": "...", "implication": "..."}],
  "pricing_models": [{"model": "...", "pros": ["..."], "cons": ["..."], "fit_score": 0-100}],
  "recommendations": [{"category": "pricing|packaging|positioning|marketing", "recommendation": "...", "expected_impact": "...", "implementation_effort": "low|medium|high"}],
  "quick_wins": [{"action": "...", "rationale": "..."}]
}

Provide actionable pricing insights.`;
}
```

**Step 3: Implement refreshAnalysis**

Replace the placeholder `refreshAnalysis` function:

```typescript
export async function refreshAnalysis(type: AnalysisType): Promise<Analysis> {
  // 1. Fetch relevant data
  const data = await fetchDataForAnalysis(type);

  // 2. Build prompt
  let prompt: string;
  switch (type) {
    case 'strategy':
      prompt = buildStrategyPrompt(data);
      break;
    case 'financial':
      prompt = buildFinancialPrompt(data);
      break;
    case 'pricing':
      prompt = buildPricingPrompt(data);
      break;
  }

  // 3. Call Claude API
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  // 4. Parse response
  const responseText = message.content[0].type === 'text'
    ? message.content[0].text
    : '';

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = responseText.match(/```json\n([\s\S]+?)\n```/) ||
                    responseText.match(/\{[\s\S]+\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse AI response');
  }

  const jsonText = jsonMatch[1] || jsonMatch[0];
  const parsed = JSON.parse(jsonText);

  // 5. Save to database
  const analysis = await saveAnalysis(
    type,
    parsed.summary,
    parsed,
    {
      entries_analyzed: data.journals.length,
      model: 'claude-sonnet-4-5-20250929',
    }
  );

  return analysis;
}
```

**Step 4: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors

**Step 5: Commit**

```bash
git add app/lib/analysis.server.ts
git commit -m "feat: add AI analysis generation with Claude API"
```

---

### Task 7: Reusable Components - AnalysisSummaryCard

**Files:**
- Create: `app/components/AnalysisSummaryCard.tsx`

**Step 1: Create AnalysisSummaryCard component**

Create `app/components/AnalysisSummaryCard.tsx`:

```typescript
import { Link } from "react-router";
import { Brain, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import type { AnalysisType } from "~/lib/types/analysis";

interface AnalysisSummaryCardProps {
  type: AnalysisType;
  summary: string;
  lastUpdated: Date;
}

const iconMap = {
  strategy: Brain,
  financial: TrendingUp,
  pricing: DollarSign,
};

const titleMap = {
  strategy: "Strategy Advisor",
  financial: "Financial Analysis",
  pricing: "Pricing Strategy",
};

const linkMap = {
  strategy: "/analysis/strategy",
  financial: "/analysis/financials",
  pricing: "/analysis/pricing",
};

export function AnalysisSummaryCard({ type, summary, lastUpdated }: AnalysisSummaryCardProps) {
  const Icon = iconMap[type];
  const title = titleMap[type];
  const link = linkMap[type];

  const timeSince = getTimeSince(lastUpdated);

  return (
    <div className="bg-surface border border-edge rounded-xl p-6 hover:border-accent/30 transition-colors">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-ink mb-1">{title}</h3>
          <p className="text-xs text-ink-muted">Updated {timeSince}</p>
        </div>
      </div>

      <p className="text-sm text-ink-secondary leading-relaxed mb-4">
        {summary}
      </p>

      <Link
        to={link}
        className="inline-flex items-center gap-2 text-xs font-medium text-accent hover:text-accent/80 transition-colors"
      >
        View Full Analysis
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

function getTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
```

**Step 2: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Commit**

```bash
git add app/components/AnalysisSummaryCard.tsx
git commit -m "feat: add AnalysisSummaryCard component"
```

---

### Task 8: Reusable Components - RefreshButton

**Files:**
- Create: `app/components/RefreshButton.tsx`

**Step 1: Create RefreshButton component**

Create `app/components/RefreshButton.tsx`:

```typescript
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onClick: () => void;
  loading?: boolean;
  label?: string;
}

export function RefreshButton({ onClick, loading = false, label = "Refresh Analysis" }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Analyzing...' : label}
    </button>
  );
}
```

**Step 2: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Commit**

```bash
git add app/components/RefreshButton.tsx
git commit -m "feat: add RefreshButton component"
```

---

## Phase 2: Strategy Advisor Page

### Task 9: Strategy Route - Basic Structure

**Files:**
- Create: `app/routes/analysis.strategy.tsx`

**Step 1: Create route file**

Create `app/routes/analysis.strategy.tsx`:

```typescript
import { useLoaderData, useNavigate } from "react-router";
import { Layout } from "~/components/Layout";
import { RefreshButton } from "~/components/RefreshButton";
import type { Route } from "./+types/analysis.strategy";
import { getLatestAnalysis, refreshAnalysis } from "~/lib/analysis.server";
import type { StrategyAnalysis } from "~/lib/types/analysis";
import { useState } from "react";

export async function loader() {
  const analysis = await getLatestAnalysis('strategy');
  return { analysis };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'refresh') {
    const analysis = await refreshAnalysis('strategy');
    return { analysis };
  }

  return null;
}

export default function StrategyAdvisor() {
  const { analysis } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const formData = new FormData();
    formData.append('intent', 'refresh');

    await fetch('/analysis/strategy', {
      method: 'POST',
      body: formData,
    });

    navigate('.', { replace: true });
    setIsRefreshing(false);
  };

  if (!analysis) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink mb-2">Strategy Advisor</h1>
            <p className="text-sm text-ink-muted">AI-powered strategic insights from your journals and experiments</p>
          </div>

          <div className="bg-surface border border-edge rounded-xl p-12 text-center">
            <p className="text-ink-secondary mb-6">No analysis yet. Click below to generate your first strategic analysis.</p>
            <RefreshButton onClick={handleRefresh} loading={isRefreshing} label="Generate Analysis" />
          </div>
        </div>
      </Layout>
    );
  }

  const strategyData = analysis.full_analysis as StrategyAnalysis;
  const lastUpdated = new Date(analysis.refreshed_at);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-2">Strategy Advisor</h1>
            <p className="text-sm text-ink-muted">
              Last updated {getTimeSince(lastUpdated)}
            </p>
          </div>
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
        </div>

        {/* Content sections - Task 10 */}
        <div className="space-y-6">
          <p className="text-ink-secondary">Analysis content coming in Task 10</p>
        </div>
      </div>
    </Layout>
  );
}

function getTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
```

**Step 2: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors (may have warnings about unused imports)

**Step 3: Test the route**

```bash
npm run dev
```

Navigate to http://localhost:5173/analysis/strategy

Expected: Empty state with "Generate Analysis" button

**Step 4: Commit**

```bash
git add app/routes/analysis.strategy.tsx
git commit -m "feat: add strategy advisor route skeleton"
```

---

### Task 10: Strategy Page - Full UI

**Files:**
- Modify: `app/routes/analysis.strategy.tsx`

**Step 1: Add momentum score component**

In `app/routes/analysis.strategy.tsx`, add before the default export:

```typescript
function MomentumScore({ score }: { score: number }) {
  const color = score >= 70 ? 'text-green-500' : score >= 40 ? 'text-yellow-500' : 'text-red-500';
  const bgColor = score >= 70 ? 'bg-green-500/10' : score >= 40 ? 'bg-yellow-500/10' : 'bg-red-500/10';

  return (
    <div className={`${bgColor} rounded-xl p-6 text-center`}>
      <div className={`text-5xl font-bold ${color} mb-2`}>{score}</div>
      <div className="text-sm text-ink-muted">Momentum Score</div>
    </div>
  );
}
```

**Step 2: Replace content sections placeholder**

Replace the `<div className="space-y-6">` section with:

```typescript
<div className="space-y-6">
  {/* Momentum Score */}
  <MomentumScore score={strategyData.momentum_score} />

  {/* Key Patterns */}
  <div className="bg-surface border border-edge rounded-xl p-6">
    <h2 className="text-lg font-semibold text-ink mb-4">Key Patterns</h2>
    <div className="space-y-3">
      {strategyData.patterns.map((pattern, idx) => (
        <div key={idx} className="border-l-2 border-accent pl-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-ink">{pattern.title}</h3>
            <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded">
              {pattern.frequency}
            </span>
          </div>
          <p className="text-sm text-ink-secondary">{pattern.description}</p>
        </div>
      ))}
    </div>
  </div>

  {/* Top Learnings */}
  <div className="bg-surface border border-edge rounded-xl p-6">
    <h2 className="text-lg font-semibold text-ink mb-4">Top Learnings</h2>
    <div className="space-y-3">
      {strategyData.key_learnings.map((learning, idx) => {
        const impactColor = learning.impact === 'high'
          ? 'bg-green-500/10 text-green-600'
          : learning.impact === 'medium'
          ? 'bg-yellow-500/10 text-yellow-600'
          : 'bg-blue-500/10 text-blue-600';

        return (
          <div key={idx} className="flex items-start gap-3">
            <span className={`text-xs px-2 py-1 rounded font-medium ${impactColor} shrink-0`}>
              {learning.impact.toUpperCase()}
            </span>
            <div className="flex-1">
              <p className="text-sm text-ink mb-1">{learning.learning}</p>
              <p className="text-xs text-ink-muted">{learning.source}</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>

  {/* Recurring Blockers */}
  {strategyData.recurring_blockers.length > 0 && (
    <div className="bg-surface border border-edge rounded-xl p-6">
      <h2 className="text-lg font-semibold text-ink mb-4">Recurring Blockers</h2>
      <div className="space-y-3">
        {strategyData.recurring_blockers.map((blocker, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
              {blocker.occurrences}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink mb-1">{blocker.blocker}</p>
              <p className="text-sm text-ink-secondary">{blocker.suggested_action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Strategic Recommendations */}
  <div className="bg-surface border border-edge rounded-xl p-6">
    <h2 className="text-lg font-semibold text-ink mb-4">Strategic Recommendations</h2>
    <div className="space-y-4">
      {strategyData.recommendations
        .sort((a, b) => a.priority - b.priority)
        .map((rec, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-bold shrink-0">
              {rec.priority}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-ink mb-1">{rec.recommendation}</p>
              <p className="text-xs text-ink-muted">{rec.rationale}</p>
            </div>
          </div>
        ))}
    </div>
  </div>
</div>
```

**Step 3: Test the page**

```bash
npm run dev
```

Navigate to http://localhost:5173/analysis/strategy and click "Generate Analysis"

Expected: Full strategy analysis UI with all sections

**Step 4: Commit**

```bash
git add app/routes/analysis.strategy.tsx
git commit -m "feat: complete strategy advisor UI"
```

---

## Phase 3: Financial Analysis Page

### Task 11: Financial Route

**Files:**
- Create: `app/routes/analysis.financials.tsx`

**Step 1: Create financial analysis route**

Create `app/routes/analysis.financials.tsx`:

```typescript
import { useLoaderData, useNavigate } from "react-router";
import { Layout } from "~/components/Layout";
import { RefreshButton } from "~/components/RefreshButton";
import { HealthIndicator } from "~/components/HealthIndicator";
import type { Route } from "./+types/analysis.financials";
import { getLatestAnalysis, refreshAnalysis } from "~/lib/analysis.server";
import type { FinancialAnalysis } from "~/lib/types/analysis";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export async function loader() {
  const analysis = await getLatestAnalysis('financial');
  return { analysis };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'refresh') {
    const analysis = await refreshAnalysis('financial');
    return { analysis };
  }

  return null;
}

export default function FinancialAnalysisPage() {
  const { analysis } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const formData = new FormData();
    formData.append('intent', 'refresh');

    await fetch('/analysis/financials', {
      method: 'POST',
      body: formData,
    });

    navigate('.', { replace: true });
    setIsRefreshing(false);
  };

  if (!analysis) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink mb-2">Financial Analysis</h1>
            <p className="text-sm text-ink-muted">AI-powered financial health insights</p>
          </div>

          <div className="bg-surface border border-edge rounded-xl p-12 text-center">
            <p className="text-ink-secondary mb-6">No analysis yet. Generate your first financial analysis.</p>
            <RefreshButton onClick={handleRefresh} loading={isRefreshing} label="Generate Analysis" />
          </div>
        </div>
      </Layout>
    );
  }

  const financialData = analysis.full_analysis as FinancialAnalysis;
  const lastUpdated = new Date(analysis.refreshed_at);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-2">Financial Analysis</h1>
            <p className="text-sm text-ink-muted">
              Last updated {getTimeSince(lastUpdated)}
            </p>
          </div>
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
        </div>

        <div className="space-y-6">
          {/* Health Score */}
          <div className="bg-surface border border-edge rounded-xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Financial Health Score</h2>
            <HealthIndicator value={financialData.health_score} label="Overall Health" />
          </div>

          {/* Alerts */}
          {financialData.alerts.length > 0 && (
            <div className="space-y-2">
              {financialData.alerts.map((alert, idx) => {
                const severityStyles = {
                  critical: 'bg-red-500/10 border-red-500/30 text-red-600',
                  warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600',
                  info: 'bg-blue-500/10 border-blue-500/30 text-blue-600',
                };

                return (
                  <div key={idx} className={`border rounded-lg p-4 ${severityStyles[alert.severity]}`}>
                    <p className="text-sm font-medium">{alert.message}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Key Metrics */}
          <div className="bg-surface border border-edge rounded-xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {financialData.key_metrics.map((metric, idx) => {
                const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
                const trendColor = metric.trend === 'up' ? 'text-green-500' : metric.trend === 'down' ? 'text-red-500' : 'text-ink-muted';

                return (
                  <div key={idx} className="border border-edge rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-ink-muted">{metric.metric}</p>
                      <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    </div>
                    <p className="text-xl font-bold text-ink mb-1">{metric.value}</p>
                    <p className={`text-xs ${trendColor}`}>
                      {metric.change_pct > 0 ? '+' : ''}{metric.change_pct}%
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trends */}
          <div className="bg-surface border border-edge rounded-xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Trends Analysis</h2>
            <div className="space-y-3">
              {financialData.trends.map((trend, idx) => (
                <div key={idx} className="border-l-2 border-accent pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-ink">{trend.trend}</h3>
                    <span className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded">
                      {trend.time_period}
                    </span>
                  </div>
                  <p className="text-sm text-ink-secondary">{trend.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Forecasts */}
          <div className="bg-surface border border-edge rounded-xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Forecasts</h2>
            <div className="space-y-3">
              {financialData.forecasts.map((forecast, idx) => {
                const confidenceColor = forecast.confidence === 'high'
                  ? 'bg-green-500/10 text-green-600'
                  : forecast.confidence === 'medium'
                  ? 'bg-yellow-500/10 text-yellow-600'
                  : 'bg-red-500/10 text-red-600';

                return (
                  <div key={idx} className="flex items-start gap-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${confidenceColor} shrink-0`}>
                      {forecast.confidence.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{forecast.metric}</p>
                      <p className="text-sm text-ink-secondary">{forecast.prediction}</p>
                      <p className="text-xs text-ink-muted">{forecast.timeframe}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Optimization Levers */}
          <div className="bg-surface border border-edge rounded-xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Optimization Levers</h2>
            <div className="space-y-3">
              {financialData.optimization_levers.map((lever, idx) => {
                const difficultyColor = lever.difficulty === 'easy'
                  ? 'bg-green-500/10 text-green-600'
                  : lever.difficulty === 'medium'
                  ? 'bg-yellow-500/10 text-yellow-600'
                  : 'bg-red-500/10 text-red-600';

                return (
                  <div key={idx} className="flex items-start gap-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${difficultyColor} shrink-0`}>
                      {lever.difficulty.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{lever.lever}</p>
                      <p className="text-sm text-ink-secondary">{lever.potential_impact}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function getTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
```

**Step 2: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Test the page**

```bash
npm run dev
```

Navigate to http://localhost:5173/analysis/financials

Expected: Financial analysis page with all sections

**Step 4: Commit**

```bash
git add app/routes/analysis.financials.tsx
git commit -m "feat: add financial analysis page"
```

---

## Phase 4: Pricing Strategy Page

### Task 12: Pricing Route

**Files:**
- Create: `app/routes/analysis.pricing.tsx`

**Step 1: Create pricing strategy route**

Create `app/routes/analysis.pricing.tsx`:

```typescript
import { useLoaderData, useNavigate } from "react-router";
import { Layout } from "~/components/Layout";
import { RefreshButton } from "~/components/RefreshButton";
import { ProgressBar } from "~/components/ProgressBar";
import type { Route } from "./+types/analysis.pricing";
import { getLatestAnalysis, refreshAnalysis } from "~/lib/analysis.server";
import type { PricingAnalysis } from "~/lib/types/analysis";
import { useState } from "react";

export async function loader() {
  const analysis = await getLatestAnalysis('pricing');
  return { analysis };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'refresh') {
    const analysis = await refreshAnalysis('pricing');
    return { analysis };
  }

  return null;
}

export default function PricingStrategyPage() {
  const { analysis } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const formData = new FormData();
    formData.append('intent', 'refresh');

    await fetch('/analysis/pricing', {
      method: 'POST',
      body: formData,
    });

    navigate('.', { replace: true });
    setIsRefreshing(false);
  };

  if (!analysis) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink mb-2">Pricing Strategy</h1>
            <p className="text-sm text-ink-muted">AI-powered pricing and marketing insights</p>
          </div>

          <div className="bg-surface border border-edge rounded-xl p-12 text-center">
            <p className="text-ink-secondary mb-6">No analysis yet. Generate your first pricing strategy analysis.</p>
            <RefreshButton onClick={handleRefresh} loading={isRefreshing} label="Generate Analysis" />
          </div>
        </div>
      </Layout>
    );
  }

  const pricingData = analysis.full_analysis as PricingAnalysis;
  const lastUpdated = new Date(analysis.refreshed_at);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-2">Pricing Strategy</h1>
            <p className="text-sm text-ink-muted">
              Last updated {getTimeSince(lastUpdated)}
            </p>
          </div>
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
        </div>

        <div className="space-y-6">
          {/* Current Positioning */}
          <div className="bg-surface border border-edge rounded-xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Current Positioning</h2>
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full mb-2">
                {pricingData.current_positioning.segment}
              </span>
              <p className="text-sm text-ink-secondary">{pricingData.current_positioning.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-semibold text-green-600 mb-2">Strengths</h3>
                <ul className="space-y-1">
                  {pricingData.current_positioning.strengths.map((strength, idx) => (
                    <li key={idx} className="text-sm text-ink-secondary flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-red-600 mb-2">Weaknesses</h3>
                <ul className="space-y-1">
                  {pricingData.current_positioning.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="text-sm text-ink-secondary flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div className="bg-surface border border-edge rounded-xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Market Insights</h2>
            <div className="space-y-3">
              {pricingData.market_insights.map((insight, idx) => (
                <div key={idx} className="border-l-2 border-accent pl-4">
                  <p className="text-sm font-medium text-ink mb-1">{insight.insight}</p>
                  <p className="text-sm text-ink-secondary">{insight.implication}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Models */}
          <div className="bg-surface border border-edge rounded-xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Pricing Model Comparison</h2>
            <div className="space-y-4">
              {pricingData.pricing_models.map((model, idx) => (
                <div key={idx} className="border border-edge rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-ink">{model.model}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-muted">Fit Score</span>
                      <span className="text-sm font-bold text-accent">{model.fit_score}/100</span>
                    </div>
                  </div>
                  <ProgressBar progress={model.fit_score} color="accent" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="text-xs font-semibold text-green-600 mb-2">Pros</h4>
                      <ul className="space-y-1">
                        {model.pros.map((pro, i) => (
                          <li key={i} className="text-xs text-ink-secondary flex items-start gap-1">
                            <span className="text-green-500">+</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-red-600 mb-2">Cons</h4>
                      <ul className="space-y-1">
                        {model.cons.map((con, i) => (
                          <li key={i} className="text-xs text-ink-secondary flex items-start gap-1">
                            <span className="text-red-500">-</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-surface border border-edge rounded-xl p-6">
            <h2 className="text-lg font-semibold text-ink mb-4">Strategic Recommendations</h2>
            <div className="space-y-3">
              {pricingData.recommendations.map((rec, idx) => {
                const categoryColors = {
                  pricing: 'bg-blue-500/10 text-blue-600',
                  packaging: 'bg-purple-500/10 text-purple-600',
                  positioning: 'bg-green-500/10 text-green-600',
                  marketing: 'bg-yellow-500/10 text-yellow-600',
                };
                const effortColor = rec.implementation_effort === 'low'
                  ? 'text-green-600'
                  : rec.implementation_effort === 'medium'
                  ? 'text-yellow-600'
                  : 'text-red-600';

                return (
                  <div key={idx} className="border border-edge rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${categoryColors[rec.category]} shrink-0`}>
                        {rec.category.toUpperCase()}
                      </span>
                      <span className={`text-xs font-medium ${effortColor}`}>
                        {rec.implementation_effort} effort
                      </span>
                    </div>
                    <p className="text-sm font-medium text-ink mb-1">{rec.recommendation}</p>
                    <p className="text-sm text-ink-secondary">{rec.expected_impact}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Wins */}
          {pricingData.quick_wins.length > 0 && (
            <div className="bg-accent/5 border border-accent/30 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-accent mb-4">Quick Wins</h2>
              <div className="space-y-3">
                {pricingData.quick_wins.map((win, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink mb-1">{win.action}</p>
                      <p className="text-sm text-ink-secondary">{win.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

function getTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
```

**Step 2: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Test the page**

```bash
npm run dev
```

Navigate to http://localhost:5173/analysis/pricing

Expected: Pricing strategy page with all sections

**Step 4: Commit**

```bash
git add app/routes/analysis.pricing.tsx
git commit -m "feat: add pricing strategy page"
```

---

## Phase 5: Morning Briefing

### Task 13: Briefing Route

**Files:**
- Create: `app/routes/briefing.tsx`

**Step 1: Create briefing route**

Create `app/routes/briefing.tsx`:

```typescript
import { useLoaderData, useNavigate } from "react-router";
import { Layout } from "~/components/Layout";
import { AnalysisSummaryCard } from "~/components/AnalysisSummaryCard";
import { RefreshButton } from "~/components/RefreshButton";
import type { Route } from "./+types/briefing";
import { getAllLatestAnalyses, refreshAnalysis } from "~/lib/analysis.server";
import { useState } from "react";
import { AlertCircle } from "lucide-react";

export async function loader() {
  const analyses = await getAllLatestAnalyses();
  return { analyses };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  if (intent === 'refresh-all') {
    await Promise.all([
      refreshAnalysis('strategy'),
      refreshAnalysis('financial'),
      refreshAnalysis('pricing'),
    ]);
    return { success: true };
  }

  return null;
}

export default function Briefing() {
  const { analyses } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    const formData = new FormData();
    formData.append('intent', 'refresh-all');

    await fetch('/briefing', {
      method: 'POST',
      body: formData,
    });

    navigate('.', { replace: true });
    setIsRefreshing(false);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Check if any analysis is older than 24 hours
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const needsRefresh = [analyses.strategy, analyses.financial, analyses.pricing].some(
    (analysis) => analysis && new Date(analysis.refreshed_at) < oneDayAgo
  );

  const allAnalysesExist = analyses.strategy && analyses.financial && analyses.pricing;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-2">Morning Briefing</h1>
            <p className="text-sm text-ink-muted">{today}</p>
          </div>
          <RefreshButton onClick={handleRefreshAll} loading={isRefreshing} label="Refresh All Analyses" />
        </div>

        {needsRefresh && allAnalysesExist && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-700">New data available</p>
              <p className="text-sm text-yellow-600">Some analyses are older than 24 hours. Click "Refresh All Analyses" to see the latest insights.</p>
            </div>
          </div>
        )}

        {!allAnalysesExist && (
          <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">First time here?</p>
              <p className="text-sm text-blue-600">Click "Refresh All Analyses" to generate your initial insights across strategy, financials, and pricing.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analyses.strategy ? (
            <AnalysisSummaryCard
              type="strategy"
              summary={analyses.strategy.summary}
              lastUpdated={new Date(analyses.strategy.refreshed_at)}
            />
          ) : (
            <EmptyAnalysisCard type="strategy" />
          )}

          {analyses.financial ? (
            <AnalysisSummaryCard
              type="financial"
              summary={analyses.financial.summary}
              lastUpdated={new Date(analyses.financial.refreshed_at)}
            />
          ) : (
            <EmptyAnalysisCard type="financial" />
          )}

          {analyses.pricing ? (
            <AnalysisSummaryCard
              type="pricing"
              summary={analyses.pricing.summary}
              lastUpdated={new Date(analyses.pricing.refreshed_at)}
            />
          ) : (
            <EmptyAnalysisCard type="pricing" />
          )}
        </div>
      </div>
    </Layout>
  );
}

function EmptyAnalysisCard({ type }: { type: 'strategy' | 'financial' | 'pricing' }) {
  const titles = {
    strategy: 'Strategy Advisor',
    financial: 'Financial Analysis',
    pricing: 'Pricing Strategy',
  };

  return (
    <div className="bg-surface border border-edge border-dashed rounded-xl p-6 flex items-center justify-center">
      <p className="text-sm text-ink-muted text-center">
        No {titles[type].toLowerCase()} yet.<br />Click "Refresh All" to generate.
      </p>
    </div>
  );
}
```

**Step 2: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Test the page**

```bash
npm run dev
```

Navigate to http://localhost:5173/briefing

Expected: Morning briefing with all three analysis cards (or empty states)

**Step 4: Commit**

```bash
git add app/routes/briefing.tsx
git commit -m "feat: add morning briefing page"
```

---

### Task 14: Update Sidebar Navigation

**Files:**
- Modify: `app/components/Sidebar.tsx`

**Step 1: Add AI Insights section to navItems**

In `app/components/Sidebar.tsx`, replace the `navItems` array:

```typescript
import {
  Sun,
  Moon,
  LayoutGrid,
  TrendingUp,
  BookOpen,
  FlaskConical,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Hexagon,
  Brain,
  DollarSign,
  Sparkles,
} from "lucide-react";

const navItems = [
  { to: "/", icon: Sun, label: "Morning Brief" },
  { to: "/briefing", icon: Sparkles, label: "AI Briefing" },
  { to: "/portfolio", icon: LayoutGrid, label: "Portfolio" },
  { to: "/financials", icon: TrendingUp, label: "Financials" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/experiments", icon: FlaskConical, label: "Experiments" },
];

const aiInsightsItems = [
  { to: "/analysis/strategy", icon: Brain, label: "Strategy" },
  { to: "/analysis/financials", icon: TrendingUp, label: "Financials" },
  { to: "/analysis/pricing", icon: DollarSign, label: "Pricing" },
];
```

**Step 2: Add AI Insights section to sidebar**

Replace the `<nav>` section (around line 56):

```typescript
<nav className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
  {navItems.map((item) => {
    const isActive =
      item.to === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(item.to);

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={`group relative flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 ${
          sidebarCollapsed
            ? "px-0 py-2.5 justify-center"
            : "px-3.5 py-2.5"
        } ${
          isActive
            ? sidebarCollapsed
              ? "bg-accent/10 text-accent"
              : "bg-accent/5 text-accent"
            : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
        }`}
      >
        {isActive && !sidebarCollapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
        )}
        <item.icon
          className={`w-[18px] h-[18px] shrink-0 ${
            isActive
              ? "text-accent"
              : "text-ink-muted group-hover:text-ink-secondary"
          }`}
          strokeWidth={1.8}
        />
        {!sidebarCollapsed && (
          <span className="whitespace-nowrap">{item.label}</span>
        )}
        {sidebarCollapsed && (
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
            {item.label}
          </div>
        )}
      </NavLink>
    );
  })}

  {/* AI Insights Section */}
  <div className={`${sidebarCollapsed ? 'mt-2' : 'mt-4'}`}>
    {!sidebarCollapsed && (
      <div className="px-3.5 py-2 text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
        AI Insights
      </div>
    )}
    {aiInsightsItems.map((item) => {
      const isActive = location.pathname === item.to;

      return (
        <NavLink
          key={item.to}
          to={item.to}
          className={`group relative flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 ${
            sidebarCollapsed
              ? "px-0 py-2.5 justify-center"
              : "px-3.5 py-2.5"
          } ${
            isActive
              ? sidebarCollapsed
                ? "bg-accent/10 text-accent"
                : "bg-accent/5 text-accent"
              : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
          }`}
        >
          {isActive && !sidebarCollapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
          )}
          <item.icon
            className={`w-[18px] h-[18px] shrink-0 ${
              isActive
                ? "text-accent"
                : "text-ink-muted group-hover:text-ink-secondary"
            }`}
            strokeWidth={1.8}
          />
          {!sidebarCollapsed && (
            <span className="whitespace-nowrap">{item.label}</span>
          )}
          {sidebarCollapsed && (
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
              {item.label}
            </div>
          )}
        </NavLink>
      );
    })}
  </div>

  {/* Settings at bottom */}
  <div className="mt-auto pt-4">
    <NavLink
      to="/settings"
      className={`group relative flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 ${
        sidebarCollapsed
          ? "px-0 py-2.5 justify-center"
          : "px-3.5 py-2.5"
      } ${
        location.pathname === "/settings"
          ? sidebarCollapsed
            ? "bg-accent/10 text-accent"
            : "bg-accent/5 text-accent"
          : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
      }`}
    >
      {location.pathname === "/settings" && !sidebarCollapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
      )}
      <Settings
        className={`w-[18px] h-[18px] shrink-0 ${
          location.pathname === "/settings"
            ? "text-accent"
            : "text-ink-muted group-hover:text-ink-secondary"
        }`}
        strokeWidth={1.8}
      />
      {!sidebarCollapsed && (
        <span className="whitespace-nowrap">Settings</span>
      )}
      {sidebarCollapsed && (
        <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
          Settings
        </div>
      )}
    </NavLink>
  </div>
</nav>
```

**Step 3: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors

**Step 4: Test navigation**

```bash
npm run dev
```

Check sidebar has new "AI Insights" section with Strategy, Financials, Pricing links

Expected: All navigation links work correctly

**Step 5: Commit**

```bash
git add app/components/Sidebar.tsx
git commit -m "feat: add AI insights section to sidebar navigation"
```

---

## Phase 6: Polish & Testing

### Task 15: Error Handling & Loading States

**Files:**
- Modify: `app/lib/analysis.server.ts`

**Step 1: Add error handling to refreshAnalysis**

In `app/lib/analysis.server.ts`, wrap `refreshAnalysis` with try-catch:

```typescript
export async function refreshAnalysis(type: AnalysisType): Promise<Analysis> {
  try {
    // 1. Fetch relevant data
    const data = await fetchDataForAnalysis(type);

    // 2. Build prompt
    let prompt: string;
    switch (type) {
      case 'strategy':
        prompt = buildStrategyPrompt(data);
        break;
      case 'financial':
        prompt = buildFinancialPrompt(data);
        break;
      case 'pricing':
        prompt = buildPricingPrompt(data);
        break;
    }

    // 3. Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    // 4. Parse response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    const jsonMatch = responseText.match(/```json\n([\s\S]+?)\n```/) ||
                      responseText.match(/\{[\s\S]+\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonText);

    // 5. Save to database
    const analysis = await saveAnalysis(
      type,
      parsed.summary,
      parsed,
      {
        entries_analyzed: data.journals.length,
        model: 'claude-sonnet-4-5-20250929',
      }
    );

    return analysis;
  } catch (error) {
    console.error(`Error refreshing ${type} analysis:`, error);

    // Try to return last successful analysis
    const lastAnalysis = await getLatestAnalysis(type);
    if (lastAnalysis) {
      console.log(`Returning cached ${type} analysis due to error`);
      return lastAnalysis;
    }

    // If no cached analysis, throw
    throw new Error(`Failed to generate ${type} analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
```

**Step 2: Verify no TypeScript errors**

```bash
npm run typecheck
```

Expected: No errors

**Step 3: Commit**

```bash
git add app/lib/analysis.server.ts
git commit -m "feat: add error handling and fallback to cached analyses"
```

---

### Task 16: Update Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add AI Analysis section to CLAUDE.md**

In `CLAUDE.md`, add after "Key Features" section:

```markdown
### 5. **AI Analysis** (New!)
- **Morning Briefing** (`app/routes/briefing.tsx`) - Unified view of all AI insights
- **Strategy Advisor** (`app/routes/analysis.strategy.tsx`) - Pattern recognition, learnings, blockers, recommendations
- **Financial Analysis** (`app/routes/analysis.financials.tsx`) - Health score, trends, forecasts, optimization levers
- **Pricing Strategy** (`app/routes/analysis.pricing.tsx`) - Positioning, market insights, pricing models, recommendations
- Powered by Claude API (Sonnet 4.5)
- 24-hour caching with manual refresh
- Database-backed analysis storage
```

**Step 2: Update Tech Stack section**

Add to Tech Stack:
```markdown
- **AI**: @anthropic-ai/sdk (Claude API integration)
```

**Step 3: Update Project Structure**

Add to project structure:
```markdown
│   ├── routes/
│   │   ├── briefing.tsx     # Morning briefing with AI summaries
│   │   ├── analysis.strategy.tsx
│   │   ├── analysis.financials.tsx
│   │   ├── analysis.pricing.tsx
│   ├── lib/
│   │   ├── analysis.server.ts  # AI analysis generation
│   │   ├── types/
│   │   │   └── analysis.ts     # Analysis type definitions
```

**Step 4: Add Environment Variables section update**

Update environment variables section:
```markdown
```
DATABASE_URL='postgresql://user:password@host/database?sslmode=require&channel_binding=require'
ANTHROPIC_API_KEY='your_anthropic_api_key_here'
```
```

**Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with AI analysis features"
```

---

### Task 17: Final Testing & Verification

**Step 1: Run full typecheck**

```bash
npm run typecheck
```

Expected: No errors

**Step 2: Test all pages manually**

```bash
npm run dev
```

Visit and test:
- http://localhost:5173/briefing (Morning Briefing)
- http://localhost:5173/analysis/strategy (Strategy Advisor)
- http://localhost:5173/analysis/financials (Financial Analysis)
- http://localhost:5173/analysis/pricing (Pricing Strategy)

Test "Generate Analysis" / "Refresh Analysis" buttons on each page

Expected: All pages load, analyses generate successfully, UI renders correctly

**Step 3: Verify database has analyses**

Connect to Neon database:
```sql
SELECT type, summary, created_at, refreshed_at FROM analyses ORDER BY refreshed_at DESC;
```

Expected: See 3 rows (strategy, financial, pricing) with recent timestamps

**Step 4: Test responsive design**

Resize browser to mobile width

Expected: Cards stack vertically, sidebar collapses, all content readable

**Step 5: Create final commit**

```bash
git add .
git commit -m "feat: AI analysis integration complete - strategy, financial, pricing pages with briefing"
```

---

## Success Criteria Checklist

- [ ] All three analysis pages generate insights from real data
- [ ] Morning briefing displays summaries from all three analyses
- [ ] Manual refresh works on all pages
- [ ] Analyses cached for 24 hours (check database timestamps)
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Error handling gracefully manages API failures (test by breaking API key)
- [ ] Navigation integrated into sidebar with "AI Insights" section
- [ ] Performance: Analysis generation completes in < 20 seconds

---

## Next Steps After Implementation

1. **Enhance Prompts**: Refine AI prompts based on actual analysis quality
2. **Add Real Data**: Integrate actual financials, experiments, portfolio data
3. **Historical Tracking**: Store multiple analyses over time for trend comparison
4. **Scheduled Refresh**: Add cron job for automatic daily analysis generation
5. **Export Features**: Add PDF/email export for analyses
6. **Multi-user Support**: Add user_id to analyses table when auth is implemented

---

**Plan complete!** Follow tasks 1-17 sequentially for systematic implementation.
