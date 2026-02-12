# Route Structure Phase 1: Foundation - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build foundation for comprehensive SaaS dashboard route structure

**Architecture:** Database-first approach with type-safe server functions, collapsible sidebar navigation, and reusable UI components. Start with database schema, then types, then navigation, then shared components.

**Tech Stack:** React Router 7, TypeScript, Neon PostgreSQL, TailwindCSS, Zustand, Lucide React

---

## Overview

Phase 1 establishes the foundation for the entire route structure project:
- Database tables for all new data (customers, marketing, operations)
- TypeScript types for type safety
- Enhanced sidebar with collapsible sub-navigation
- Shared UI components for consistent design

**Estimated Time:** 6-8 hours

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install date-fns for date formatting**

Run: `npm install date-fns`
Expected: Package installed successfully

**Step 2: Verify installation**

Run: `npm list date-fns`
Expected: Shows date-fns@^3.x.x

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add date-fns for date formatting"
```

---

## Task 2: Create Database Migration Script

**Files:**
- Modify: `scripts/migrate.ts`

**Step 1: Update migration script with all new tables**

```typescript
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log("Running migrations...");

  try {
    // Create journal_entries table (existing)
    await sql`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        business VARCHAR(255),
        hypothesis TEXT NOT NULL,
        shipped TEXT NOT NULL,
        learned TEXT NOT NULL,
        blockers TEXT,
        tomorrow TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at
      ON journal_entries(created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_business
      ON journal_entries(business)
    `;

    // Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        plan VARCHAR(50),
        mrr DECIMAL(10,2),
        health_score INT,
        segment VARCHAR(50),
        signup_date TIMESTAMP WITH TIME ZONE,
        activation_date TIMESTAMP WITH TIME ZONE,
        churned_date TIMESTAMP WITH TIME ZONE,
        churn_reason TEXT,
        cohort VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_customers_email
      ON customers(email)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_customers_cohort
      ON customers(cohort)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_customers_health_score
      ON customers(health_score)
    `;

    // Create saas_metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS saas_metrics (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        mrr DECIMAL(10,2),
        arr DECIMAL(10,2),
        cac DECIMAL(10,2),
        ltv DECIMAL(10,2),
        ltv_cac_ratio DECIMAL(5,2),
        payback_period_months DECIMAL(5,2),
        gross_margin DECIMAL(5,2),
        nrr DECIMAL(5,2),
        active_customers INT,
        new_customers INT,
        churned_customers INT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_saas_metrics_date
      ON saas_metrics(date DESC)
    `;

    // Create marketing_channels table
    await sql`
      CREATE TABLE IF NOT EXISTS marketing_channels (
        id SERIAL PRIMARY KEY,
        channel_name VARCHAR(100) NOT NULL,
        channel_type VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        spend DECIMAL(10,2),
        impressions INT,
        clicks INT,
        leads INT,
        signups INT,
        paid_conversions INT,
        revenue DECIMAL(10,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_marketing_date
      ON marketing_channels(date DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_marketing_channel
      ON marketing_channels(channel_name)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_marketing_type
      ON marketing_channels(channel_type)
    `;

    // Create pricing_experiments table
    await sql`
      CREATE TABLE IF NOT EXISTS pricing_experiments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        hypothesis TEXT,
        variant_a JSONB,
        variant_b JSONB,
        start_date DATE,
        end_date DATE,
        status VARCHAR(20),
        winner VARCHAR(10),
        revenue_impact DECIMAL(10,2),
        statistical_significance DECIMAL(5,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_pricing_experiments_status
      ON pricing_experiments(status)
    `;

    // Create feature_rollouts table
    await sql`
      CREATE TABLE IF NOT EXISTS feature_rollouts (
        id SERIAL PRIMARY KEY,
        feature_name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20),
        release_date DATE,
        adoption_rate DECIMAL(5,2),
        engagement_score INT,
        retention_impact DECIMAL(5,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_feature_rollouts_status
      ON feature_rollouts(status)
    `;

    // Create infrastructure_metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS infrastructure_metrics (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        service_name VARCHAR(100),
        cost DECIMAL(10,2),
        uptime_percentage DECIMAL(5,2),
        api_response_time_p50 INT,
        api_response_time_p95 INT,
        api_response_time_p99 INT,
        total_requests INT,
        error_rate DECIMAL(5,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_infra_date
      ON infrastructure_metrics(date DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_infra_service
      ON infrastructure_metrics(service_name)
    `;

    // Create support_tickets table
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(id),
        subject VARCHAR(255),
        description TEXT,
        priority VARCHAR(20),
        category VARCHAR(50),
        status VARCHAR(20),
        first_response_time INT,
        resolution_time INT,
        assigned_to VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        resolved_at TIMESTAMP WITH TIME ZONE
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_tickets_status
      ON support_tickets(status)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_tickets_priority
      ON support_tickets(priority)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_tickets_customer
      ON support_tickets(customer_id)
    `;

    console.log("✓ Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
```

**Step 2: Run migration**

Run: `npm run migrate`
Expected: "✓ Migration completed successfully"

**Step 3: Commit**

```bash
git add scripts/migrate.ts
git commit -m "feat: add database tables for SaaS metrics, customers, marketing, operations"
```

---

## Task 3: Create TypeScript Types

**Files:**
- Create: `app/types/dashboard.ts`

**Step 1: Create types file**

```typescript
// SaaS Metrics Types
export interface SaasMetrics {
  id: number;
  date: Date;
  mrr: number;
  arr: number;
  cac: number;
  ltv: number;
  ltv_cac_ratio: number;
  payback_period_months: number;
  gross_margin: number;
  nrr: number;
  active_customers: number;
  new_customers: number;
  churned_customers: number;
  created_at: Date;
}

// Customer Types
export type CustomerPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type CustomerSegment = 'smb' | 'mid-market' | 'enterprise';

export interface Customer {
  id: number;
  email: string;
  name: string | null;
  plan: CustomerPlan | null;
  mrr: number | null;
  health_score: number | null; // 0-100
  segment: CustomerSegment | null;
  signup_date: Date | null;
  activation_date: Date | null;
  churned_date: Date | null;
  churn_reason: string | null;
  cohort: string | null; // 'YYYY-MM'
  created_at: Date;
  updated_at: Date;
}

export interface CustomerStats {
  total: number;
  active: number;
  churned: number;
  new_this_month: number;
  activation_rate: number;
  avg_health_score: number;
}

// Marketing Types
export type ChannelType = 'paid' | 'organic';

export interface MarketingChannel {
  id: number;
  channel_name: string;
  channel_type: ChannelType;
  date: Date;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  leads: number | null;
  signups: number | null;
  paid_conversions: number | null;
  revenue: number | null;
  created_at: Date;
}

export interface MarketingMetrics {
  total_spend: number;
  blended_cac: number;
  total_signups: number;
  conversion_rate: number;
  ctr: number;
  roas: number;
}

// Pricing Experiments Types
export type ExperimentStatus = 'active' | 'completed' | 'cancelled';
export type ExperimentWinner = 'A' | 'B' | null;

export interface PricingVariant {
  plan: string;
  price: number;
  billing: string;
  features?: string[];
}

export interface PricingExperiment {
  id: number;
  name: string;
  hypothesis: string | null;
  variant_a: PricingVariant;
  variant_b: PricingVariant;
  start_date: Date | null;
  end_date: Date | null;
  status: ExperimentStatus;
  winner: ExperimentWinner;
  revenue_impact: number | null;
  statistical_significance: number | null;
  created_at: Date;
}

// Feature Rollouts Types
export type FeatureStatus = 'dev' | 'beta' | 'production';

export interface FeatureRollout {
  id: number;
  feature_name: string;
  description: string | null;
  status: FeatureStatus;
  release_date: Date | null;
  adoption_rate: number | null;
  engagement_score: number | null; // 0-100
  retention_impact: number | null;
  created_at: Date;
  updated_at: Date;
}

// Infrastructure Types
export interface InfrastructureMetrics {
  id: number;
  date: Date;
  service_name: string | null;
  cost: number | null;
  uptime_percentage: number | null;
  api_response_time_p50: number | null;
  api_response_time_p95: number | null;
  api_response_time_p99: number | null;
  total_requests: number | null;
  error_rate: number | null;
  created_at: Date;
}

// Support Tickets Types
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'bug' | 'feature_request' | 'question' | 'billing';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: number;
  customer_id: number | null;
  subject: string | null;
  description: string | null;
  priority: TicketPriority | null;
  category: TicketCategory | null;
  status: TicketStatus | null;
  first_response_time: number | null; // minutes
  resolution_time: number | null; // minutes
  assigned_to: string | null;
  created_at: Date;
  resolved_at: Date | null;
}

export interface SupportMetrics {
  open_tickets: number;
  avg_first_response_time: number;
  avg_resolution_time: number;
  tickets_closed_this_week: number;
  tickets_closed_this_month: number;
}

// Cohort Analysis Types
export interface CohortData {
  cohort: string; // 'YYYY-MM'
  customers: number;
  mrr: number;
  retention_rate: number;
  churn_rate: number;
}

// Health Indicator Types
export interface HealthScore {
  score: number; // 0-100
  label: 'critical' | 'at-risk' | 'healthy' | 'excellent';
  color: string;
}
```

**Step 2: Commit**

```bash
git add app/types/dashboard.ts
git commit -m "feat: add TypeScript types for all dashboard data models"
```

---

## Task 4: Update Sidebar Navigation (Part 1 - Types & State)

**Files:**
- Create: `app/types/navigation.ts`
- Modify: `app/store/dashboard.ts`

**Step 1: Create navigation types**

Create `app/types/navigation.ts`:

```typescript
import { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  children?: NavItem[];
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}
```

**Step 2: Read current dashboard store**

Run: Read `app/store/dashboard.ts` to see current structure

**Step 3: Update dashboard store with expanded sections state**

Modify `app/store/dashboard.ts` to add expanded sections tracking:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DashboardStore {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  expandedSections: string[]; // NEW: track which sections are expanded
  toggleSidebar: () => void;
  toggleTheme: () => void;
  toggleSection: (section: string) => void; // NEW: toggle section expansion
  isSectionExpanded: (section: string) => boolean; // NEW: check if section is expanded
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: "light",
      expandedSections: ["data", "marketing", "operations"], // Default expanded
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      toggleSection: (section: string) =>
        set((state) => ({
          expandedSections: state.expandedSections.includes(section)
            ? state.expandedSections.filter((s) => s !== section)
            : [...state.expandedSections, section],
        })),
      isSectionExpanded: (section: string) =>
        get().expandedSections.includes(section),
    }),
    {
      name: "dashboard-storage",
    }
  )
);
```

**Step 4: Commit**

```bash
git add app/types/navigation.ts app/store/dashboard.ts
git commit -m "feat: add navigation types and expanded sections state"
```

---

## Task 5: Update Sidebar Navigation (Part 2 - Component)

**Files:**
- Modify: `app/components/Sidebar.tsx`

**Step 1: Read current Sidebar component**

Already read above

**Step 2: Update Sidebar with collapsible sections**

```typescript
import { NavLink, useLocation } from "react-router";
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
  Database,
  BarChart3,
  Cog,
  ChevronDown,
  Users,
  DollarSign,
  Package,
  Server,
  HeadphonesIcon,
} from "lucide-react";
import { useDashboardStore } from "../store/dashboard";
import type { NavItem } from "../types/navigation";

const navItems: NavItem[] = [
  { to: "/", icon: Sun, label: "Morning Brief" },
  {
    to: "/data",
    icon: Database,
    label: "Data",
    children: [
      { to: "/data/unit-economics", icon: DollarSign, label: "Unit Economics" },
      { to: "/data/customers", icon: Users, label: "Customers" },
    ],
  },
  {
    to: "/marketing",
    icon: BarChart3,
    label: "Marketing",
    children: [
      { to: "/marketing", icon: BarChart3, label: "Overview" },
      { to: "/marketing/paid", icon: DollarSign, label: "Paid Channels" },
      { to: "/marketing/organic", icon: TrendingUp, label: "Organic Channels" },
    ],
  },
  {
    to: "/operations",
    icon: Cog,
    label: "Operations",
    children: [
      { to: "/operations", icon: Cog, label: "Overview" },
      { to: "/operations/product", icon: Package, label: "Product" },
      { to: "/operations/infrastructure", icon: Server, label: "Infrastructure" },
      { to: "/operations/customer-success", icon: HeadphonesIcon, label: "Customer Success" },
    ],
  },
  { to: "/financials", icon: TrendingUp, label: "Financials" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/experiments", icon: FlaskConical, label: "Experiments" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    theme,
    toggleTheme,
    toggleSection,
    isSectionExpanded
  } = useDashboardStore();
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(to);
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.to);
    const expanded = isSectionExpanded(item.to);

    if (hasChildren && !sidebarCollapsed) {
      // Collapsible parent item
      return (
        <div key={item.to}>
          <button
            onClick={() => toggleSection(item.to)}
            className={`w-full group relative flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 px-3.5 py-2.5 ${
              active
                ? "bg-accent/5 text-accent"
                : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
            }`}
          >
            <item.icon
              className={`w-[18px] h-[18px] shrink-0 ${
                active
                  ? "text-accent"
                  : "text-ink-muted group-hover:text-ink-secondary"
              }`}
              strokeWidth={1.8}
            />
            <span className="flex-1 whitespace-nowrap text-left">{item.label}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
              strokeWidth={1.8}
            />
          </button>
          {expanded && (
            <div className="ml-3 mt-1 border-l border-edge pl-3 space-y-1">
              {item.children?.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  className={`group relative flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 px-3.5 py-2 ${
                    isActive(child.to)
                      ? "bg-accent/5 text-accent"
                      : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
                  }`}
                >
                  <child.icon
                    className={`w-[16px] h-[16px] shrink-0 ${
                      isActive(child.to)
                        ? "text-accent"
                        : "text-ink-muted group-hover:text-ink-secondary"
                    }`}
                    strokeWidth={1.8}
                  />
                  <span className="whitespace-nowrap">{child.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Simple nav item (no children or collapsed sidebar)
    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={`group relative flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 ${
          sidebarCollapsed
            ? "px-0 py-2.5 justify-center"
            : "px-3.5 py-2.5"
        } ${
          active
            ? sidebarCollapsed
              ? "bg-accent/10 text-accent"
              : "bg-accent/5 text-accent"
            : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
        }`}
      >
        {/* Active bar — only when expanded */}
        {active && !sidebarCollapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
        )}
        <item.icon
          className={`w-[18px] h-[18px] shrink-0 ${
            active
              ? "text-accent"
              : "text-ink-muted group-hover:text-ink-secondary"
          }`}
          strokeWidth={1.8}
        />
        {!sidebarCollapsed && (
          <span className="whitespace-nowrap">{item.label}</span>
        )}

        {/* Tooltip — only when collapsed */}
        {sidebarCollapsed && (
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
            {item.label}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col border-r border-edge bg-base transition-all duration-300 ease-in-out overflow-hidden ${
        sidebarCollapsed ? "w-[80px]" : "w-[280px]"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 h-[72px] border-b border-edge shrink-0 ${
          sidebarCollapsed ? "px-5 justify-center" : "px-6"
        }`}
      >
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Hexagon className="w-5 h-5 text-accent" strokeWidth={2.5} />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-xs font-semibold text-ink tracking-tight whitespace-nowrap">
              Chief of Staff
            </h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Bottom controls */}
      <div
        className={`border-t border-edge shrink-0 ${
          sidebarCollapsed
            ? "px-3 py-3 flex flex-col items-center gap-1"
            : "px-4 py-3 flex items-center justify-between"
        }`}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`group relative flex items-center gap-2.5 rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-surface-hover transition-colors cursor-pointer ${
            sidebarCollapsed ? "p-2.5 justify-center" : "px-3 py-2"
          }`}
          title={theme === "light" ? "Dark mode" : "Light mode"}
        >
          {theme === "light" ? (
            <Moon className="w-[18px] h-[18px]" strokeWidth={1.8} />
          ) : (
            <Sun className="w-[18px] h-[18px]" strokeWidth={1.8} />
          )}
          {!sidebarCollapsed && (
            <span className="text-xs">
              {theme === "light" ? "Dark mode" : "Light mode"}
            </span>
          )}
          {sidebarCollapsed && (
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
              {theme === "light" ? "Dark mode" : "Light mode"}
            </div>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={`group relative flex items-center gap-2.5 rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-surface-hover transition-colors cursor-pointer ${
            sidebarCollapsed ? "p-2.5 justify-center" : "px-3 py-2"
          }`}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-[18px] h-[18px]" strokeWidth={1.8} />
          ) : (
            <>
              <PanelLeftClose
                className="w-[18px] h-[18px]"
                strokeWidth={1.8}
              />
              <span className="text-xs whitespace-nowrap">Collapse</span>
            </>
          )}
          {sidebarCollapsed && (
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
              Expand sidebar
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
```

**Step 3: Commit**

```bash
git add app/components/Sidebar.tsx
git commit -m "feat: add collapsible navigation sections to sidebar"
```

---

## Task 6: Create Shared UI Components (PageHeader)

**Files:**
- Create: `app/components/PageHeader.tsx`

**Step 1: Create PageHeader component**

```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-ink mb-1">{title}</h1>
        {description && (
          <p className="text-sm text-ink-secondary">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/components/PageHeader.tsx
git commit -m "feat: add PageHeader component"
```

---

## Task 7: Create Shared UI Components (Tabs)

**Files:**
- Create: `app/components/Tabs.tsx`

**Step 1: Create Tabs component**

```typescript
import { useState } from "react";

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

interface TabsProps {
  children: React.ReactElement<TabProps>[];
  defaultTab?: number;
}

export function Tabs({ children, defaultTab = 0 }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div>
      {/* Tab Headers */}
      <div className="border-b border-edge mb-6">
        <div className="flex gap-6">
          {children.map((child, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === index
                  ? "border-accent text-accent"
                  : "border-transparent text-ink-secondary hover:text-ink"
              }`}
            >
              {child.props.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>{children[activeTab]}</div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/components/Tabs.tsx
git commit -m "feat: add Tabs component"
```

---

## Task 8: Create Shared UI Components (EmptyState)

**Files:**
- Create: `app/components/EmptyState.tsx`

**Step 1: Create EmptyState component**

```typescript
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-ink-muted" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm text-ink-secondary text-center max-w-md mb-6">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/components/EmptyState.tsx
git commit -m "feat: add EmptyState component"
```

---

## Task 9: Create Shared UI Components (LoadingSpinner)

**Files:**
- Create: `app/components/LoadingSpinner.tsx`

**Step 1: Create LoadingSpinner component**

```typescript
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} border-accent border-t-transparent rounded-full animate-spin`}
      />
      {message && (
        <p className="mt-4 text-sm text-ink-secondary">{message}</p>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/components/LoadingSpinner.tsx
git commit -m "feat: add LoadingSpinner component"
```

---

## Task 10: Update Index Exports for Components

**Files:**
- Create: `app/components/index.ts`

**Step 1: Create barrel export file**

```typescript
// Existing components
export { Sidebar } from "./Sidebar";
export { Layout } from "./Layout";
export { StatCard } from "./StatCard";
export { HealthIndicator } from "./HealthIndicator";
export { ProgressBar } from "./ProgressBar";
export { SparklineChart } from "./SparklineChart";
export { MetricComparison } from "./MetricComparison";
export { ExpandableCard } from "./ExpandableCard";
export { ActionButton } from "./ActionButton";

// New components
export { PageHeader } from "./PageHeader";
export { Tabs, Tab } from "./Tabs";
export { EmptyState } from "./EmptyState";
export { LoadingSpinner } from "./LoadingSpinner";
```

**Step 2: Commit**

```bash
git add app/components/index.ts
git commit -m "feat: add barrel exports for all components"
```

---

## Task 11: Create Mock Data Generators

**Files:**
- Create: `app/data/mockGenerators.ts`

**Step 1: Create mock data generator utilities**

```typescript
import type {
  Customer,
  SaasMetrics,
  MarketingChannel,
  PricingExperiment,
  FeatureRollout,
  InfrastructureMetrics,
  SupportTicket,
} from "../types/dashboard";

// Utility to generate dates
export function generateDateRange(daysBack: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  for (let i = daysBack; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }

  return dates;
}

// Generate mock customers
export function generateMockCustomers(count: number): Omit<Customer, 'id' | 'created_at' | 'updated_at'>[] {
  const plans: Array<'free' | 'starter' | 'pro' | 'enterprise'> = ['free', 'starter', 'pro', 'enterprise'];
  const segments: Array<'smb' | 'mid-market' | 'enterprise'> = ['smb', 'mid-market', 'enterprise'];

  return Array.from({ length: count }, (_, i) => {
    const signup = new Date();
    signup.setDate(signup.getDate() - Math.floor(Math.random() * 365));

    const plan = plans[Math.floor(Math.random() * plans.length)];
    const mrrValues = { free: 0, starter: 29, pro: 99, enterprise: 499 };

    return {
      email: `customer${i + 1}@example.com`,
      name: `Customer ${i + 1}`,
      plan,
      mrr: mrrValues[plan],
      health_score: Math.floor(Math.random() * 100),
      segment: segments[Math.floor(Math.random() * segments.length)],
      signup_date: signup,
      activation_date: Math.random() > 0.2 ? new Date(signup.getTime() + 86400000) : null,
      churned_date: Math.random() > 0.9 ? new Date() : null,
      churn_reason: null,
      cohort: `${signup.getFullYear()}-${String(signup.getMonth() + 1).padStart(2, '0')}`,
    };
  });
}

// Generate mock SaaS metrics
export function generateMockSaasMetrics(days: number): Omit<SaasMetrics, 'id' | 'created_at'>[] {
  const dates = generateDateRange(days);
  let mrr = 10000;

  return dates.map((date) => {
    mrr += Math.random() * 500 - 200; // Random growth
    const arr = mrr * 12;
    const cac = 150 + Math.random() * 50;
    const ltv = 1800 + Math.random() * 400;

    return {
      date,
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      cac: Math.round(cac),
      ltv: Math.round(ltv),
      ltv_cac_ratio: Number((ltv / cac).toFixed(2)),
      payback_period_months: Number((cac / (mrr / 100)).toFixed(1)),
      gross_margin: 75 + Math.random() * 10,
      nrr: 100 + Math.random() * 20,
      active_customers: Math.floor(mrr / 50),
      new_customers: Math.floor(Math.random() * 10),
      churned_customers: Math.floor(Math.random() * 3),
    };
  });
}

// Generate mock marketing channel data
export function generateMockMarketingChannels(days: number): Omit<MarketingChannel, 'id' | 'created_at'>[] {
  const channels = [
    { name: 'Google Ads', type: 'paid' as const },
    { name: 'Facebook Ads', type: 'paid' as const },
    { name: 'LinkedIn Ads', type: 'paid' as const },
    { name: 'SEO', type: 'organic' as const },
    { name: 'Content Marketing', type: 'organic' as const },
    { name: 'Referrals', type: 'organic' as const },
  ];

  const dates = generateDateRange(days);
  const data: Omit<MarketingChannel, 'id' | 'created_at'>[] = [];

  dates.forEach((date) => {
    channels.forEach((channel) => {
      const spend = channel.type === 'paid' ? 500 + Math.random() * 1000 : 0;
      const impressions = Math.floor(10000 + Math.random() * 50000);
      const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.03));
      const signups = Math.floor(clicks * (0.05 + Math.random() * 0.1));
      const paid_conversions = Math.floor(signups * (0.1 + Math.random() * 0.2));

      data.push({
        channel_name: channel.name,
        channel_type: channel.type,
        date,
        spend: channel.type === 'paid' ? Math.round(spend) : null,
        impressions,
        clicks,
        leads: Math.floor(clicks * 0.3),
        signups,
        paid_conversions,
        revenue: paid_conversions * 99,
      });
    });
  });

  return data;
}

export const mockData = {
  generateCustomers: generateMockCustomers,
  generateSaasMetrics: generateMockSaasMetrics,
  generateMarketingChannels: generateMockMarketingChannels,
};
```

**Step 2: Commit**

```bash
git add app/data/mockGenerators.ts
git commit -m "feat: add mock data generators for testing"
```

---

## Task 12: Final Testing & Documentation

**Files:**
- Create: `docs/PHASE1_COMPLETE.md`

**Step 1: Test the application**

Run: `npm run dev`
Expected: App starts without errors, new sidebar navigation visible

**Step 2: Test sidebar navigation**

1. Click on "Data" section - should expand/collapse
2. Click on "Marketing" section - should expand/collapse
3. Click on "Operations" section - should expand/collapse
4. Test sidebar collapse button - all should work smoothly

**Step 3: Run type checking**

Run: `npm run typecheck`
Expected: No type errors

**Step 4: Create completion documentation**

Create `docs/PHASE1_COMPLETE.md`:

```markdown
# Phase 1: Foundation - Completion Report

**Date Completed:** 2026-02-12
**Status:** ✅ Complete

## What Was Built

### Database Tables
- ✅ `customers` - Customer data and health scores
- ✅ `saas_metrics` - MRR, ARR, CAC, LTV, NRR metrics
- ✅ `marketing_channels` - Channel performance data
- ✅ `pricing_experiments` - Pricing A/B tests
- ✅ `feature_rollouts` - Feature adoption tracking
- ✅ `infrastructure_metrics` - Cost and performance data
- ✅ `support_tickets` - Customer success tracking

### TypeScript Types
- ✅ Complete type definitions in `app/types/dashboard.ts`
- ✅ Navigation types in `app/types/navigation.ts`
- ✅ All database models typed

### UI Components
- ✅ Enhanced Sidebar with collapsible sections
- ✅ PageHeader component
- ✅ Tabs component
- ✅ EmptyState component
- ✅ LoadingSpinner component
- ✅ Barrel exports for easy imports

### State Management
- ✅ Expanded sections state in Zustand store
- ✅ Persistent section expansion preferences

### Utilities
- ✅ Mock data generators for testing
- ✅ Date range utilities

## Migration Status

Run `npm run migrate` to apply all database changes.

## Next Steps

Phase 2: Data Routes
- Implement `/data/unit-economics` route
- Implement `/data/customers` route
- Create server functions in `app/lib/data.server.ts`
- Add data visualizations and charts

## Testing

- [x] App runs without errors
- [x] Sidebar navigation works correctly
- [x] Collapsible sections function properly
- [x] Type checking passes
- [x] Database migration successful
```

**Step 5: Commit**

```bash
git add docs/PHASE1_COMPLETE.md
git commit -m "docs: add Phase 1 completion report"
```

---

## Success Criteria

- [ ] All database tables created successfully
- [ ] TypeScript types defined for all data models
- [ ] Sidebar navigation updated with collapsible sections
- [ ] New UI components created (PageHeader, Tabs, EmptyState, LoadingSpinner)
- [ ] State management updated for section expansion
- [ ] Mock data generators implemented
- [ ] No TypeScript errors
- [ ] App runs without errors
- [ ] All changes committed to git

---

## Next Phase

After Phase 1 completion, proceed to:
- **Phase 2: Data Routes** (`docs/plans/2026-02-12-route-structure-phase2-implementation.md`)
