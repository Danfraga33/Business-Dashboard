# AI Analysis Integration - Design Document

**Date**: 2026-02-12
**Status**: Design Complete, Ready for Implementation
**Owner**: Personal use (expandable to multi-user later)

## Overview

Integrate AI-powered business analysis into the dashboard with three dedicated analysis types plus a unified morning briefing view. Uses Claude API for generating insights from existing business data (journals, financials, experiments, portfolio).

---

## Architecture

### Core Features

1. **Morning Briefing** (`/briefing`) - Daily snapshot showing 2-3 insights from each analysis
2. **Strategy Advisor** (`/analysis/strategy`) - AI analyzes journals/experiments for patterns and recommendations
3. **Financial Analysis** (`/analysis/financials`) - Deep dive into financial health, trends, forecasts
4. **Pricing Strategy** (`/analysis/pricing`) - Data-driven pricing and marketing recommendations

### Data Flow

```
User triggers refresh (manual or daily auto-refresh)
  ↓
Fetch relevant data (journals, financials, experiments, portfolio)
  ↓
Send to Claude API with structured prompts
  ↓
Parse AI response into typed structures
  ↓
Store in `analyses` table
  ↓
Display summaries in briefing, full details in dedicated pages
```

### Tech Stack

- **AI**: Claude API (Sonnet 4.5) via `@anthropic-ai/sdk`
- **Database**: New `analyses` table in Neon PostgreSQL
- **API Layer**: `app/lib/analysis.server.ts`
- **Routes**: `/briefing`, `/analysis/strategy`, `/analysis/financials`, `/analysis/pricing`
- **Components**: Reuse existing + new analysis-specific components

---

## Database Schema

### New Table: `analyses`

```sql
CREATE TABLE analyses (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'strategy', 'financial', 'pricing'
  summary TEXT NOT NULL,      -- 2-3 sentence summary for morning brief
  full_analysis JSONB NOT NULL, -- Structured analysis data
  metadata JSONB,              -- Additional context (date range analyzed, etc.)
  created_at TIMESTAMP DEFAULT NOW(),
  refreshed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analyses_type ON analyses(type);
CREATE INDEX idx_analyses_refreshed_at ON analyses(refreshed_at DESC);
```

### TypeScript Types

```typescript
type AnalysisType = 'strategy' | 'financial' | 'pricing';

interface Analysis {
  id: number;
  type: AnalysisType;
  summary: string;
  full_analysis: StrategyAnalysis | FinancialAnalysis | PricingAnalysis;
  metadata?: Record<string, any>;
  created_at: Date;
  refreshed_at: Date;
}

interface StrategyAnalysis {
  patterns: Array<{ title: string; description: string; frequency: string }>;
  key_learnings: Array<{ learning: string; source: string; impact: 'high' | 'medium' | 'low' }>;
  recurring_blockers: Array<{ blocker: string; occurrences: number; suggested_action: string }>;
  recommendations: Array<{ priority: number; recommendation: string; rationale: string }>;
  momentum_score: number; // 0-100
}

interface FinancialAnalysis {
  health_score: number; // 0-100
  key_metrics: Array<{ metric: string; value: string; trend: 'up' | 'down' | 'stable'; change_pct: number }>;
  trends: Array<{ trend: string; description: string; time_period: string }>;
  forecasts: Array<{ metric: string; prediction: string; confidence: 'high' | 'medium' | 'low'; timeframe: string }>;
  optimization_levers: Array<{ lever: string; potential_impact: string; difficulty: 'easy' | 'medium' | 'hard' }>;
  alerts: Array<{ severity: 'critical' | 'warning' | 'info'; message: string }>;
}

interface PricingAnalysis {
  current_positioning: { segment: string; description: string; strengths: string[]; weaknesses: string[] };
  market_insights: Array<{ insight: string; implication: string }>;
  pricing_models: Array<{ model: string; pros: string[]; cons: string[]; fit_score: number }>;
  recommendations: Array<{
    category: 'pricing' | 'packaging' | 'positioning' | 'marketing';
    recommendation: string;
    expected_impact: string;
    implementation_effort: 'low' | 'medium' | 'high';
  }>;
  quick_wins: Array<{ action: string; rationale: string }>;
}
```

---

## Page Designs

### 1. Morning Briefing (`/briefing`)

**Layout**:
- Header: "Morning Briefing - [Date]" + "Refresh All Analyses" button
- Three cards (strategy, financial, pricing)
- Each card: Title, icon, summary (2-3 sentences), last updated, "View Full Analysis →" link

**Auto-refresh Logic**:
- Check if any analysis > 24 hours old
- Show banner: "New data available. Refresh to see latest insights"
- Optional: auto-refresh on page load

**Components**:
```tsx
<Layout>
  <BriefingHeader onRefreshAll={handleRefreshAll} />
  <div className="grid gap-6 md:grid-cols-3">
    <AnalysisSummaryCard type="strategy" {...} />
    <AnalysisSummaryCard type="financial" {...} />
    <AnalysisSummaryCard type="pricing" {...} />
  </div>
</Layout>
```

---

### 2. Strategy Advisor (`/analysis/strategy`)

**Data Sources**:
- Last 30 days of journal entries
- Experiments data

**Layout Sections**:
1. Header: "Strategy Advisor" + "Refresh Analysis" + last updated
2. Momentum Score Card (0-100 gauge)
3. Key Patterns (expandable cards)
4. Top Learnings (bullets with impact badges)
5. Recurring Blockers (list with occurrence counts + actions)
6. Strategic Recommendations (prioritized 1-5)

**Visuals**: `ExpandableCard`, color-coded impact badges, sparklines for momentum trends

---

### 3. Financial Analysis (`/analysis/financials`)

**Data Sources**:
- Financials data (revenue, expenses, margins, cash flow)
- Historical data for trends

**Layout Sections**:
1. Header + Refresh button
2. Health Score Dashboard (0-100, color coded)
3. Alerts (critical/warning banners)
4. Key Metrics (grid with trend indicators)
5. Trends Analysis (charts + narratives)
6. Forecasts (predictions with confidence)
7. Optimization Levers (impact vs difficulty matrix)

**Visuals**: Recharts graphs, `HealthIndicator`, `MetricComparison`

---

### 4. Pricing Strategy (`/analysis/pricing`)

**Data Sources**:
- Portfolio data
- Financial data (revenue, customers)
- Journal entries (customer feedback, pricing experiments)

**Layout Sections**:
1. Header + Refresh button
2. Current Positioning (segment, strengths/weaknesses)
3. Market Insights (key insights + implications)
4. Pricing Model Comparison (table with fit scores)
5. Strategic Recommendations (categorized)
6. Quick Wins (low-effort, high-impact actions)

**Visuals**: Progress bars for fit scores, category badges, `ExpandableCard`

---

## AI Integration

### API Layer (`app/lib/analysis.server.ts`)

```typescript
async function generateAnalysis(type: AnalysisType): Promise<Analysis> {
  // 1. Fetch data
  const data = await fetchDataForAnalysis(type);

  // 2. Build prompt
  const prompt = buildPromptForType(type, data);

  // 3. Call Claude API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  // 4. Parse response
  const analysis = await parseAnalysisResponse(response, type);

  // 5. Save to database
  return await saveAnalysis(type, analysis);
}
```

### Prompt Engineering

Each analysis type has specialized prompts that:
- Provide business data context
- Define JSON output schema
- Set analysis depth and focus
- Ensure actionable insights

### Caching Strategy

- Cache analyses for 24 hours
- Manual refresh bypasses cache
- Store raw API responses for debugging

### Error Handling

- Retry logic for API failures
- Fallback to last successful analysis
- User-friendly error messages

---

## UI/UX Patterns

### Visual Language

- **Colors**: Green (positive), Yellow (warning), Red (critical), Blue (info)
- **Icons**: `Brain` (strategy), `TrendingUp` (financials), `DollarSign` (pricing)
- **Components**: Reuse `StatCard`, `ExpandableCard`, `HealthIndicator`

### Loading & Empty States

- Skeleton loaders during AI generation (5-15 seconds)
- Empty state: "No analysis yet. Click 'Generate Analysis' to get started"
- Progress: "Analyzing your data..." with spinner

### Responsive Design

- Briefing: 3 columns → stacked on mobile
- Analysis pages: Sidebar → collapsible on mobile
- Charts scale gracefully

### Navigation

- New sidebar section: "AI Insights"
  - Briefing
  - Strategy Advisor
  - Financial Analysis
  - Pricing Strategy
- Breadcrumbs on analysis pages
- Quick links between related analyses

---

## Implementation Phases

### Phase 1: Foundation
- Database table + migration
- `analysis.server.ts` with Claude API
- Reusable components
- TypeScript types

### Phase 2: Strategy Advisor
- `/analysis/strategy` route
- Strategy-specific prompts
- UI components

### Phase 3: Financial Analysis
- `/analysis/financials` route
- Financial analysis logic
- Charts and visualizations

### Phase 4: Pricing Strategy
- `/analysis/pricing` route
- Pricing analysis logic
- Comparison tables

### Phase 5: Morning Briefing
- `/briefing` route
- Unified summary view
- "Refresh All" functionality

### Phase 6: Polish
- Loading states
- Error boundaries
- Caching optimizations
- Testing

**Estimated Effort**: 6-8 focused sessions

---

## Environment Variables

Add to `.env`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

---

## Success Criteria

- [ ] All three analysis pages generate insights from real data
- [ ] Morning briefing displays summaries from all three analyses
- [ ] Manual refresh works on all pages
- [ ] Analyses cached for 24 hours
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Error handling gracefully manages API failures
- [ ] Navigation integrated into sidebar
- [ ] Performance: Analysis generation < 20 seconds

---

## Future Enhancements

- Multi-user support (user_id in analyses table)
- Historical analysis comparison (track trends over time)
- Export analysis to PDF/email
- Scheduled daily auto-refresh with notifications
- AI chat interface for follow-up questions
- Integration with external data sources (Stripe, Google Analytics, etc.)
