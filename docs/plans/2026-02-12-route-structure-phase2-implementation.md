# Route Structure Phase 2: Data Routes - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Data routes for unit economics and customer tracking in the SaaS dashboard

**Architecture:** React Router loaders for data fetching, server functions for database queries, reusable components for visualization, mock data for initial testing

**Tech Stack:** React Router 7, TypeScript, Neon PostgreSQL, Recharts, date-fns, TailwindCSS

---

## Overview

Phase 2 implements the Data section routes which are the foundation for tracking SaaS business health:
- `/data/unit-economics` - Core SaaS metrics (MRR, ARR, CAC, LTV, ratios)
- `/data/customers` - Customer lifecycle and health tracking
- Server functions for database queries
- Mock data population for testing

**Estimated Time:** 6-8 hours

---

## Task 1: Create Data Server Functions

**Files:**
- Create: `app/lib/data.server.ts`

**Step 1: Create server functions file**

```typescript
import { neon } from "@neondatabase/serverless";
import type {
  SaasMetrics,
  Customer,
  CustomerStats,
  CohortData,
} from "../types/dashboard";

const sql = neon(process.env.DATABASE_URL!);

// SaaS Metrics Functions
export async function getSaasMetrics(days: number = 30): Promise<SaasMetrics[]> {
  const results = await sql`
    SELECT *
    FROM saas_metrics
    WHERE date >= CURRENT_DATE - ${days}
    ORDER BY date DESC
  `;

  return results.map((row) => ({
    ...row,
    date: new Date(row.date),
    created_at: new Date(row.created_at),
  }));
}

export async function getLatestSaasMetrics(): Promise<SaasMetrics | null> {
  const results = await sql`
    SELECT *
    FROM saas_metrics
    ORDER BY date DESC
    LIMIT 1
  `;

  if (results.length === 0) return null;

  const row = results[0];
  return {
    ...row,
    date: new Date(row.date),
    created_at: new Date(row.created_at),
  };
}

// Customer Functions
export async function getAllCustomers(): Promise<Customer[]> {
  const results = await sql`
    SELECT *
    FROM customers
    ORDER BY created_at DESC
  `;

  return results.map((row) => ({
    ...row,
    signup_date: row.signup_date ? new Date(row.signup_date) : null,
    activation_date: row.activation_date ? new Date(row.activation_date) : null,
    churned_date: row.churned_date ? new Date(row.churned_date) : null,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }));
}

export async function getCustomerStats(): Promise<CustomerStats> {
  const results = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE churned_date IS NULL) as active,
      COUNT(*) FILTER (WHERE churned_date IS NOT NULL) as churned,
      COUNT(*) FILTER (WHERE DATE_TRUNC('month', signup_date) = DATE_TRUNC('month', CURRENT_DATE)) as new_this_month,
      ROUND(AVG(health_score)::numeric, 2) as avg_health_score,
      ROUND(
        (COUNT(*) FILTER (WHERE activation_date IS NOT NULL)::decimal / NULLIF(COUNT(*), 0) * 100)::numeric,
        2
      ) as activation_rate
    FROM customers
  `;

  const row = results[0];
  return {
    total: Number(row.total),
    active: Number(row.active),
    churned: Number(row.churned),
    new_this_month: Number(row.new_this_month),
    avg_health_score: Number(row.avg_health_score || 0),
    activation_rate: Number(row.activation_rate || 0),
  };
}

export async function getCohortAnalysis(): Promise<CohortData[]> {
  const results = await sql`
    SELECT
      cohort,
      COUNT(*) as customers,
      SUM(mrr) as mrr,
      ROUND(
        (COUNT(*) FILTER (WHERE churned_date IS NULL)::decimal / COUNT(*) * 100)::numeric,
        2
      ) as retention_rate,
      ROUND(
        (COUNT(*) FILTER (WHERE churned_date IS NOT NULL)::decimal / COUNT(*) * 100)::numeric,
        2
      ) as churn_rate
    FROM customers
    WHERE cohort IS NOT NULL
    GROUP BY cohort
    ORDER BY cohort DESC
    LIMIT 12
  `;

  return results.map((row) => ({
    cohort: row.cohort,
    customers: Number(row.customers),
    mrr: Number(row.mrr || 0),
    retention_rate: Number(row.retention_rate || 0),
    churn_rate: Number(row.churn_rate || 0),
  }));
}

export async function searchCustomers(
  query?: string,
  filters?: {
    plan?: string;
    segment?: string;
    health_status?: 'critical' | 'at-risk' | 'healthy' | 'excellent';
  }
): Promise<Customer[]> {
  let queryBuilder = sql`SELECT * FROM customers WHERE 1=1`;

  if (query) {
    queryBuilder = sql`${queryBuilder} AND (name ILIKE ${'%' + query + '%'} OR email ILIKE ${'%' + query + '%'})`;
  }

  if (filters?.plan) {
    queryBuilder = sql`${queryBuilder} AND plan = ${filters.plan}`;
  }

  if (filters?.segment) {
    queryBuilder = sql`${queryBuilder} AND segment = ${filters.segment}`;
  }

  if (filters?.health_status) {
    const ranges = {
      critical: [0, 25],
      'at-risk': [26, 50],
      healthy: [51, 75],
      excellent: [76, 100],
    };
    const [min, max] = ranges[filters.health_status];
    queryBuilder = sql`${queryBuilder} AND health_score BETWEEN ${min} AND ${max}`;
  }

  queryBuilder = sql`${queryBuilder} ORDER BY created_at DESC LIMIT 100`;

  const results = await queryBuilder;

  return results.map((row) => ({
    ...row,
    signup_date: row.signup_date ? new Date(row.signup_date) : null,
    activation_date: row.activation_date ? new Date(row.activation_date) : null,
    churned_date: row.churned_date ? new Date(row.churned_date) : null,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }));
}
```

**Step 2: Commit**

```bash
git add app/lib/data.server.ts
git commit -m "feat: add server functions for SaaS metrics and customer data"
```

---

## Task 2: Populate Mock Data in Database

**Files:**
- Create: `scripts/seed-data.ts`

**Step 1: Create seed script**

```typescript
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { mockData } from "../app/data/mockGenerators";

config();

const sql = neon(process.env.DATABASE_URL!);

async function seedData() {
  console.log("Seeding database with mock data...");

  try {
    // Clear existing data
    await sql`DELETE FROM saas_metrics`;
    await sql`DELETE FROM customers`;
    await sql`DELETE FROM marketing_channels`;

    // Generate and insert SaaS metrics
    const saasMetrics = mockData.generateSaasMetrics(90);
    for (const metric of saasMetrics) {
      await sql`
        INSERT INTO saas_metrics (
          date, mrr, arr, cac, ltv, ltv_cac_ratio, payback_period_months,
          gross_margin, nrr, active_customers, new_customers, churned_customers
        ) VALUES (
          ${metric.date},
          ${metric.mrr},
          ${metric.arr},
          ${metric.cac},
          ${metric.ltv},
          ${metric.ltv_cac_ratio},
          ${metric.payback_period_months},
          ${metric.gross_margin},
          ${metric.nrr},
          ${metric.active_customers},
          ${metric.new_customers},
          ${metric.churned_customers}
        )
      `;
    }
    console.log(`✓ Inserted ${saasMetrics.length} SaaS metrics records`);

    // Generate and insert customers
    const customers = mockData.generateCustomers(100);
    for (const customer of customers) {
      await sql`
        INSERT INTO customers (
          email, name, plan, mrr, health_score, segment,
          signup_date, activation_date, churned_date, cohort
        ) VALUES (
          ${customer.email},
          ${customer.name},
          ${customer.plan},
          ${customer.mrr},
          ${customer.health_score},
          ${customer.segment},
          ${customer.signup_date},
          ${customer.activation_date},
          ${customer.churned_date},
          ${customer.cohort}
        )
      `;
    }
    console.log(`✓ Inserted ${customers.length} customer records`);

    // Generate and insert marketing channels
    const marketingChannels = mockData.generateMarketingChannels(90);
    for (const channel of marketingChannels) {
      await sql`
        INSERT INTO marketing_channels (
          channel_name, channel_type, date, spend, impressions, clicks,
          leads, signups, paid_conversions, revenue
        ) VALUES (
          ${channel.channel_name},
          ${channel.channel_type},
          ${channel.date},
          ${channel.spend},
          ${channel.impressions},
          ${channel.clicks},
          ${channel.leads},
          ${channel.signups},
          ${channel.paid_conversions},
          ${channel.revenue}
        )
      `;
    }
    console.log(`✓ Inserted ${marketingChannels.length} marketing channel records`);

    console.log("✓ Database seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
```

**Step 2: Add seed script to package.json**

Modify `package.json` to add:
```json
"seed": "tsx scripts/seed-data.ts"
```

**Step 3: Run seed script**

Run: `npm run seed`
Expected: Database populated with mock data

**Step 4: Commit**

```bash
git add scripts/seed-data.ts package.json
git commit -m "feat: add database seeding script with mock data"
```

---

## Task 3: Create Unit Economics Route

**Files:**
- Create: `app/routes/data.unit-economics.tsx`

**Step 1: Create route file**

```typescript
import { json } from "react-router";
import type { Route } from "./+types/data.unit-economics";
import { useLoaderData } from "react-router";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { BarChart3 } from "lucide-react";
import { getSaasMetrics, getLatestSaasMetrics } from "../lib/data.server";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";

export async function loader({ request }: Route.LoaderArgs) {
  const [metrics, latest] = await Promise.all([
    getSaasMetrics(90),
    getLatestSaasMetrics(),
  ]);

  return json({ metrics, latest });
}

export default function UnitEconomics({ loaderData }: Route.ComponentProps) {
  const { metrics, latest } = loaderData;

  if (!latest) {
    return (
      <Layout>
        <PageHeader
          title="Unit Economics"
          description="Core SaaS metrics that define business health"
        />
        <EmptyState
          icon={BarChart3}
          title="No data available"
          description="Run 'npm run seed' to populate the database with sample data."
        />
      </Layout>
    );
  }

  const chartData = metrics.map((m) => ({
    date: format(m.date, 'MMM dd'),
    MRR: m.mrr,
    CAC: m.cac,
    LTV: m.ltv,
  }));

  return (
    <Layout>
      <PageHeader
        title="Unit Economics"
        description="Core SaaS metrics that define business health"
      />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="MRR"
          value={`$${latest.mrr?.toLocaleString() || 0}`}
          trend={5.2}
        />
        <StatCard
          label="ARR"
          value={`$${latest.arr?.toLocaleString() || 0}`}
        />
        <StatCard
          label="CAC"
          value={`$${latest.cac?.toFixed(0) || 0}`}
        />
        <StatCard
          label="LTV"
          value={`$${latest.ltv?.toFixed(0) || 0}`}
        />
      </div>

      {/* Ratio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="LTV:CAC Ratio"
          value={latest.ltv_cac_ratio?.toFixed(2) || '0'}
          subtitle="Target: 3:1 or higher"
        />
        <StatCard
          label="Payback Period"
          value={`${latest.payback_period_months?.toFixed(1) || 0} months`}
        />
        <StatCard
          label="Net Revenue Retention"
          value={`${latest.nrr?.toFixed(1) || 0}%`}
        />
      </div>

      {/* Trend Chart */}
      <div className="bg-surface border border-edge rounded-lg p-6">
        <h3 className="text-lg font-semibold text-ink mb-4">90-Day Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="MRR" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="CAC" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="LTV" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard
          label="Active Customers"
          value={latest.active_customers?.toLocaleString() || '0'}
        />
        <StatCard
          label="New This Month"
          value={latest.new_customers?.toLocaleString() || '0'}
          trend={12.5}
        />
        <StatCard
          label="Churned This Month"
          value={latest.churned_customers?.toLocaleString() || '0'}
          trend={-5.3}
        />
      </div>
    </Layout>
  );
}
```

**Step 2: Commit**

```bash
git add app/routes/data.unit-economics.tsx
git commit -m "feat: add unit economics route with metrics visualization"
```

---

## Task 4: Create Customers Route

**Files:**
- Create: `app/routes/data.customers.tsx`

**Step 1: Create route file**

```typescript
import { json } from "react-router";
import type { Route } from "./+types/data.customers";
import { useLoaderData } from "react-router";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import { Users } from "lucide-react";
import {
  getAllCustomers,
  getCustomerStats,
  getCohortAnalysis,
} from "../lib/data.server";
import type { Customer } from "../types/dashboard";
import { format } from "date-fns";

export async function loader({ request }: Route.LoaderArgs) {
  const [customers, stats, cohorts] = await Promise.all([
    getAllCustomers(),
    getCustomerStats(),
    getCohortAnalysis(),
  ]);

  return json({ customers, stats, cohorts });
}

function getHealthLabel(score: number | null): { label: string; color: string } {
  if (score === null) return { label: 'Unknown', color: 'text-ink-muted' };
  if (score >= 76) return { label: 'Excellent', color: 'text-green-600' };
  if (score >= 51) return { label: 'Healthy', color: 'text-blue-600' };
  if (score >= 26) return { label: 'At Risk', color: 'text-yellow-600' };
  return { label: 'Critical', color: 'text-red-600' };
}

export default function Customers({ loaderData }: Route.ComponentProps) {
  const { customers, stats, cohorts } = loaderData;

  if (customers.length === 0) {
    return (
      <Layout>
        <PageHeader
          title="Customers"
          description="Customer lifecycle and behavioral metrics"
        />
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Run 'npm run seed' to populate the database with sample customer data."
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Customers"
        description="Customer lifecycle and behavioral metrics"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Customers"
          value={stats.total.toLocaleString()}
        />
        <StatCard
          label="Active"
          value={stats.active.toLocaleString()}
        />
        <StatCard
          label="New This Month"
          value={stats.new_this_month.toLocaleString()}
          trend={15.2}
        />
        <StatCard
          label="Churned"
          value={stats.churned.toLocaleString()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          label="Activation Rate"
          value={`${stats.activation_rate.toFixed(1)}%`}
        />
        <StatCard
          label="Avg Health Score"
          value={stats.avg_health_score.toFixed(0)}
        />
      </div>

      {/* Cohort Analysis */}
      <div className="bg-surface border border-edge rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-ink mb-4">Cohort Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Cohort</th>
                <th className="text-right text-xs font-medium text-ink-secondary py-3 px-4">Customers</th>
                <th className="text-right text-xs font-medium text-ink-secondary py-3 px-4">MRR</th>
                <th className="text-right text-xs font-medium text-ink-secondary py-3 px-4">Retention</th>
                <th className="text-right text-xs font-medium text-ink-secondary py-3 px-4">Churn</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => (
                <tr key={cohort.cohort} className="border-b border-edge">
                  <td className="py-3 px-4 text-sm text-ink">{cohort.cohort}</td>
                  <td className="py-3 px-4 text-sm text-ink text-right">{cohort.customers}</td>
                  <td className="py-3 px-4 text-sm text-ink text-right">${cohort.mrr.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-green-600 text-right">{cohort.retention_rate}%</td>
                  <td className="py-3 px-4 text-sm text-red-600 text-right">{cohort.churn_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-surface border border-edge rounded-lg p-6">
        <h3 className="text-lg font-semibold text-ink mb-4">Recent Customers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Email</th>
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Plan</th>
                <th className="text-right text-xs font-medium text-ink-secondary py-3 px-4">MRR</th>
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Health</th>
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Segment</th>
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Signup Date</th>
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 20).map((customer) => {
                const health = getHealthLabel(customer.health_score);
                return (
                  <tr key={customer.id} className="border-b border-edge">
                    <td className="py-3 px-4 text-sm text-ink">{customer.email}</td>
                    <td className="py-3 px-4 text-sm text-ink capitalize">{customer.plan || '-'}</td>
                    <td className="py-3 px-4 text-sm text-ink text-right">
                      ${customer.mrr?.toFixed(0) || 0}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`${health.color} font-medium`}>
                        {customer.health_score || '-'} {customer.health_score && `(${health.label})`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-ink capitalize">{customer.segment || '-'}</td>
                    <td className="py-3 px-4 text-sm text-ink-secondary">
                      {customer.signup_date ? format(customer.signup_date, 'MMM dd, yyyy') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
```

**Step 2: Commit**

```bash
git add app/routes/data.customers.tsx
git commit -m "feat: add customers route with stats and cohort analysis"
```

---

## Task 5: Test Data Routes

**Files:**
- None (testing only)

**Step 1: Start dev server**

Run: `npm run dev`
Expected: App starts without errors

**Step 2: Test Unit Economics route**

1. Navigate to http://localhost:5174/data/unit-economics
2. Verify metrics cards display correctly
3. Verify chart renders with 90-day trend
4. Check responsive layout on mobile

**Step 3: Test Customers route**

1. Navigate to http://localhost:5174/data/customers
2. Verify stats cards display correctly
3. Verify cohort analysis table shows data
4. Verify customer list displays recent customers
5. Check responsive layout on mobile

**Step 4: Run type check**

Run: `npm run typecheck`
Expected: No TypeScript errors

**Step 5: Document completion**

No commit needed - testing only

---

## Success Criteria

- [ ] Server functions created for SaaS metrics and customers
- [ ] Database seeding script created and executed successfully
- [ ] Unit Economics route displays metrics and charts
- [ ] Customers route displays stats, cohorts, and customer list
- [ ] Both routes handle empty state gracefully
- [ ] No TypeScript errors
- [ ] Responsive design works on mobile
- [ ] All changes committed to git

---

## Next Phase

After Phase 2 completion, proceed to:
- **Phase 3: Marketing Routes** (`/marketing`, `/marketing/paid`, `/marketing/organic`)
