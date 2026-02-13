import { useLoaderData } from "react-router";
import {
  getSaasMetrics,
  getLatestSaasMetrics,
} from "../lib/data.server";
import { getServiceCostSummary, type ServiceCostSummary } from "../lib/operations.server";
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">Financials</h2>
        <p className="text-sm text-ink-muted mt-1">
          Unit economics, margins, and cost structure — last 90 days
        </p>
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
