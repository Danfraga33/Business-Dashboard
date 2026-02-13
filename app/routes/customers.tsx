import { useLoaderData } from "react-router";
import {
  getCustomerStats,
  getCohortAnalysis,
  getChurnReasons,
  getAllCustomers,
} from "../lib/data.server";
import type { CustomerStats, CohortData, Customer } from "../types/dashboard";
import { StatCard } from "../components/StatCard";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, UserX, Layers } from "lucide-react";
import { useState } from "react";

interface LoaderData {
  customerStats: CustomerStats;
  cohorts: CohortData[];
  churnReasons: { reason: string; count: number }[];
  customers: Customer[];
}

export async function loader() {
  const [customerStats, cohorts, churnReasons, customers] = await Promise.all([
    getCustomerStats(),
    getCohortAnalysis(),
    getChurnReasons(),
    getAllCustomers(),
  ]);

  return { customerStats, cohorts, churnReasons, customers };
}

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

const CHURN_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#D97706", "#DC2626",
  "#FB923C", "#FBBF24", "#F59E0B",
];

const COHORT_COLORS = [
  "#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED",
  "#0891B2", "#DB2777", "#65A30D", "#4F46E5", "#0D9488",
  "#C026D3", "#EA580C",
];

export default function CustomerDeepDive() {
  const { customerStats, cohorts, churnReasons, customers } =
    useLoaderData<LoaderData>();
  const [searchQuery, setSearchQuery] = useState("");

  const avgRetention = cohorts.length > 0
    ? cohorts.reduce((sum, c) => sum + c.retention_rate, 0) / cohorts.length
    : 0;

  // MRR per Cohort chart data
  const mrrChartData = [...cohorts].reverse().map((c) => ({
    cohort: c.cohort,
    MRR: c.mrr,
    Customers: c.customers,
  }));

  // Retention curve data (cohorts as lines)
  const retentionData = [...cohorts].reverse().map((c) => ({
    cohort: c.cohort,
    retention: c.retention_rate,
    churn: c.churn_rate,
  }));

  // Filtered customers for table
  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.plan?.toLowerCase().includes(q) ||
      c.cohort?.toLowerCase().includes(q)
    );
  }).slice(0, 50);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Customer Deep Dive
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Cohort analysis, retention curves, and customer-level insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Customers"
          value={customerStats.total.toString()}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Active"
          value={customerStats.active.toString()}
          change={customerStats.new_this_month > 0 ? (customerStats.new_this_month / customerStats.active) * 100 : 0}
          changeLabel="new this month"
          className="animate-in stagger-1"
        />
        <StatCard
          label="Churned"
          value={customerStats.churned.toString()}
          className="animate-in stagger-2"
        />
        <StatCard
          label="Avg Health Score"
          value={customerStats.avg_health_score.toFixed(0) + "/100"}
          className="animate-in stagger-2"
        />
      </div>

      {/* Cohort Retention Table */}
      <div className="card animate-in stagger-3">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          Cohort Analysis
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                  Cohort
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Customers
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  MRR
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Retention
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">
                  Churn
                </th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => (
                <tr key={cohort.cohort} className="border-b border-edge/50">
                  <td className="py-2.5 pr-4 text-sm font-medium text-ink">{cohort.cohort}</td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right text-ink-secondary">
                    {cohort.customers}
                  </td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right text-ink">
                    ${cohort.mrr.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right">
                    <span className={cohort.retention_rate >= 80 ? "text-success" : cohort.retention_rate >= 60 ? "text-warning" : "text-danger"}>
                      {Number(cohort.retention_rate).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 pl-4 text-sm font-mono text-right">
                    <span className={cohort.churn_rate <= 5 ? "text-success" : cohort.churn_rate <= 15 ? "text-warning" : "text-danger"}>
                      {Number(cohort.churn_rate).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* MRR per Cohort */}
        <div className="card animate-in stagger-4">
          <h3 className="text-base font-semibold text-ink mb-5">MRR by Cohort</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mrrChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
              <XAxis
                dataKey="cohort"
                tick={{ fill: "#78716C", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#78716C", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="MRR" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Retention Curve */}
        <div className="card animate-in stagger-4">
          <h3 className="text-base font-semibold text-ink mb-5">Retention by Cohort</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
              <XAxis
                dataKey="cohort"
                tick={{ fill: "#78716C", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#78716C", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="retention" fill="#059669" radius={[4, 4, 0, 0]} name="Retention %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Churn Reasons */}
      {churnReasons.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card animate-in stagger-5">
            <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
              <UserX className="w-4 h-4 text-danger" />
              Churn Reasons
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={churnReasons}
                  dataKey="count"
                  nameKey="reason"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={2}
                >
                  {churnReasons.map((_, i) => (
                    <Cell key={i} fill={CHURN_COLORS[i % CHURN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card animate-in stagger-5">
            <h3 className="text-base font-semibold text-ink mb-5">Churn Breakdown</h3>
            <div className="space-y-3">
              {churnReasons.map((reason, i) => {
                const total = churnReasons.reduce((s, r) => s + r.count, 0);
                const pct = total > 0 ? (reason.count / total) * 100 : 0;
                return (
                  <div key={reason.reason} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CHURN_COLORS[i % CHURN_COLORS.length] }}
                    />
                    <span className="text-sm text-ink flex-1 truncate">{reason.reason}</span>
                    <span className="text-sm font-mono text-ink-secondary">{reason.count}</span>
                    <span className="text-xs font-mono text-ink-muted w-12 text-right">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Customer Table */}
      <div className="card animate-in stagger-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-ink flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" />
            Customers
          </h3>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-surface border border-edge rounded-lg px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent/50 transition-colors w-64"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                  Name
                </th>
                <th className="text-center text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Plan
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  MRR
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Health
                </th>
                <th className="text-center text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Segment
                </th>
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">
                  Cohort
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-edge/50">
                  <td className="py-2.5 pr-4">
                    <p className="text-sm font-medium text-ink">{customer.name}</p>
                    <p className="text-xs text-ink-muted">{customer.email}</p>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider ${
                      customer.plan === "enterprise"
                        ? "bg-accent/10 text-accent"
                        : customer.plan === "pro"
                        ? "bg-success/10 text-success"
                        : customer.plan === "starter"
                        ? "bg-warning/10 text-warning"
                        : "bg-surface text-ink-muted"
                    }`}>
                      {customer.plan}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right text-ink">
                    ${customer.mrr}
                  </td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right">
                    <span className={
                      customer.health_score !== null && customer.health_score >= 75
                        ? "text-success"
                        : customer.health_score !== null && customer.health_score >= 50
                        ? "text-warning"
                        : "text-danger"
                    }>
                      {customer.health_score ?? "—"}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-xs text-center text-ink-secondary">
                    {customer.segment}
                  </td>
                  <td className="py-2.5 pl-4 text-sm font-mono text-ink-secondary">
                    {customer.cohort}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-ink-muted text-sm">
              No customers match your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
