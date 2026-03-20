import { useLoaderData } from "react-router";
import {
  getSaasMetrics,
  getLatestSaasMetrics,
  getCustomerStats,
} from "../lib/data.server";
import { getSupportMetrics } from "../lib/operations.server";
import type { SaasMetrics, CustomerStats, SupportMetrics } from "../types/dashboard";
import { StatCard } from "../components/StatCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface LoaderData {
  metrics: SaasMetrics[];
  latest: SaasMetrics | null;
  customerStats: CustomerStats;
  supportMetrics: SupportMetrics;
}

export async function loader() {
  const [metrics, latest, customerStats, supportMetrics] = await Promise.all([
    getSaasMetrics(30),
    getLatestSaasMetrics(),
    getCustomerStats(),
    getSupportMetrics(),
  ]);

  return { metrics, latest, customerStats, supportMetrics };
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[13px] text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-[13px] font-mono" style={{ color: entry.color }}>
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

function HealthGauge({ label, value, unit, thresholds, target }: {
  label: string;
  value: number;
  unit: string;
  thresholds: { good: number; warning: number };
  target: string;
}) {
  const color = value >= thresholds.good
    ? "text-success"
    : value >= thresholds.warning
    ? "text-warning"
    : "text-danger";

  const bgColor = value >= thresholds.good
    ? "bg-success/10"
    : value >= thresholds.warning
    ? "bg-warning/10"
    : "bg-danger/10";

  return (
    <div className="card">
      <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-mono font-semibold ${color}`}>
          {typeof value === "number" ? value.toFixed(1) : value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
      <div className={`inline-flex items-center gap-1.5 mt-3 px-2 py-0.5 rounded-full text-[11px] font-medium ${bgColor} ${color}`}>
        {value >= thresholds.good ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : (
          <AlertTriangle className="w-3 h-3" />
        )}
        Target: {target}
      </div>
    </div>
  );
}

export default function Health() {
  const { metrics, latest, customerStats, supportMetrics } =
    useLoaderData<LoaderData>();

  if (!latest) {
    return (
      <div className="space-y-8">
        <div className="animate-in">
          <h2 className="text-2xl font-semibold text-foreground font-serif">Health</h2>
          <p className="text-sm text-muted-foreground mt-1">
            No metrics data available. Run the seed script to populate data.
          </p>
        </div>
      </div>
    );
  }

  const chartData = [...metrics].reverse().map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    MRR: m.mrr,
    "Active Customers": m.active_customers,
  }));

  const prev = metrics.length > 1 ? metrics[1] : latest;
  const mrrChange = prev.mrr > 0 ? ((latest.mrr - prev.mrr) / prev.mrr) * 100 : 0;
  const churnRate = customerStats.total > 0
    ? (customerStats.churned / customerStats.total) * 100
    : 0;

  const mrrGrowthRate = metrics.length >= 2
    ? ((metrics[0].mrr - metrics[metrics.length - 1].mrr) / metrics[metrics.length - 1].mrr) * 100
    : 0;

  const avgMrrPerCustomer = customerStats.active > 0 ? latest.mrr / customerStats.active : 0;
  const monthlyChurnRevenue = latest.churned_customers * avgMrrPerCustomer;
  const runwayMonths = monthlyChurnRevenue > 0 ? latest.mrr / monthlyChurnRevenue : 999;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-foreground leading-tight font-serif">Health</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Core health metrics — revenue, retention, and operational pulse
        </p>
      </div>

      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Monthly Recurring Revenue"
          value={formatCurrency(latest.mrr)}
          change={mrrChange}
          changeLabel="vs yesterday"
          className="animate-in stagger-1"
        />
        <StatCard
          label="Annual Recurring Revenue"
          value={formatCurrency(latest.arr)}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Active Customers"
          value={customerStats.active.toString()}
          change={customerStats.new_this_month > 0 ? (customerStats.new_this_month / customerStats.active) * 100 : 0}
          changeLabel="new this month"
          className="animate-in stagger-2"
        />
        <StatCard
          label="Open Support Tickets"
          value={supportMetrics.open_tickets.toString()}
          className="animate-in stagger-2"
        />
      </div>

      {/* Health Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-in stagger-3">
          <HealthGauge
            label="Net Revenue Retention"
            value={latest.nrr}
            unit="%"
            thresholds={{ good: 110, warning: 100 }}
            target=">110%"
          />
        </div>
        <div className="animate-in stagger-3">
          <HealthGauge
            label="Churn Rate"
            value={churnRate}
            unit="%"
            thresholds={{ good: 95, warning: 90 }}
            target="<5%"
          />
        </div>
        <div className="animate-in stagger-4">
          <HealthGauge
            label="LTV:CAC Ratio"
            value={latest.ltv_cac_ratio}
            unit=":1"
            thresholds={{ good: 3, warning: 2 }}
            target=">3:1"
          />
        </div>
        <div className="animate-in stagger-4">
          <HealthGauge
            label="Gross Margin"
            value={latest.gross_margin}
            unit="%"
            thresholds={{ good: 70, warning: 50 }}
            target=">70%"
          />
        </div>
      </div>

      {/* MRR Trend */}
      <div className="card animate-in stagger-5">
        <h3 className="text-base font-semibold text-foreground mb-6 flex items-center gap-2 font-serif">
          <Activity className="w-4 h-4 text-primary" />
          MRR Trend
          <span className="text-[11px] text-muted-foreground font-normal font-sans ml-auto">Last 30 days</span>
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "oklch(0.60 0.01 80)", fontSize: 11, fontFamily: "'Geist Mono', monospace" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "oklch(0.60 0.01 80)", fontSize: 11, fontFamily: "'Geist Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="MRR" stroke="oklch(0.85 0.08 55)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pulse Summary */}
      <div className="card animate-in stagger-6">
        <h3 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2 font-serif">
          <Activity className="w-4 h-4 text-muted-foreground" />
          Pulse Summary
        </h3>
        <div className="space-y-3">
          {/* MRR Growth */}
          <div className={`flex items-center gap-3 p-3.5 rounded-lg ${mrrGrowthRate >= 0 ? "bg-success/5 border border-success/10" : "bg-danger/5 border border-danger/10"}`}>
            {mrrGrowthRate >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 text-danger shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">MRR {mrrGrowthRate >= 0 ? "Growing" : "Declining"}</p>
              <p className="text-[13px] text-muted-foreground">
                {Math.abs(mrrGrowthRate).toFixed(1)}% change over 30 days
              </p>
            </div>
          </div>

          {/* Churn Alert */}
          {churnRate > 5 ? (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-danger/5 border border-danger/10">
              <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Elevated Churn</p>
                <p className="text-[13px] text-muted-foreground">
                  {churnRate.toFixed(1)}% total churn rate — investigate retention
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-success/5 border border-success/10">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Churn Under Control</p>
                <p className="text-[13px] text-muted-foreground">
                  {churnRate.toFixed(1)}% total churn rate — within healthy range
                </p>
              </div>
            </div>
          )}

          {/* Support Queue */}
          {supportMetrics.open_tickets > 10 ? (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-warning/5 border border-warning/10">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Support Queue Growing</p>
                <p className="text-[13px] text-muted-foreground">
                  {supportMetrics.open_tickets} open tickets — avg response {Math.round(supportMetrics.avg_first_response_time)}min
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-lg bg-success/5 border border-success/10">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Support Healthy</p>
                <p className="text-[13px] text-muted-foreground">
                  {supportMetrics.open_tickets} open tickets — avg response {Math.round(supportMetrics.avg_first_response_time)}min
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
