import { useState } from "react";
import { Tabs, Tab } from "../../components/Tabs";
import { StatCard } from "../../components/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  Filter,
  Share2,
  TrendingUp,
  Users,
  ArrowRight,
} from "lucide-react";

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-edge rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-ink-muted mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-xs font-mono" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function GoToMarket() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Go-to-Market Strategy
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Pricing strategy, sales funnel, and marketing channels performance
        </p>
      </div>

      <Tabs defaultTab={0}>
        {/* Pricing Strategy Tab */}
        <Tab label="Pricing Strategy">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="Average Price"
                value="$99/mo"
                className="animate-in stagger-1"
              />
              <StatCard
                label="Price Elasticity"
                value="-1.2"
                className="animate-in stagger-1"
              />
              <StatCard
                label="Price Optimization"
                value="8.5%"
                changeLabel="potential upside"
                className="animate-in stagger-2"
              />
              <StatCard
                label="Pricing Tests"
                value="3"
                className="animate-in stagger-2"
              />
            </div>

            <div className="card animate-in stagger-3">
              <p className="text-sm text-ink-secondary">
                Detailed pricing analysis, elasticity curves, and optimization recommendations coming soon...
              </p>
            </div>
          </div>
        </Tab>

        {/* Sales Funnel Tab */}
        <Tab label="Sales Funnel">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="Prospects"
                value="15,234"
                className="animate-in stagger-1"
              />
              <StatCard
                label="Leads"
                value="4,562"
                className="animate-in stagger-1"
              />
              <StatCard
                label="MQL"
                value="1,832"
                className="animate-in stagger-2"
              />
              <StatCard
                label="SQL → Won"
                value="312"
                className="animate-in stagger-2"
              />
            </div>

            <div className="card animate-in stagger-3">
              <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
                <Filter className="w-4 h-4 text-accent" />
                Funnel Conversion Rates
              </h3>
              <p className="text-sm text-ink-secondary mb-4">
                Prospects → Leads: 29.9% | Leads → MQL: 40.2% | MQL → SQL: 25.6% | SQL → Won: 17.0%
              </p>
              <p className="text-sm text-ink-secondary">
                Full funnel visualization and bottleneck analysis coming soon...
              </p>
            </div>
          </div>
        </Tab>

        {/* Marketing Channels Tab */}
        <Tab label="Marketing Channels">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="Total Spend"
                value="$45,320"
                className="animate-in stagger-1"
              />
              <StatCard
                label="Blended CAC"
                value="$155"
                className="animate-in stagger-1"
              />
              <StatCard
                label="Total Revenue"
                value="$284,500"
                className="animate-in stagger-2"
              />
              <StatCard
                label="Avg ROAS"
                value="6.3x"
                className="animate-in stagger-2"
              />
            </div>

            <div className="card animate-in stagger-3">
              <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-accent" />
                Channel Mix
              </h3>
              <p className="text-sm text-ink-secondary">
                Paid Search (35%) | Content/SEO (28%) | Social Ads (22%) | Referrals (15%)
              </p>
              <p className="text-sm text-ink-secondary mt-3">
                Detailed channel performance, attribution modeling, and optimization recommendations coming soon...
              </p>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
