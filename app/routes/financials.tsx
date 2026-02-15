import { useLoaderData } from "react-router";
import {
  getSaasMetrics,
  getLatestSaasMetrics,
} from "../lib/data.server";
import { getServiceCostSummary, type ServiceCostSummary } from "../lib/operations.server";
import { generateStaticAnalysis } from "../lib/static-ai-analysis";
import type { SaasMetrics } from "../types/dashboard";
import { StatCard } from "../components/StatCard";
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
  TrendingUp,
  Clock,
  Server,
  AlertTriangle,
  TrendingDown,
  Activity,
  CheckCircle2,
} from "lucide-react";

interface LoaderData {
  metrics: SaasMetrics[];
  latest: SaasMetrics | null;
  serviceSummary: ServiceCostSummary[];
}

export async function loader() {
  const [metrics, latest, serviceSummary] = await Promise.all([
    getSaasMetrics(90),
    getLatestSaasMetrics(),
    getServiceCostSummary(30),
  ]);

  return { metrics, latest, serviceSummary };
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

function HealthIndicator({ value, thresholds, format }: {
  value: number;
  thresholds: { good: number; warning: number };
  format?: (v: number) => string;
}) {
  const color = value >= thresholds.good
    ? "text-success"
    : value >= thresholds.warning
    ? "text-warning"
    : "text-danger";
  return <span className={`font-mono font-semibold ${color}`}>{format ? format(value) : Number(value).toFixed(1)}</span>;
}

export default function Financials() {
  const { metrics, latest, serviceSummary } = useLoaderData<LoaderData>();

  if (!latest) {
    return (
      <div className="space-y-8">
        <div className="animate-in">
          <h2 className="text-2xl font-semibold text-ink">Financials</h2>
          <p className="text-sm text-ink-muted mt-1">
            No financial data available. Run the seed script to populate data.
          </p>
        </div>
      </div>
    );
  }

  const chartData = [...metrics].reverse().map((m) => ({
    date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    CAC: m.cac,
    LTV: m.ltv,
    "LTV:CAC": Number(Number(m.ltv_cac_ratio).toFixed(1)),
    "Gross Margin": Number(Number(m.gross_margin).toFixed(1)),
  }));

  const totalInfraCost = serviceSummary.reduce((sum, s) => sum + s.total_cost, 0);
  const prev = metrics.length > 1 ? metrics[1] : latest;
  const cacChange = prev.cac > 0 ? ((latest.cac - prev.cac) / prev.cac) * 100 : 0;
  const ltvChange = prev.ltv > 0 ? ((latest.ltv - prev.ltv) / prev.ltv) * 100 : 0;

  // P&L mock data for 30k ARR business
  const annualRevenue = 30000;
  const monthlyRevenue = annualRevenue / 12; // $2,500/month

  const pnlData = {
    revenue: {
      mrr: monthlyRevenue,
      annual: annualRevenue,
    },
    cogs: {
      hosting: 180,
      infrastructure: 120,
      thirdPartyApis: 85,
      customerSupport: 150,
      total: 535,
    },
    grossProfit: monthlyRevenue - 535,
    grossMargin: ((monthlyRevenue - 535) / monthlyRevenue) * 100,
    opex: {
      marketing: 420,
      salaries: 0, // Solo founder
      tools: 145,
      legal: 50,
      misc: 80,
      total: 695,
    },
    ebitda: monthlyRevenue - 535 - 695 ,
    netMargin: ((monthlyRevenue - 535 - 695) / monthlyRevenue) * 100,
  };

  const burnRate = Math.abs(pnlData.ebitda); // Monthly burn
  const cashOnHand = 12000; // Assuming $12k in bank
  const runway = pnlData.ebitda < 0 ? cashOnHand / burnRate : Infinity;

  // Generate AI Accountant static analysis
  const aiAnalysis = generateStaticAnalysis(pnlData);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">Financials</h2>
        <p className="text-sm text-ink-muted mt-1">
          Unit economics, margins, and cost structure — last 90 days
        </p>
      </div>

      {/* P&L Statement + AI Accountant Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* P&L Table */}
        <div className="card animate-in">
          <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            Profit & Loss Statement
            <span className="text-2xs text-ink-muted font-normal ml-auto">Monthly</span>
          </h3>

          <div className="space-y-4">
            {/* Revenue */}
            <div>
              <div className="flex items-center justify-between py-2 border-b border-edge">
                <span className="text-sm font-semibold text-ink">Revenue</span>
                <span className="text-sm font-mono font-semibold text-success">
                  {formatCurrency(pnlData.revenue.mrr)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-xs text-ink-muted">Annual Run Rate</span>
                <span className="text-xs font-mono text-ink-secondary">
                  {formatCurrency(pnlData.revenue.annual)}
                </span>
              </div>
            </div>

            {/* COGS */}
            <div>
              <div className="flex items-center justify-between py-2 border-b border-edge">
                <span className="text-sm font-semibold text-ink">Cost of Goods Sold</span>
                <span className="text-sm font-mono font-semibold text-danger">
                  ({formatCurrency(pnlData.cogs.total)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-xs text-ink-muted">Hosting & Infrastructure</span>
                <span className="text-xs font-mono text-ink-secondary">
                  ({formatCurrency(pnlData.cogs.hosting + pnlData.cogs.infrastructure)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-xs text-ink-muted">Third-party APIs</span>
                <span className="text-xs font-mono text-ink-secondary">
                  ({formatCurrency(pnlData.cogs.thirdPartyApis)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-xs text-ink-muted">Customer Support Tools</span>
                <span className="text-xs font-mono text-ink-secondary">
                  ({formatCurrency(pnlData.cogs.customerSupport)})
                </span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex items-center justify-between py-2 border-y-2 border-edge bg-surface/30">
              <span className="text-sm font-bold text-ink">Gross Profit</span>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-ink">
                  {formatCurrency(pnlData.grossProfit)}
                </span>
                <span className="text-2xs text-ink-muted ml-2">
                  ({pnlData.grossMargin.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div>
              <div className="flex items-center justify-between py-2 border-b border-edge">
                <span className="text-sm font-semibold text-ink">Operating Expenses</span>
                <span className="text-sm font-mono font-semibold text-danger">
                  ({formatCurrency(pnlData.opex.total)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-xs text-ink-muted">Marketing & Ads</span>
                <span className="text-xs font-mono text-ink-secondary">
                  ({formatCurrency(pnlData.opex.marketing)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-xs text-ink-muted">SaaS Tools & Software</span>
                <span className="text-xs font-mono text-ink-secondary">
                  ({formatCurrency(pnlData.opex.tools)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-xs text-ink-muted">Legal & Compliance</span>
                <span className="text-xs font-mono text-ink-secondary">
                  ({formatCurrency(pnlData.opex.legal)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-xs text-ink-muted">Miscellaneous</span>
                <span className="text-xs font-mono text-ink-secondary">
                  ({formatCurrency(pnlData.opex.misc)})
                </span>
              </div>
            </div>

            {/* Net Income */}
            <div className="flex items-center justify-between py-2 border-y-2 border-edge bg-surface/50">
              <span className="text-sm font-bold text-ink">Net Income (EBITDA)</span>
              <div className="text-right">
                <span className={`text-sm font-mono font-bold ${pnlData.ebitda >= 0 ? "text-success" : "text-danger"}`}>
                  {pnlData.ebitda >= 0 ? formatCurrency(pnlData.ebitda) : `(${formatCurrency(Math.abs(pnlData.ebitda))})`}
                </span>
                <span className="text-2xs text-ink-muted ml-2">
                  ({pnlData.netMargin.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Accountant Analysis */}
        <div className="card animate-in bg-gradient-to-br from-[#8B5CF6]/5 to-accent/5 border-[#8B5CF6]/20">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            <h3 className="font-semibold text-ink">AI Accountant</h3>
            <span className="ml-auto px-2.5 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider bg-[#8B5CF6]/10 text-[#8B5CF6]">
              Beta
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {/* Health Assessment */}
            <div className="p-3 rounded-lg bg-base/50 border border-edge/50">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                  aiAnalysis.marginAnalysis.grossMargin.status === 'good' ? 'text-success' :
                  aiAnalysis.marginAnalysis.grossMargin.status === 'warning' ? 'text-warning' : 'text-danger'
                }`} />
                <div>
                  <h4 className="text-xs font-semibold text-ink mb-1">Health Assessment</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {aiAnalysis.healthAssessment}
                  </p>
                </div>
              </div>
            </div>

            {/* Margin Analysis */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-ink">Margin Analysis</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-base/50 border border-edge/50">
                  <p className="text-2xs text-ink-muted mb-1">Gross Margin</p>
                  <span className={`text-lg font-bold font-mono ${
                    aiAnalysis.marginAnalysis.grossMargin.status === 'good' ? 'text-success' :
                    aiAnalysis.marginAnalysis.grossMargin.status === 'warning' ? 'text-warning' : 'text-danger'
                  }`}>
                    {aiAnalysis.marginAnalysis.grossMargin.value.toFixed(1)}%
                  </span>
                  <p className="text-2xs text-ink-muted mt-1">{aiAnalysis.marginAnalysis.grossMargin.message}</p>
                </div>
                <div className="p-2 rounded bg-base/50 border border-edge/50">
                  <p className="text-2xs text-ink-muted mb-1">Net Margin</p>
                  <span className={`text-lg font-bold font-mono ${
                    aiAnalysis.marginAnalysis.netMargin.status === 'good' ? 'text-success' :
                    aiAnalysis.marginAnalysis.netMargin.status === 'warning' ? 'text-warning' : 'text-danger'
                  }`}>
                    {aiAnalysis.marginAnalysis.netMargin.value.toFixed(1)}%
                  </span>
                  <p className="text-2xs text-ink-muted mt-1">{aiAnalysis.marginAnalysis.netMargin.message}</p>
                </div>
              </div>
            </div>

            {/* Cost Structure */}
            <div className="p-3 rounded-lg bg-base/50 border border-edge/50">
              <h4 className="text-xs font-semibold text-ink mb-2">Cost Structure</h4>
              <div className="space-y-2 text-xs text-ink-secondary leading-relaxed">
                <p>{aiAnalysis.costStructure.cogs}</p>
                <p>{aiAnalysis.costStructure.marketing}</p>
              </div>
            </div>

            {/* Quick Wins */}
            <div className="p-3 rounded-lg bg-base/50 border border-edge/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-2xs font-bold">Q1</span>
                <h4 className="text-xs font-semibold text-ink">Quick Wins</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-ink-secondary">
                {aiAnalysis.quickWins.map((win, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-accent mt-0.5">•</span>
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Structural Improvements */}
            <div className="p-3 rounded-lg bg-base/50 border border-edge/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-success/10 text-success text-2xs font-bold">Q2-Q3</span>
                <h4 className="text-xs font-semibold text-ink">Structural</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-ink-secondary">
                {aiAnalysis.structuralImprovements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-success mt-0.5">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scale Levers */}
            <div className="p-3 rounded-lg bg-base/50 border border-edge/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-[#8B5CF6]/10 text-[#8B5CF6] text-2xs font-bold">Q4+</span>
                <h4 className="text-xs font-semibold text-ink">Scale</h4>
              </div>
              <ul className="space-y-1.5 text-xs text-ink-secondary">
                {aiAnalysis.scaleLevers.map((lever, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#8B5CF6] mt-0.5">•</span>
                    <span>{lever}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Metrics */}
            <div className="p-3 rounded-lg bg-base/50 border border-edge/50">
              <h4 className="text-xs font-semibold text-ink mb-2">Track These</h4>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary">Gross Profit</span>
                  <span className="font-mono font-semibold text-ink">{formatCurrency(pnlData.grossProfit)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary">LTV:CAC</span>
                  <span className="font-mono font-semibold text-ink">{latest ? Number(latest.ltv_cac_ratio).toFixed(1) : "—"}:1</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary">OpEx % GP</span>
                  <span className="font-mono font-semibold text-ink">{((pnlData.opex.total / pnlData.grossProfit) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Burn Rate & Runway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card animate-in stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-danger" />
            </div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Monthly Burn Rate</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-danger">
              {formatCurrency(burnRate)}
            </span>
          </div>
          <p className="text-2xs text-ink-muted mt-2">
            Revenue - Total Expenses
          </p>
        </div>

        <div className="card animate-in stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            </div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Runway</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${runway > 6 ? "text-success" : runway > 3 ? "text-warning" : "text-danger"}`}>
              {runway === Infinity ? "∞" : runway.toFixed(1)}
            </span>
            {runway !== Infinity && <span className="text-sm text-ink-muted">months</span>}
          </div>
          <p className="text-2xs text-ink-muted mt-2">
            Cash: {formatCurrency(cashOnHand)}
          </p>
        </div>

        <div className="card animate-in stagger-2 bg-accent/5 border-accent/20">
          <p className="text-xs font-semibold text-ink mb-2">Unit Economics</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xs text-ink-muted">ARPU</span>
              <span className="text-xs font-mono text-ink">{formatCurrency(monthlyRevenue / 12)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs text-ink-muted">CAC</span>
              <span className="text-xs font-mono text-ink">{formatCurrency(latest.cac)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-2xs text-ink-muted">LTV</span>
              <span className="text-xs font-mono text-ink">{formatCurrency(latest.ltv)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-accent/20">
              <span className="text-2xs font-semibold text-ink">LTV:CAC</span>
              <span className="text-xs font-mono font-bold text-accent">
                {Number(latest.ltv_cac_ratio).toFixed(1)}:1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Economics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Customer Lifetime Value"
          value={formatCurrency(latest.ltv)}
          change={ltvChange}
          changeLabel="vs yesterday"
          className="animate-in stagger-1"
        />
        <StatCard
          label="Customer Acquisition Cost"
          value={formatCurrency(latest.cac)}
          change={-cacChange}
          changeLabel="vs yesterday"
          className="animate-in stagger-1"
        />
        <StatCard
          label="Monthly Infra Cost"
          value={formatCurrency(totalInfraCost)}
          className="animate-in stagger-2"
        />
        <StatCard
          label="Monthly Recurring Revenue"
          value={formatCurrency(latest.mrr)}
          className="animate-in stagger-2"
        />
      </div>

      {/* Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card animate-in stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
            </div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">LTV:CAC Ratio</p>
          </div>
          <div className="flex items-baseline gap-2">
            <HealthIndicator value={latest.ltv_cac_ratio} thresholds={{ good: 3, warning: 2 }} />
            <span className="text-xs text-ink-muted">:1</span>
          </div>
          <p className="text-2xs text-ink-muted mt-2">Target: 3:1 or higher</p>
        </div>

        <div className="card animate-in stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-warning" />
            </div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Payback Period</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-semibold text-ink">{Number(latest.payback_period_months).toFixed(1)}</span>
            <span className="text-xs text-ink-muted">months</span>
          </div>
          <p className="text-2xs text-ink-muted mt-2">Target: &lt;12 months</p>
        </div>

        <div className="card animate-in stagger-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-success" />
            </div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Gross Margin</p>
          </div>
          <div className="flex items-baseline gap-2">
            <HealthIndicator value={latest.gross_margin} thresholds={{ good: 70, warning: 50 }} />
            <span className="text-xs text-ink-muted">%</span>
          </div>
          <p className="text-2xs text-ink-muted mt-2">Target: &gt;70%</p>
        </div>

        <div className="card animate-in stagger-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
            </div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Net Revenue Retention</p>
          </div>
          <div className="flex items-baseline gap-2">
            <HealthIndicator value={latest.nrr} thresholds={{ good: 110, warning: 100 }} />
            <span className="text-xs text-ink-muted">%</span>
          </div>
          <p className="text-2xs text-ink-muted mt-2">Target: &gt;110%</p>
        </div>
      </div>

      {/* CAC vs LTV Chart */}
      <div className="card animate-in stagger-5">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-warning" />
          CAC vs LTV
          <span className="text-2xs text-ink-muted font-normal ml-auto">Last 90 days</span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.filter((_, i) => i % 3 === 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
            <XAxis
              dataKey="date"
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
            <Bar dataKey="CAC" fill="#EF4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="LTV" fill="#059669" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Service Cost Breakdown */}
      {serviceSummary.length > 0 && (
        <div className="card animate-in stagger-6">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <Server className="w-4 h-4 text-ink-muted" />
            Infrastructure Costs
            <span className="text-2xs text-ink-muted font-normal ml-auto">Last 30 days</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-edge">
                  <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                    Service
                  </th>
                  <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                    Cost
                  </th>
                  <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                    Uptime
                  </th>
                  <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">
                    Error Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {serviceSummary.map((service) => (
                  <tr key={service.service_name} className="border-b border-edge/50">
                    <td className="py-2.5 pr-4 text-sm font-medium text-ink">
                      {service.service_name}
                    </td>
                    <td className="py-2.5 px-4 text-sm font-mono text-right text-ink">
                      {formatCurrency(service.total_cost)}
                    </td>
                    <td className="py-2.5 px-4 text-sm font-mono text-right">
                      <span className={service.avg_uptime >= 99.5 ? "text-success" : service.avg_uptime >= 99 ? "text-warning" : "text-danger"}>
                        {service.avg_uptime.toFixed(2)}%
                      </span>
                    </td>
                    <td className={`py-2.5 pl-4 text-sm font-mono text-right ${
                      service.avg_error_rate > 1 ? "text-danger font-semibold" : "text-ink-secondary"
                    }`}>
                      {service.avg_error_rate.toFixed(2)}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-edge">
                  <td className="py-2.5 pr-4 text-sm font-semibold text-ink">Total</td>
                  <td className="py-2.5 px-4 text-sm font-mono font-semibold text-right text-ink">
                    {formatCurrency(totalInfraCost)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
