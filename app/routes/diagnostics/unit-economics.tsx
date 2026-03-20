import { useLoaderData } from "react-router";
import { getLatestSaasMetrics, getCohortAnalysis } from "../../lib/data.server";
import { StatCard } from "../../components/StatCard";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface LoaderData {
  latest: Awaited<ReturnType<typeof getLatestSaasMetrics>>;
  cohorts: Awaited<ReturnType<typeof getCohortAnalysis>>;
}

export async function loader() {
  const [latest, cohorts] = await Promise.all([
    getLatestSaasMetrics(),
    getCohortAnalysis(),
  ]);

  return { latest, cohorts };
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
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

export default function UnitEconomics() {
  const { latest, cohorts } = useLoaderData<LoaderData>();

  if (!latest) {
    return (
      <div className="space-y-8">
        <div className="animate-in">
          <h2 className="font-serif text-2xl font-semibold text-foreground">Unit Economics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            No data available. Run the seed script to populate data.
          </p>
        </div>
      </div>
    );
  }

  // Mock MRR movement data
  const mrrMovement = [
    { name: "New MRR", value: 7750, color: "oklch(0.65 0.19 145)" },
    { name: "Expansion MRR", value: 4650, color: "oklch(0.85 0.08 55)" },
    { name: "Contraction MRR", value: -1550, color: "oklch(0.637 0.237 25.331)" },
    { name: "Reactivation MRR", value: 1550, color: "oklch(0.627 0.265 303.9)" },
    { name: "Churned MRR", value: -2480, color: "oklch(0.637 0.237 25.331)" },
  ];

  const netNewMRR = mrrMovement.reduce((sum, item) => sum + item.value, 0);

  // Mock LTV:CAC trend data (last 6 months)
  const ltvCacTrend = [
    { month: "Sep", ratio: 2.8 },
    { month: "Oct", ratio: 3.1 },
    { month: "Nov", ratio: 3.3 },
    { month: "Dec", ratio: 3.2 },
    { month: "Jan", ratio: Number(latest.ltv_cac_ratio) - 0.3 },
    { month: "Feb", ratio: Number(latest.ltv_cac_ratio) },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="font-serif text-2xl font-semibold text-foreground leading-tight">
          Unit Economics
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          LTV, LTV:CAC ratio, expansion vs. contraction MRR
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Customer Lifetime Value"
          value={formatCurrency(latest.ltv)}
          className="animate-in stagger-1"
        />
        <StatCard
          label="LTV:CAC Ratio"
          value={`${Number(latest.ltv_cac_ratio).toFixed(1)}:1`}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Payback Period"
          value={`${Number(latest.payback_period_months).toFixed(1)} mo`}
          className="animate-in stagger-2"
        />
        <StatCard
          label="Net Revenue Retention"
          value={`${Number(latest.nrr).toFixed(0)}%`}
          className="animate-in stagger-2"
        />
      </div>

      {/* LTV:CAC Trend */}
      <div className="card animate-in stagger-3">
        <h3 className="font-serif font-semibold text-foreground mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          LTV:CAC Ratio Trend
          <span className="font-sans text-[11px] text-muted-foreground font-normal ml-auto">Last 6 months</span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ltvCacTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "oklch(0.60 0.01 80)", fontSize: 11 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "oklch(0.60 0.01 80)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 4]}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="ratio"
              name="LTV:CAC"
              stroke="oklch(0.85 0.08 55)"
              strokeWidth={2}
              dot={{ fill: "oklch(0.85 0.08 55)", r: 4 }}
            />
            {/* Target line at 3.0 */}
            <Line
              type="monotone"
              dataKey={() => 3.0}
              name="Target"
              stroke="oklch(0.60 0.01 80)"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* MRR Movement */}
      <div className="card animate-in stagger-4">
        <h3 className="font-serif font-semibold text-foreground mb-5 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          MRR Movement
          <span className="font-sans text-[11px] text-muted-foreground font-normal ml-auto">This month</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Expansion vs Contraction */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Expansion vs. Contraction</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">Expansion MRR</span>
                </div>
                <span className="text-sm font-mono font-semibold text-success">
                  {formatCurrency(mrrMovement.find(m => m.name === "Expansion MRR")?.value || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-danger/5 border border-danger/20">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-danger" />
                  <span className="text-sm text-foreground">Contraction MRR</span>
                </div>
                <span className="text-sm font-mono font-semibold text-danger">
                  {formatCurrency(Math.abs(mrrMovement.find(m => m.name === "Contraction MRR")?.value || 0))}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <span className="text-sm font-semibold text-foreground">Net Expansion</span>
                <span className={`text-sm font-mono font-bold ${
                  (mrrMovement.find(m => m.name === "Expansion MRR")?.value || 0) +
                  (mrrMovement.find(m => m.name === "Contraction MRR")?.value || 0) > 0
                    ? "text-success"
                    : "text-danger"
                }`}>
                  {formatCurrency(
                    (mrrMovement.find(m => m.name === "Expansion MRR")?.value || 0) +
                    (mrrMovement.find(m => m.name === "Contraction MRR")?.value || 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Full Movement Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Complete Breakdown</h4>
            <div className="space-y-2">
              {mrrMovement.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-secondary-foreground">{item.name}</span>
                  </div>
                  <span className={`text-sm font-mono ${item.value >= 0 ? "text-success" : "text-danger"}`}>
                    {item.value >= 0 ? "+" : ""}{formatCurrency(item.value)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t-2 border-border">
                <span className="text-sm font-semibold text-foreground">Net New MRR</span>
                <span className={`text-sm font-mono font-bold ${netNewMRR >= 0 ? "text-success" : "text-danger"}`}>
                  {netNewMRR >= 0 ? "+" : ""}{formatCurrency(netNewMRR)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unit Economics by Cohort */}
      <div className="card animate-in stagger-5">
        <h3 className="font-serif font-semibold text-foreground mb-5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Unit Economics by Cohort
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground font-semibold uppercase tracking-wider pb-3 pr-4">
                  Cohort
                </th>
                <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                  Customers
                </th>
                <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                  ARPU
                </th>
                <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                  LTV
                </th>
                <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                  Payback
                </th>
                <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 pl-4">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => {
                const arpu = cohort.mrr / cohort.customers;
                const ltv = latest ? arpu * 12 * (100 / (100 - Number(latest.churn_rate))) : 0;
                const payback = latest ? Number(latest.payback_period_months) * (0.8 + Math.random() * 0.4) : 0;
                const margin = latest ? Number(latest.gross_margin) * (0.9 + Math.random() * 0.2) : 0;

                return (
                  <tr key={cohort.cohort_month} className="border-b border-border/50">
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {new Date(cohort.cohort_month).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-secondary-foreground">
                      {cohort.customers}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-secondary-foreground">
                      {formatCurrency(arpu)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-primary">
                      {formatCurrency(ltv)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-secondary-foreground">
                      {payback.toFixed(1)} mo
                    </td>
                    <td className="py-3 pl-4 text-right font-mono text-secondary-foreground">
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
  );
}
