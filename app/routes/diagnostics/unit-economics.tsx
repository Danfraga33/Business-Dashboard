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

export default function UnitEconomics() {
  const { latest, cohorts } = useLoaderData<LoaderData>();

  if (!latest) {
    return (
      <div className="space-y-8">
        <div className="animate-in">
          <h2 className="text-2xl font-semibold text-ink">Unit Economics</h2>
          <p className="text-sm text-ink-muted mt-1">
            No data available. Run the seed script to populate data.
          </p>
        </div>
      </div>
    );
  }

  // Mock MRR movement data
  const mrrMovement = [
    { name: "New MRR", value: 7750, color: "#059669" },
    { name: "Expansion MRR", value: 4650, color: "#2563EB" },
    { name: "Contraction MRR", value: -1550, color: "#EF4444" },
    { name: "Reactivation MRR", value: 1550, color: "#7C3AED" },
    { name: "Churned MRR", value: -2480, color: "#DC2626" },
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
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Unit Economics
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          LTV, LTV:CAC ratio, expansion vs. contraction MRR
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
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
        <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          LTV:CAC Ratio Trend
          <span className="text-2xs text-ink-muted font-normal ml-auto">Last 6 months</span>
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ltvCacTrend}>
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
              domain={[0, 4]}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="ratio"
              name="LTV:CAC"
              stroke="#2563EB"
              strokeWidth={2}
              dot={{ fill: "#2563EB", r: 4 }}
            />
            {/* Target line at 3.0 */}
            <Line
              type="monotone"
              dataKey={() => 3.0}
              name="Target"
              stroke="#78716C"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* MRR Movement */}
      <div className="card animate-in stagger-4">
        <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-accent" />
          MRR Movement
          <span className="text-2xs text-ink-muted font-normal ml-auto">This month</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Expansion vs Contraction */}
          <div>
            <h4 className="text-sm font-semibold text-ink mb-4">Expansion vs. Contraction</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-success" />
                  <span className="text-sm text-ink">Expansion MRR</span>
                </div>
                <span className="text-sm font-mono font-semibold text-success">
                  {formatCurrency(mrrMovement.find(m => m.name === "Expansion MRR")?.value || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-danger/5 border border-danger/20">
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-danger" />
                  <span className="text-sm text-ink">Contraction MRR</span>
                </div>
                <span className="text-sm font-mono font-semibold text-danger">
                  {formatCurrency(Math.abs(mrrMovement.find(m => m.name === "Contraction MRR")?.value || 0))}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-accent/5 border border-accent/20">
                <span className="text-sm font-semibold text-ink">Net Expansion</span>
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
            <h4 className="text-sm font-semibold text-ink mb-4">Complete Breakdown</h4>
            <div className="space-y-2">
              {mrrMovement.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-2 border-b border-edge/50">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-ink-secondary">{item.name}</span>
                  </div>
                  <span className={`text-sm font-mono ${item.value >= 0 ? "text-success" : "text-danger"}`}>
                    {item.value >= 0 ? "+" : ""}{formatCurrency(item.value)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t-2 border-edge">
                <span className="text-sm font-semibold text-ink">Net New MRR</span>
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
        <h3 className="font-semibold text-ink mb-5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          Unit Economics by Cohort
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-ink-muted font-semibold uppercase tracking-wider pb-3 pr-4">
                  Cohort
                </th>
                <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 px-4">
                  Customers
                </th>
                <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 px-4">
                  ARPU
                </th>
                <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 px-4">
                  LTV
                </th>
                <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 px-4">
                  Payback
                </th>
                <th className="text-right text-ink-muted font-semibold uppercase tracking-wider pb-3 pl-4">
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
                  <tr key={cohort.cohort_month} className="border-b border-edge/50">
                    <td className="py-3 pr-4 font-medium text-ink">
                      {new Date(cohort.cohort_month).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-ink-secondary">
                      {cohort.customers}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-ink-secondary">
                      {formatCurrency(arpu)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-accent">
                      {formatCurrency(ltv)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-ink-secondary">
                      {payback.toFixed(1)} mo
                    </td>
                    <td className="py-3 pl-4 text-right font-mono text-ink-secondary">
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
