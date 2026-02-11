import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Flame } from "lucide-react";
import { MetricComparison } from "../components/MetricComparison";
import { plSummary, monthlyBurn, budgetAlerts } from "../data/financials";

type Period = "mtd" | "qtd" | "ytd";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-edge rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-ink-muted mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} className="text-xs font-mono" style={{ color: entry.color }}>
          {entry.name}: ${entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

export default function Financials() {
  const [period, setPeriod] = useState<Period>("mtd");
  const netIncome = plSummary.revenue.total - plSummary.expenses.total;
  const margin = ((netIncome / plSummary.revenue.total) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between animate-in">
        <div>
          <h2 className="text-2xl font-semibold text-ink leading-tight">
            Financial Dashboard
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            Budget tracking and P&L analysis
          </p>
        </div>
        <div className="flex bg-surface border border-edge rounded-lg overflow-hidden">
          {(["mtd", "qtd", "ytd"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer ${
                period === p
                  ? "bg-accent/10 text-accent"
                  : "text-ink-muted hover:text-ink-secondary"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* P&L Summary + Burn Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* P&L Summary */}
        <div className="card animate-in stagger-1">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            P&L Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-secondary">Revenue</span>
              <span className="metric-value text-lg text-success">
                ${plSummary.revenue.total.toLocaleString()}
              </span>
            </div>
            <div className="pl-4 space-y-2">
              {plSummary.revenue.breakdown.map((item) => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-xs text-ink-muted">{item.name}</span>
                  <span className="text-xs font-mono text-ink-secondary">
                    ${item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-edge pt-3 flex justify-between items-center">
              <span className="text-sm text-ink-secondary">Expenses</span>
              <span className="metric-value text-lg text-danger">
                -${plSummary.expenses.total.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-edge pt-3 flex justify-between items-center">
              <span className="text-sm font-medium text-ink">
                Net Income
              </span>
              <div className="text-right">
                <span className="metric-value text-xl text-success">
                  ${netIncome.toLocaleString()}
                </span>
                <p className="text-2xs font-mono text-ink-muted mt-0.5">
                  {margin}% margin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Burn Chart */}
        <div className="card animate-in stagger-2">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-warning" />
            Revenue vs Expenses
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyBurn}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2749" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={{ stroke: "#1E2749" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748B", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#EF4444"
                strokeWidth={2}
                fill="url(#expGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown Table */}
      <div className="card animate-in stagger-3">
        <h3 className="text-base font-semibold text-ink mb-5">
          Expense Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                  Category
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Budget
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Actual
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">
                  Variance
                </th>
              </tr>
            </thead>
            <tbody>
              {plSummary.expenses.breakdown.map((item) => (
                <MetricComparison
                  key={item.category}
                  label={item.category}
                  budget={item.budget}
                  actual={item.actual}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-edge">
                <td className="py-3 pr-4 text-sm font-semibold text-ink">
                  Total
                </td>
                <td className="py-3 px-4 text-sm font-mono text-right text-ink-muted">
                  $
                  {plSummary.expenses.breakdown
                    .reduce((s, i) => s + i.budget, 0)
                    .toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm font-mono text-right font-semibold text-ink">
                  ${plSummary.expenses.total.toLocaleString()}
                </td>
                <td className="py-3 pl-4 text-sm font-mono text-right font-semibold text-danger">
                  +$
                  {(
                    plSummary.expenses.total -
                    plSummary.expenses.breakdown.reduce((s, i) => s + i.budget, 0)
                  ).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Budget Alerts */}
      <div className="card animate-in stagger-4">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Budget Alerts
        </h3>
        <div className="space-y-3">
          {budgetAlerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                alert.severity === "danger"
                  ? "bg-danger/5 border-danger/20"
                  : "bg-warning/5 border-warning/20"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  alert.severity === "danger" ? "bg-danger" : "bg-warning"
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-ink">
                    {alert.category}
                  </span>
                  <span className="text-xs font-mono text-danger">
                    +${alert.overage.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-ink-muted">{alert.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
