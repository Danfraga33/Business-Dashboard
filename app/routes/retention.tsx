import { useLoaderData } from "react-router";
import { getCohortAnalysis, getLatestSaasMetrics, getChurnReasons, getAllCustomers } from "../lib/data.server";
import { StatCard } from "../components/StatCard";
import { Tabs, Tab } from "../components/Tabs";
import {
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  ThumbsUp,
  Zap,
  MessageSquare,
  Clock,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface LoaderData {
  cohorts: Awaited<ReturnType<typeof getCohortAnalysis>>;
  latest: Awaited<ReturnType<typeof getLatestSaasMetrics>>;
  churnReasons: Awaited<ReturnType<typeof getChurnReasons>>;
  customers: Awaited<ReturnType<typeof getAllCustomers>>;
}

export async function loader() {
  const [cohorts, latest, churnReasons, customers] = await Promise.all([
    getCohortAnalysis(),
    getLatestSaasMetrics(),
    getChurnReasons(),
    getAllCustomers(),
  ]);

  return { cohorts, latest, churnReasons, customers };
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

export default function Retention() {
  const { cohorts, latest, churnReasons, customers } = useLoaderData<LoaderData>();

  if (!latest) {
    return (
      <div className="space-y-8">
        <div className="animate-in">
          <h2 className="text-2xl font-semibold text-ink">Retention</h2>
          <p className="text-sm text-ink-muted mt-1">
            No data available. Run the seed script to populate data.
          </p>
        </div>
      </div>
    );
  }

  // Mock NRR breakdown data
  const nrrBreakdown = [
    { name: "Base MRR", value: 31000, color: "#78716C" },
    { name: "Expansion", value: 4650, color: "#059669" },
    { name: "Contraction", value: -1550, color: "#EF4444" },
    { name: "Churn", value: -2480, color: "#DC2626" },
  ];

  const netMRR = nrrBreakdown.reduce((sum, item) => sum + item.value, 0);
  const nrrValue = ((netMRR / nrrBreakdown[0].value) * 100).toFixed(1);

  // Mock cohort retention curves (monthly)
  const retentionCurves = [
    { month: "M0", "Jan 26": 100, "Dec 25": 100, "Nov 25": 100, "Oct 25": 100 },
    { month: "M1", "Jan 26": 94, "Dec 25": 92, "Nov 25": 91, "Oct 25": 89 },
    { month: "M2", "Jan 26": 89, "Dec 25": 87, "Nov 25": 84, "Oct 25": 82 },
    { month: "M3", "Jan 26": 85, "Dec 25": 82, "Nov 25": 79, "Oct 25": 76 },
    { month: "M4", "Jan 26": null, "Dec 25": 78, "Nov 25": 75, "Oct 25": 72 },
    { month: "M5", "Jan 26": null, "Dec 25": null, "Nov 25": 72, "Oct 25": 68 },
    { month: "M6", "Jan 26": null, "Dec 25": null, "Nov 25": null, "Oct 25": 65 },
  ];

  // Mock ARPU trends by cohort
  const arpuTrends = [
    { month: "Sep", "Q3 25": 118, "Q4 25": 0, "Q1 26": 0 },
    { month: "Oct", "Q3 25": 121, "Q4 25": 125, "Q1 26": 0 },
    { month: "Nov", "Q3 25": 124, "Q4 25": 128, "Q1 26": 0 },
    { month: "Dec", "Q3 25": 128, "Q4 25": 132, "Q1 26": 0 },
    { month: "Jan", "Q3 25": 132, "Q4 25": 136, "Q1 26": 140 },
    { month: "Feb", "Q3 25": 135, "Q4 25": 139, "Q1 26": 143 },
  ];

  // Mock customer health scores
  const healthScoreDistribution = [
    { score: "High (80-100)", count: 89, color: "#059669" },
    { score: "Medium (50-79)", count: 112, color: "#F59E0B" },
    { score: "Low (0-49)", count: 21, color: "#DC2626" },
  ];

  // Mock NPS/CSAT trends
  const satisfactionTrends = [
    { month: "Sep", nps: 42, csat: 4.2 },
    { month: "Oct", nps: 45, csat: 4.3 },
    { month: "Nov", nps: 48, csat: 4.4 },
    { month: "Dec", nps: 46, csat: 4.3 },
    { month: "Jan", nps: 51, csat: 4.5 },
    { month: "Feb", nps: 53, csat: 4.6 },
  ];

  // Mock feature adoption data
  const featureAdoption = [
    { feature: "Advanced Analytics", adoption: 67, active: 149, total: 222 },
    { feature: "API Integration", adoption: 54, active: 120, total: 222 },
    { feature: "Custom Dashboards", adoption: 81, active: 180, total: 222 },
    { feature: "Team Collaboration", adoption: 72, active: 160, total: 222 },
    { feature: "Automation Rules", adoption: 43, active: 95, total: 222 },
  ];

  // Mock churn risk signals
  const churnRiskCustomers = customers
    .filter((c) => Number(c.health_score) < 50)
    .slice(0, 10)
    .map((c) => ({
      id: c.id,
      company: c.company_name,
      mrr: c.mrr,
      health: Number(c.health_score),
      daysInactive: Math.floor(Math.random() * 30) + 1,
      supportTickets: Math.floor(Math.random() * 5) + 1,
    }));

  const grr = ((1 - Number(latest.churn_rate) / 100) * 100).toFixed(1);
  const expansionPct = ((4650 / 31000) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">Retention</h2>
        <p className="text-sm text-ink-muted mt-1">
          NRR, cohort retention, customer health, and leading indicators
        </p>
      </div>

      <Tabs defaultTab={0}>
        {/* Tab 1: Retention Metrics */}
        <Tab label="Retention Metrics" >
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="Net Revenue Retention"
                value={`${nrrValue}%`}
                className="animate-in stagger-1"
              />
              <StatCard
                label="Gross Revenue Retention"
                value={`${grr}%`}
                className="animate-in stagger-1"
              />
              <StatCard
                label="Monthly Churn Rate"
                value={`${Number(latest.churn_rate).toFixed(1)}%`}
                className="animate-in stagger-2"
              />
              <StatCard
                label="Expansion Revenue %"
                value={`${expansionPct}%`}
                className="animate-in stagger-2"
              />
            </div>

            {/* NRR Breakdown */}
            <div className="card animate-in stagger-3">
              <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                NRR Breakdown
                <span className="text-2xs text-ink-muted font-normal ml-auto">This month</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual breakdown */}
                <div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={nrrBreakdown} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
                      <XAxis type="number" tick={{ fill: "#78716C", fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "#78716C", fontSize: 11 }} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {nrrBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Table breakdown */}
                <div className="space-y-2">
                  {nrrBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between py-2 border-b border-edge/50">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-ink-secondary">{item.name}</span>
                      </div>
                      <span className={`text-sm font-mono ${item.value >= 0 ? "text-ink" : "text-danger"}`}>
                        {item.value >= 0 ? "+" : ""}{formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-3 border-t-2 border-edge">
                    <span className="text-sm font-semibold text-ink">Net MRR</span>
                    <span className={`text-sm font-mono font-bold ${netMRR >= 0 ? "text-success" : "text-danger"}`}>
                      {netMRR >= 0 ? "+" : ""}{formatCurrency(netMRR)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-semibold text-ink">NRR</span>
                    <span className={`text-sm font-mono font-bold ${Number(nrrValue) >= 100 ? "text-success" : "text-warning"}`}>
                      {nrrValue}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cohort Retention Curves */}
            <div className="card animate-in stagger-4">
              <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                Cohort Retention Curves
                <span className="text-2xs text-ink-muted font-normal ml-auto">Monthly retention</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={retentionCurves}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#78716C", fontSize: 11 }}
                    axisLine={{ stroke: "var(--color-edge)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#78716C", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="Jan 26" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Dec 25" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Nov 25" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Oct 25" stroke="#DC2626" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Tab>

        {/* Tab 2: Customer Metrics */}
        <Tab label="Customer Metrics">
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="Average ARPU"
                value={formatCurrency(latest.mrr / 222)}
                className="animate-in stagger-1"
              />
              <StatCard
                label="Expansion Revenue"
                value={formatCurrency(4650)}
                className="animate-in stagger-1"
              />
              <StatCard
                label="Avg Health Score"
                value="72.5"
                className="animate-in stagger-2"
              />
              <StatCard
                label="At-Risk Customers"
                value={churnRiskCustomers.length.toString()}
                className="animate-in stagger-2"
              />
            </div>

            {/* ARPU Trends by Cohort */}
            <div className="card animate-in stagger-3">
              <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent" />
                ARPU Trends by Cohort
                <span className="text-2xs text-ink-muted font-normal ml-auto">Last 6 months</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={arpuTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#78716C", fontSize: 11 }}
                    axisLine={{ stroke: "var(--color-edge)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#78716C", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="Q3 25" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Q4 25" stroke="#2563EB" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="Q1 26" stroke="#7C3AED" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Customer Health Score Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card animate-in stagger-4">
                <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent" />
                  Health Score Distribution
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={healthScoreDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {healthScoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {healthScoreDistribution.map((item) => (
                    <div key={item.score} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-ink-secondary">{item.score}</span>
                      </div>
                      <span className="font-mono text-ink">{item.count} customers</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card animate-in stagger-4">
                <h3 className="font-semibold text-ink mb-5">Expansion Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                    <div>
                      <p className="text-sm font-semibold text-ink">Expansion MRR</p>
                      <p className="text-xs text-ink-muted mt-0.5">Upgrades + add-ons</p>
                    </div>
                    <span className="text-lg font-mono font-bold text-success">{formatCurrency(4650)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20">
                    <div>
                      <p className="text-sm font-semibold text-ink">% of Total MRR</p>
                      <p className="text-xs text-ink-muted mt-0.5">Expansion contribution</p>
                    </div>
                    <span className="text-lg font-mono font-bold text-accent">{expansionPct}%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-edge">
                    <div>
                      <p className="text-sm font-semibold text-ink">Expanding Customers</p>
                      <p className="text-xs text-ink-muted mt-0.5">This month</p>
                    </div>
                    <span className="text-lg font-mono font-bold text-ink">34</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Tab>

        {/* Tab 3: Feedback & Leading Indicators */}
        <Tab label="Leading Indicators">
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="NPS Score"
                value="53"
                className="animate-in stagger-1"
              />
              <StatCard
                label="CSAT Rating"
                value="4.6/5"
                className="animate-in stagger-1"
              />
              <StatCard
                label="Support Tickets"
                value="142"
                changeLabel="this month"
                className="animate-in stagger-2"
              />
              <StatCard
                label="Avg Resolution Time"
                value="4.2h"
                className="animate-in stagger-2"
              />
            </div>

            {/* NPS/CSAT Trends */}
            <div className="card animate-in stagger-3">
              <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-accent" />
                Customer Satisfaction Trends
                <span className="text-2xs text-ink-muted font-normal ml-auto">Last 6 months</span>
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={satisfactionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#78716C", fontSize: 11 }}
                    axisLine={{ stroke: "var(--color-edge)" }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: "#78716C", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: "#78716C", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 5]}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="nps" name="NPS" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="csat" name="CSAT" stroke="#059669" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Feature Adoption */}
            {/* <div className="card animate-in stagger-4">
              <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                Feature Adoption Rates
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-edge">
                      <th className="text-left text-ink-muted font-semibold uppercase tracking-wider pb-3 pr-4">
                        Feature
                      </th>
                      <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 px-4">
                        Adoption %
                      </th>
                      <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 px-4">
                        Active Users
                      </th>
                      <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 pl-4">
                        Total Users
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureAdoption.map((feature) => (
                      <tr key={feature.feature} className="border-b border-edge/50">
                        <td className="py-3 pr-4 font-medium text-ink">{feature.feature}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-mono font-semibold ${
                            feature.adoption >= 70 ? "text-success" : feature.adoption >= 50 ? "text-warning" : "text-danger"
                          }`}>
                            {feature.adoption}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-ink-secondary">{feature.active}</td>
                        <td className="py-3 pl-4 text-right font-mono text-ink-secondary">{feature.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div> */}

            {/* Churn Risk Signals */}
            <div className="card animate-in stagger-5">
              <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger" />
                Customers at Risk of Churn
                <span className="text-2xs text-ink-muted font-normal ml-auto">{churnRiskCustomers.length} customers</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-edge">
                      <th className="text-left text-ink-muted font-semibold uppercase tracking-wider pb-3 pr-4">
                        Company
                      </th>
                      <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 px-4">
                        MRR
                      </th>
                      <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 px-4">
                        Health Score
                      </th>
                      <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 px-4">
                        Days Inactive
                      </th>
                      <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 pl-4">
                        Support Tickets
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {churnRiskCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-edge/50 hover:bg-surface/50">
                        <td className="py-3 pr-4 font-medium text-ink">{customer.company}</td>
                        <td className="py-3 px-4 text-right font-mono text-ink-secondary">
                          {formatCurrency(customer.mrr)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-mono font-semibold ${
                            customer.health >= 50 ? "text-warning" : "text-danger"
                          }`}>
                            {customer.health}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-ink-secondary">
                          {customer.daysInactive}d
                        </td>
                        <td className="py-3 pl-4 text-right font-mono text-ink-secondary">
                          {customer.supportTickets}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
