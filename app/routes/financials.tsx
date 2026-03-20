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
          <h2 className="text-2xl font-semibold text-foreground font-serif">Financials</h2>
          <p className="text-sm text-muted-foreground mt-1">
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

  const annualRevenue = 40000;
  const monthlyRevenue = annualRevenue / 12;

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
      salaries: 0,
      tools: 145,
      legal: 50,
      misc: 80,
      total: 695,
    },
    ebitda: monthlyRevenue - 535 - 695,
    netMargin: ((monthlyRevenue - 535 - 695) / monthlyRevenue) * 100,
  };

  const burnRate = Math.abs(pnlData.ebitda);
  const cashOnHand = 12000;
  const runway = pnlData.ebitda < 0 ? cashOnHand / burnRate : Infinity;

  const aiAnalysis = generateStaticAnalysis(pnlData);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-foreground leading-tight font-serif">Financials</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Unit economics, margins, and cost structure — last 90 days
        </p>
      </div>

      {/* P&L Statement + AI Accountant Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Table */}
        <div className="card animate-in">
          <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2 font-serif">
            <DollarSign className="w-4 h-4 text-primary" />
            Profit & Loss Statement
            <span className="text-[11px] text-muted-foreground font-normal font-sans ml-auto">Monthly</span>
          </h3>

          <div className="space-y-4">
            {/* Revenue */}
            <div>
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Revenue</span>
                <span className="text-sm font-mono font-semibold text-success">
                  {formatCurrency(pnlData.revenue.mrr)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-[13px] text-muted-foreground">Annual Run Rate</span>
                <span className="text-[13px] font-mono text-secondary-foreground">
                  {formatCurrency(pnlData.revenue.annual)}
                </span>
              </div>
            </div>

            {/* COGS */}
            <div>
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Cost of Goods Sold</span>
                <span className="text-sm font-mono font-semibold text-danger">
                  ({formatCurrency(pnlData.cogs.total)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-[13px] text-muted-foreground">Hosting & Infrastructure</span>
                <span className="text-[13px] font-mono text-secondary-foreground">
                  ({formatCurrency(pnlData.cogs.hosting + pnlData.cogs.infrastructure)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-[13px] text-muted-foreground">Third-party APIs</span>
                <span className="text-[13px] font-mono text-secondary-foreground">
                  ({formatCurrency(pnlData.cogs.thirdPartyApis)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-[13px] text-muted-foreground">Customer Support Tools</span>
                <span className="text-[13px] font-mono text-secondary-foreground">
                  ({formatCurrency(pnlData.cogs.customerSupport)})
                </span>
              </div>
            </div>

            {/* Gross Profit */}
            <div className="flex items-center justify-between py-2.5 border-y-2 border-border bg-muted/30 px-2 -mx-2 rounded">
              <span className="text-sm font-bold text-foreground">Gross Profit</span>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-foreground">
                  {formatCurrency(pnlData.grossProfit)}
                </span>
                <span className="text-[11px] text-muted-foreground ml-2">
                  ({pnlData.grossMargin.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Operating Expenses */}
            <div>
              <div className="flex items-center justify-between py-2.5 border-b border-border">
                <span className="text-sm font-semibold text-foreground">Operating Expenses</span>
                <span className="text-sm font-mono font-semibold text-danger">
                  ({formatCurrency(pnlData.opex.total)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-[13px] text-muted-foreground">Marketing & Ads</span>
                <span className="text-[13px] font-mono text-secondary-foreground">
                  ({formatCurrency(pnlData.opex.marketing)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-[13px] text-muted-foreground">SaaS Tools & Software</span>
                <span className="text-[13px] font-mono text-secondary-foreground">
                  ({formatCurrency(pnlData.opex.tools)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-[13px] text-muted-foreground">Legal & Compliance</span>
                <span className="text-[13px] font-mono text-secondary-foreground">
                  ({formatCurrency(pnlData.opex.legal)})
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 pl-4">
                <span className="text-[13px] text-muted-foreground">Miscellaneous</span>
                <span className="text-[13px] font-mono text-secondary-foreground">
                  ({formatCurrency(pnlData.opex.misc)})
                </span>
              </div>
            </div>

            {/* Net Income */}
            <div className="flex items-center justify-between py-2.5 border-y-2 border-border bg-muted/50 px-2 -mx-2 rounded">
              <span className="text-sm font-bold text-foreground">Net Income (EBITDA)</span>
              <div className="text-right">
                <span className={`text-sm font-mono font-bold ${pnlData.ebitda >= 0 ? "text-success" : "text-danger"}`}>
                  {pnlData.ebitda >= 0 ? formatCurrency(pnlData.ebitda) : `(${formatCurrency(Math.abs(pnlData.ebitda))})`}
                </span>
                <span className="text-[11px] text-muted-foreground ml-2">
                  ({pnlData.netMargin.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Accountant Analysis */}
        <div className="card animate-in border-chart-4/20">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-chart-4" />
            </div>
            <h3 className="font-semibold text-foreground font-serif">AI Accountant</h3>
            <span className="ml-auto px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-chart-4/10 text-chart-4">
              Beta
            </span>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {/* Health Assessment */}
            <div className="p-3.5 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                  aiAnalysis.marginAnalysis.grossMargin.status === 'good' ? 'text-success' :
                  aiAnalysis.marginAnalysis.grossMargin.status === 'warning' ? 'text-warning' : 'text-danger'
                }`} />
                <div>
                  <h4 className="text-[13px] font-semibold text-foreground mb-1">Health Assessment</h4>
                  <p className="text-[13px] text-secondary-foreground leading-relaxed">
                    {aiAnalysis.healthAssessment}
                  </p>
                </div>
              </div>
            </div>

            {/* Margin Analysis */}
            <div className="space-y-2">
              <h4 className="text-[13px] font-semibold text-foreground">Margin Analysis</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-[11px] text-muted-foreground mb-1">Gross Margin</p>
                  <span className={`text-lg font-bold font-mono ${
                    aiAnalysis.marginAnalysis.grossMargin.status === 'good' ? 'text-success' :
                    aiAnalysis.marginAnalysis.grossMargin.status === 'warning' ? 'text-warning' : 'text-danger'
                  }`}>
                    {aiAnalysis.marginAnalysis.grossMargin.value.toFixed(1)}%
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1">{aiAnalysis.marginAnalysis.grossMargin.message}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-[11px] text-muted-foreground mb-1">Net Margin</p>
                  <span className={`text-lg font-bold font-mono ${
                    aiAnalysis.marginAnalysis.netMargin.status === 'good' ? 'text-success' :
                    aiAnalysis.marginAnalysis.netMargin.status === 'warning' ? 'text-warning' : 'text-danger'
                  }`}>
                    {aiAnalysis.marginAnalysis.netMargin.value.toFixed(1)}%
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1">{aiAnalysis.marginAnalysis.netMargin.message}</p>
                </div>
              </div>
            </div>

            {/* Cost Structure */}
            <div className="p-3.5 rounded-lg bg-muted/50 border border-border/50">
              <h4 className="text-[13px] font-semibold text-foreground mb-2">Cost Structure</h4>
              <div className="space-y-2 text-[13px] text-secondary-foreground leading-relaxed">
                <p>{aiAnalysis.costStructure.cogs}</p>
                <p>{aiAnalysis.costStructure.marketing}</p>
              </div>
            </div>

            {/* Quick Wins */}
            <div className="p-3.5 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-bold font-mono">Q1</span>
                <h4 className="text-[13px] font-semibold text-foreground">Quick Wins</h4>
              </div>
              <ul className="space-y-1.5 text-[13px] text-secondary-foreground">
                {aiAnalysis.quickWins.map((win, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Structural Improvements */}
            <div className="p-3.5 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-success/10 text-success text-[11px] font-bold font-mono">Q2-Q3</span>
                <h4 className="text-[13px] font-semibold text-foreground">Structural</h4>
              </div>
              <ul className="space-y-1.5 text-[13px] text-secondary-foreground">
                {aiAnalysis.structuralImprovements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-success mt-0.5">•</span>
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Scale Levers */}
            <div className="p-3.5 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-1.5 py-0.5 rounded bg-chart-4/10 text-chart-4 text-[11px] font-bold font-mono">Q4+</span>
                <h4 className="text-[13px] font-semibold text-foreground">Scale</h4>
              </div>
              <ul className="space-y-1.5 text-[13px] text-secondary-foreground">
                {aiAnalysis.scaleLevers.map((lever, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-chart-4 mt-0.5">•</span>
                    <span>{lever}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Key Metrics */}
            <div className="p-3.5 rounded-lg bg-muted/50 border border-border/50">
              <h4 className="text-[13px] font-semibold text-foreground mb-2">Track These</h4>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">Gross Profit</span>
                  <span className="font-mono font-semibold text-foreground">{formatCurrency(pnlData.grossProfit)}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">LTV:CAC</span>
                  <span className="font-mono font-semibold text-foreground">{latest ? Number(latest.ltv_cac_ratio).toFixed(1) : "—"}:1</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">OpEx % GP</span>
                  <span className="font-mono font-semibold text-foreground">{((pnlData.opex.total / pnlData.grossProfit) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Burn Rate & Runway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card animate-in stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5 text-danger" />
            </div>
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Monthly Burn Rate</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-danger font-mono">
              {formatCurrency(burnRate)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Revenue - Total Expenses
          </p>
        </div>

        <div className="card animate-in stagger-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            </div>
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Runway</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono ${runway > 6 ? "text-success" : runway > 3 ? "text-warning" : "text-danger"}`}>
              {runway === Infinity ? "∞" : runway.toFixed(1)}
            </span>
            {runway !== Infinity && <span className="text-sm text-muted-foreground">months</span>}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Cash: {formatCurrency(cashOnHand)}
          </p>
        </div>

        <div className="card animate-in stagger-2 border-primary/20">
          <p className="text-[13px] font-semibold text-foreground mb-3">Unit Economics</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">ARPU</span>
              <span className="text-[13px] font-mono text-foreground">{formatCurrency(monthlyRevenue / 12)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">CAC</span>
              <span className="text-[13px] font-mono text-foreground">{formatCurrency(latest.cac)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">LTV</span>
              <span className="text-[13px] font-mono text-foreground">{formatCurrency(latest.ltv)}</span>
            </div>
            <div className="flex items-center justify-between pt-2.5 border-t border-primary/20">
              <span className="text-[11px] font-semibold text-foreground">LTV:CAC</span>
              <span className="text-[13px] font-mono font-bold text-primary">
                {Number(latest.ltv_cac_ratio).toFixed(1)}:1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Economics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card animate-in stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">LTV:CAC Ratio</p>
          </div>
          <div className="flex items-baseline gap-2">
            <HealthIndicator value={latest.ltv_cac_ratio} thresholds={{ good: 3, warning: 2 }} />
            <span className="text-[13px] text-muted-foreground">:1</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Target: 3:1 or higher</p>
        </div>

        <div className="card animate-in stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-warning" />
            </div>
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Payback Period</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-semibold text-foreground">{Number(latest.payback_period_months).toFixed(1)}</span>
            <span className="text-[13px] text-muted-foreground">months</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Target: &lt;12 months</p>
        </div>

        <div className="card animate-in stagger-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-success" />
            </div>
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Gross Margin</p>
          </div>
          <div className="flex items-baseline gap-2">
            <HealthIndicator value={latest.gross_margin} thresholds={{ good: 70, warning: 50 }} />
            <span className="text-[13px] text-muted-foreground">%</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Target: &gt;70%</p>
        </div>

        <div className="card animate-in stagger-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Net Revenue Retention</p>
          </div>
          <div className="flex items-baseline gap-2">
            <HealthIndicator value={latest.nrr} thresholds={{ good: 110, warning: 100 }} />
            <span className="text-[13px] text-muted-foreground">%</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">Target: &gt;110%</p>
        </div>
      </div>

      {/* CAC vs LTV Chart */}
      <div className="card animate-in stagger-5">
        <h3 className="text-base font-semibold text-foreground mb-6 flex items-center gap-2 font-serif">
          <DollarSign className="w-4 h-4 text-warning" />
          CAC vs LTV
          <span className="text-[11px] text-muted-foreground font-normal font-sans ml-auto">Last 90 days</span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData.filter((_, i) => i % 3 === 0)}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "oklch(0.60 0.01 80)", fontSize: 11, fontFamily: "'Geist Mono', monospace" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.60 0.01 80)", fontSize: 11, fontFamily: "'Geist Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="CAC" fill="oklch(0.637 0.237 25.331)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="LTV" fill="oklch(0.65 0.19 145)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Service Cost Breakdown */}
      {serviceSummary.length > 0 && (
        <div className="card animate-in stagger-6">
          <h3 className="text-base font-semibold text-foreground mb-6 flex items-center gap-2 font-serif">
            <Server className="w-4 h-4 text-muted-foreground" />
            Infrastructure Costs
            <span className="text-[11px] text-muted-foreground font-normal font-sans ml-auto">Last 30 days</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 pr-4">
                    Service
                  </th>
                  <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 px-4">
                    Cost
                  </th>
                  <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 px-4">
                    Uptime
                  </th>
                  <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider pb-3 pl-4">
                    Error Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {serviceSummary.map((service) => (
                  <tr key={service.service_name} className="border-b border-border/50">
                    <td className="py-2.5 pr-4 text-sm font-medium text-foreground">
                      {service.service_name}
                    </td>
                    <td className="py-2.5 px-4 text-sm font-mono text-right text-foreground">
                      {formatCurrency(service.total_cost)}
                    </td>
                    <td className="py-2.5 px-4 text-sm font-mono text-right">
                      <span className={service.avg_uptime >= 99.5 ? "text-success" : service.avg_uptime >= 99 ? "text-warning" : "text-danger"}>
                        {service.avg_uptime.toFixed(2)}%
                      </span>
                    </td>
                    <td className={`py-2.5 pl-4 text-sm font-mono text-right ${
                      service.avg_error_rate > 1 ? "text-danger font-semibold" : "text-secondary-foreground"
                    }`}>
                      {service.avg_error_rate.toFixed(2)}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 pr-4 text-sm font-semibold text-foreground">Total</td>
                  <td className="py-2.5 px-4 text-sm font-mono font-semibold text-right text-foreground">
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
