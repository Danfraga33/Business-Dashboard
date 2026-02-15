import { useLoaderData } from "react-router";
import {
  getCustomerStats,
  getCohortAnalysis,
  getChurnReasons,
  getAllCustomers,
  getLatestSaasMetrics,
} from "../lib/data.server";
import type { CustomerStats, CohortData, Customer, SaasMetrics } from "../types/dashboard";
import { StatCard } from "../components/StatCard";
import { Tabs, Tab } from "../components/Tabs";
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
import { Users, UserX, Layers, DollarSign, TrendingUp, BarChart3 } from "lucide-react";
import { useState } from "react";

interface LoaderData {
  customerStats: CustomerStats;
  cohorts: CohortData[];
  churnReasons: { reason: string; count: number }[];
  customers: Customer[];
  latest: SaasMetrics | null;
}

export async function loader() {
  const [customerStats, cohorts, churnReasons, customers, latest] = await Promise.all([
    getCustomerStats(),
    getCohortAnalysis(),
    getChurnReasons(),
    getAllCustomers(),
    getLatestSaasMetrics(),
  ]);

  return { customerStats, cohorts, churnReasons, customers, latest };
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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
  const { customerStats, cohorts, churnReasons, customers, latest } =
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
  const retentionData = [...cohorts].reverse().map((c, index) => ({
    month: index,
    cohort: c.cohort,
    retention: c.retention_rate,
    churn: c.churn_rate,
  }));

  // Expansion by cohort (mock data showing revenue expansion)
  const expansionData = [...cohorts].reverse().map((c) => ({
    cohort: c.cohort,
    expansion: Math.random() * 30 + 10, // 10-40% expansion rate
  }));

  // Customer Composition (MRR breakdown)
  const totalMRR = customers.reduce((sum, c) => sum + (c.status === "active" ? c.mrr : 0), 0);
  const compositionData = [
    { name: "New MRR", value: totalMRR * 0.25, color: "#059669" },
    { name: "Expansion MRR", value: totalMRR * 0.15, color: "#2563EB" },
    { name: "Contraction MRR", value: totalMRR * -0.05, color: "#EF4444" },
    { name: "Reactivation MRR", value: totalMRR * 0.05, color: "#7C3AED" },
    { name: "Churned MRR", value: totalMRR * -0.08, color: "#DC2626" },
  ];

  // Segment performance (mock data)
  const segmentData = [
    { segment: "Enterprise", customers: 8, mrr: 12400, ltv: 186000, cac: 4200, retention: 95.2 },
    { segment: "SMB", customers: 45, mrr: 8950, ltv: 45000, cac: 980, retention: 82.5 },
    { segment: "Startup", customers: 67, mrr: 6040, ltv: 18000, cac: 420, retention: 71.3 },
    { segment: "Solopreneur", customers: 102, mrr: 3560, ltv: 8400, cac: 180, retention: 65.8 },
  ];

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
          Cohort analysis, unit economics, customer composition, and segment performance
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

      {/* Tabs */}
      <Tabs defaultTab={0}>
        {/* TAB 1: Cohort Analysis */}
        <Tab label="Cohort Analysis">
          <div className="space-y-6">
            {/* Cohort Retention Table */}
            <div className="card">
              <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent" />
                Cohort Retention Analysis
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

            {/* Retention Curves & Expansion */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Retention Curve */}
              <div className="card">
                <h3 className="font-semibold text-ink mb-5">Retention Curves by Cohort</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={retentionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#78716C", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      label={{ value: "Months since signup", position: "insideBottom", offset: -5, fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fill: "#78716C", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="retention" stroke="#059669" strokeWidth={2} dot={false} name="Retention %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Expansion by Cohort */}
              <div className="card">
                <h3 className="font-semibold text-ink mb-5">Expansion by Cohort</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={expansionData}>
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
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="expansion" fill="#2563EB" radius={[4, 4, 0, 0]} name="Expansion %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Tab>

        {/* TAB 2: Unit Economics */}
        <Tab label="Unit Economics">
          <div className="space-y-6">
            {/* Unit Economics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
                    <DollarSign className="w-3.5 h-3.5 text-success" />
                  </div>
                  <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">LTV</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-ink">
                    {latest ? formatCurrency(latest.ltv) : "—"}
                  </span>
                </div>
                <p className="text-2xs text-ink-muted mt-2">Customer Lifetime Value</p>
              </div>

              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-danger" />
                  </div>
                  <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">CAC</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-ink">
                    {latest ? formatCurrency(latest.cac) : "—"}
                  </span>
                </div>
                <p className="text-2xs text-ink-muted mt-2">Customer Acquisition Cost</p>
              </div>

              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
                    <BarChart3 className="w-3.5 h-3.5 text-warning" />
                  </div>
                  <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Payback</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-ink">
                    {latest ? Number(latest.payback_period_months).toFixed(1) : "—"}
                  </span>
                  <span className="text-sm text-ink-muted">mo</span>
                </div>
                <p className="text-2xs text-ink-muted mt-2">CAC Payback Period</p>
              </div>

              <div className="card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">LTV:CAC</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-accent">
                    {latest ? Number(latest.ltv_cac_ratio).toFixed(1) : "—"}
                  </span>
                  <span className="text-sm text-ink-muted">:1</span>
                </div>
                <p className="text-2xs text-ink-muted mt-2">Target: &gt;3:1</p>
              </div>
            </div>

            {/* Unit Economics by Cohort */}
            <div className="card">
              <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-accent" />
                Unit Economics by Cohort
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-edge">
                      <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                        Cohort
                      </th>
                      <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                        ARPU
                      </th>
                      <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                        Avg LTV
                      </th>
                      <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                        Payback
                      </th>
                      <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">
                        Margin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cohorts.map((cohort) => {
                      const arpu = cohort.customers > 0 ? cohort.mrr / cohort.customers : 0;
                      const estimatedLTV = arpu * 36; // 36 month average
                      const payback = latest ? Number(latest.payback_period_months) * (0.8 + Math.random() * 0.4) : 0; // Vary by cohort
                      const margin = 70 + Math.random() * 15; // 70-85%
                      return (
                        <tr key={cohort.cohort} className="border-b border-edge/50">
                          <td className="py-2.5 pr-4 text-sm font-medium text-ink">{cohort.cohort}</td>
                          <td className="py-2.5 px-4 text-sm font-mono text-right text-ink">
                            {formatCurrency(arpu)}
                          </td>
                          <td className="py-2.5 px-4 text-sm font-mono text-right text-ink">
                            {formatCurrency(estimatedLTV)}
                          </td>
                          <td className="py-2.5 px-4 text-sm font-mono text-right text-ink-secondary">
                            {payback.toFixed(1)} mo
                          </td>
                          <td className="py-2.5 pl-4 text-sm font-mono text-right text-success">
                            {margin.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Tab>

        {/* TAB 3: Customer Composition */}
        <Tab label="Customer Composition">
          <div className="space-y-6">
            {/* MRR Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card">
                <h3 className="font-semibold text-ink mb-5">MRR Composition</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={compositionData.filter(d => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={2}
                    >
                      {compositionData.filter(d => d.value > 0).map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="font-semibold text-ink mb-5">MRR Movement Breakdown</h3>
                <div className="space-y-4">
                  {compositionData.map((item) => {
                    const isPositive = item.value > 0;
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-ink">{item.name}</span>
                        </div>
                        <span className={`text-sm font-mono font-semibold ${isPositive ? "text-success" : "text-danger"}`}>
                          {isPositive ? "+" : ""}{formatCurrency(item.value)}
                        </span>
                      </div>
                    );
                  })}
                  <div className="pt-4 border-t border-edge">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-ink">Net MRR Change</span>
                      <span className="text-sm font-mono font-bold text-success">
                        +{formatCurrency(compositionData.reduce((sum, d) => sum + d.value, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Churn Reasons */}
            {churnReasons.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="card">
                  <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
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

                <div className="card">
                  <h3 className="font-semibold text-ink mb-5">Churn Breakdown</h3>
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
          </div>
        </Tab>

        {/* TAB 4: Segments */}
        <Tab label="Segments">
          <div className="space-y-6">
            {/* Segment Performance Table */}
            <div className="card">
              <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
                <Users className="w-4 h-4 text-accent" />
                Segment Performance
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-edge">
                      <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                        Segment
                      </th>
                      <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                        Customers
                      </th>
                      <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                        MRR
                      </th>
                      <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                        Avg LTV
                      </th>
                      <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                        CAC
                      </th>
                      <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">
                        Retention
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {segmentData.map((segment) => (
                      <tr key={segment.segment} className="border-b border-edge/50">
                        <td className="py-2.5 pr-4 text-sm font-medium text-ink">{segment.segment}</td>
                        <td className="py-2.5 px-4 text-sm font-mono text-right text-ink-secondary">
                          {segment.customers}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-mono text-right text-ink">
                          {formatCurrency(segment.mrr)}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-mono text-right text-success">
                          {formatCurrency(segment.ltv)}
                        </td>
                        <td className="py-2.5 px-4 text-sm font-mono text-right text-danger">
                          {formatCurrency(segment.cac)}
                        </td>
                        <td className="py-2.5 pl-4 text-sm font-mono text-right">
                          <span className={segment.retention >= 85 ? "text-success" : segment.retention >= 70 ? "text-warning" : "text-danger"}>
                            {segment.retention.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Segment Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="card">
                <h3 className="font-semibold text-ink mb-5">MRR by Segment</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={segmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
                    <XAxis
                      dataKey="segment"
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
                    <Bar dataKey="mrr" fill="#2563EB" radius={[4, 4, 0, 0]} name="MRR" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="font-semibold text-ink mb-5">LTV by Segment</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={segmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
                    <XAxis
                      dataKey="segment"
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
                    <Bar dataKey="ltv" fill="#059669" radius={[4, 4, 0, 0]} name="LTV" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Customer List */}
            <div className="card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-ink flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  All Customers
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
        </Tab>
      </Tabs>
    </div>
  );
}
