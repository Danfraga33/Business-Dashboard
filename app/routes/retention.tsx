import { useLoaderData } from "react-router";
import {
  getCustomerStats,
  getCohortAnalysis,
  getChurnReasons,
} from "../lib/data.server";
import { getFeatureRollouts } from "../lib/operations.server";
import type { CustomerStats, CohortData, FeatureRollout } from "../types/dashboard";
import { StatCard } from "../components/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, UserCheck, UserX, Layers, Sparkles } from "lucide-react";

interface LoaderData {
  customerStats: CustomerStats;
  cohorts: CohortData[];
  churnReasons: { reason: string; count: number }[];
  features: FeatureRollout[];
}

export async function loader() {
  const [customerStats, cohorts, churnReasons, features] = await Promise.all([
    getCustomerStats(),
    getCohortAnalysis(),
    getChurnReasons(),
    getFeatureRollouts(),
  ]);

  return { customerStats, cohorts, churnReasons, features };
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

export default function Retention() {
  const { customerStats, cohorts, churnReasons, features } =
    useLoaderData<LoaderData>();

  const productionFeatures = features.filter((f) => f.status === "production");
  const betaFeatures = features.filter((f) => f.status === "beta");

  const avgRetention = cohorts.length > 0
    ? cohorts.reduce((sum, c) => sum + c.retention_rate, 0) / cohorts.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Product & Retention
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Activation, feature adoption, cohort retention, and churn analysis
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Activation Rate"
          value={customerStats.activation_rate.toFixed(1) + "%"}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Avg Health Score"
          value={customerStats.avg_health_score.toFixed(0) + "/100"}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Avg Cohort Retention"
          value={avgRetention.toFixed(1) + "%"}
          className="animate-in stagger-2"
        />
        <StatCard
          label="Churned Customers"
          value={customerStats.churned.toString()}
          className="animate-in stagger-2"
        />
      </div>

      {/* Customer Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card animate-in stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-accent" />
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Total</p>
          </div>
          <p className="text-3xl font-mono font-semibold text-ink">{customerStats.total}</p>
        </div>
        <div className="card animate-in stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-success" />
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Active</p>
          </div>
          <p className="text-3xl font-mono font-semibold text-success">{customerStats.active}</p>
          <p className="text-xs text-ink-muted mt-1">
            +{customerStats.new_this_month} new this month
          </p>
        </div>
        <div className="card animate-in stagger-3">
          <div className="flex items-center gap-2 mb-3">
            <UserX className="w-4 h-4 text-danger" />
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">Churned</p>
          </div>
          <p className="text-3xl font-mono font-semibold text-danger">{customerStats.churned}</p>
        </div>
      </div>

      {/* Churn Reasons */}
      {churnReasons.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card animate-in stagger-4">
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

          <div className="card animate-in stagger-4">
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

      {/* Cohort Retention Table */}
      <div className="card animate-in stagger-5">
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

      {/* Feature Adoption */}
      <div className="card animate-in stagger-6">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          Feature Adoption
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                  Feature
                </th>
                <th className="text-center text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Status
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Adoption
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Engagement
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">
                  Retention Impact
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.id} className="border-b border-edge/50">
                  <td className="py-2.5 pr-4">
                    <p className="text-sm font-medium text-ink">{feature.feature_name}</p>
                    {feature.description && (
                      <p className="text-xs text-ink-muted mt-0.5 truncate max-w-xs">
                        {feature.description}
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider ${
                      feature.status === "production"
                        ? "bg-success/10 text-success"
                        : feature.status === "beta"
                        ? "bg-warning/10 text-warning"
                        : "bg-accent/10 text-accent"
                    }`}>
                      {feature.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right text-ink-secondary">
                    {feature.adoption_rate != null ? `${Number(feature.adoption_rate).toFixed(0)}%` : "—"}
                  </td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right">
                    <span className={
                      (feature.engagement_score ?? 0) >= 70
                        ? "text-success"
                        : (feature.engagement_score ?? 0) >= 40
                        ? "text-warning"
                        : "text-ink-secondary"
                    }>
                      {feature.engagement_score != null ? `${feature.engagement_score}/100` : "—"}
                    </span>
                  </td>
                  <td className="py-2.5 pl-4 text-sm font-mono text-right">
                    {feature.retention_impact != null ? (
                      <span className={feature.retention_impact >= 0 ? "text-success" : "text-danger"}>
                        {feature.retention_impact >= 0 ? "+" : ""}{Number(feature.retention_impact).toFixed(1)}%
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
