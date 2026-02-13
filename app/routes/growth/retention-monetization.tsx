import { useLoaderData } from "react-router";
import {
  getCustomerStats,
  getCohortAnalysis,
  getChurnReasons,
} from "../../lib/data.server";
import { getPricingExperiments, getFeatureRollouts } from "../../lib/operations.server";
import type { CustomerStats, CohortData, PricingExperiment, FeatureRollout } from "../../types/dashboard";
import { StatCard } from "../../components/StatCard";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Shield,
  UserX,
  Layers,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface LoaderData {
  customerStats: CustomerStats;
  cohorts: CohortData[];
  churnReasons: { reason: string; count: number }[];
  experiments: PricingExperiment[];
  features: FeatureRollout[];
}

export async function loader() {
  const [customerStats, cohorts, churnReasons, experiments, features] = await Promise.all([
    getCustomerStats(),
    getCohortAnalysis(),
    getChurnReasons(),
    getPricingExperiments(),
    getFeatureRollouts(),
  ]);

  return { customerStats, cohorts, churnReasons, experiments, features };
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-accent/10 text-accent",
    completed: "bg-success/10 text-success",
    cancelled: "bg-danger/10 text-danger",
  };
  const icons: Record<string, React.ReactNode> = {
    active: <Clock className="w-3 h-3" />,
    completed: <CheckCircle2 className="w-3 h-3" />,
    cancelled: <XCircle className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold uppercase tracking-wider ${
      styles[status] || "bg-surface text-ink-muted"
    }`}>
      {icons[status]}
      {status}
    </span>
  );
}

function WinnerBadge({ winner }: { winner: string | null }) {
  if (!winner) return <span className="text-xs text-ink-muted">Pending</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-success/10 text-success">
      <CheckCircle2 className="w-3 h-3" />
      Variant {winner}
    </span>
  );
}

export default function RetentionMonetization() {
  const { customerStats, cohorts, churnReasons, experiments, features } =
    useLoaderData<LoaderData>();

  const avgRetention = cohorts.length > 0
    ? cohorts.reduce((sum, c) => sum + c.retention_rate, 0) / cohorts.length
    : 0;

  const churnRate = customerStats.total > 0
    ? (customerStats.churned / customerStats.total) * 100
    : 0;

  const activeExperiments = experiments.filter((e) => e.status === "active");
  const completedExperiments = experiments.filter((e) => e.status === "completed");
  const totalRevenueImpact = completedExperiments.reduce(
    (sum, e) => sum + (e.revenue_impact || 0),
    0
  );

  // Features sorted by retention impact
  const retentionFeatures = features
    .filter((f) => f.retention_impact != null)
    .sort((a, b) => (b.retention_impact ?? 0) - (a.retention_impact ?? 0));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Tier 1 — Foundation</span>
        </div>
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Retention & Monetization
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Churn optimization, ARPU, pricing experiments, and upsell levers
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Avg Cohort Retention"
          value={avgRetention.toFixed(1) + "%"}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Churn Rate"
          value={churnRate.toFixed(1) + "%"}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Active Experiments"
          value={activeExperiments.length.toString()}
          className="animate-in stagger-2"
        />
        <StatCard
          label="Revenue Impact"
          value={formatCurrency(totalRevenueImpact)}
          className="animate-in stagger-2"
        />
      </div>

      {/* Churn Analysis */}
      {churnReasons.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card animate-in stagger-3">
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

          <div className="card animate-in stagger-3">
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
      <div className="card animate-in stagger-4">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          Cohort Retention
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">Cohort</th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">Customers</th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">MRR</th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">Retention</th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">Churn</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort) => (
                <tr key={cohort.cohort} className="border-b border-edge/50">
                  <td className="py-2.5 pr-4 text-sm font-medium text-ink">{cohort.cohort}</td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right text-ink-secondary">{cohort.customers}</td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right text-ink">${cohort.mrr.toLocaleString()}</td>
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

      {/* Pricing Experiments */}
      <div className="animate-in stagger-5">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-accent" />
          Pricing Experiments
        </h3>
        <div className="space-y-5">
          {experiments.map((experiment) => (
            <div key={experiment.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-base font-semibold text-ink truncate">{experiment.name}</h4>
                    <StatusBadge status={experiment.status} />
                  </div>
                  {experiment.hypothesis && (
                    <p className="text-sm text-ink-secondary leading-relaxed">{experiment.hypothesis}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-lg border ${experiment.winner === "A" ? "border-success/30 bg-success/5" : "border-edge bg-surface"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider">Variant A</span>
                    {experiment.winner === "A" && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                  </div>
                  <p className="text-sm font-medium text-ink">{experiment.variant_a.plan}</p>
                  <p className="text-lg font-mono font-semibold text-ink mt-1">
                    ${experiment.variant_a.price}
                    <span className="text-xs text-ink-muted font-normal">/{experiment.variant_a.billing}</span>
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${experiment.winner === "B" ? "border-success/30 bg-success/5" : "border-edge bg-surface"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider">Variant B</span>
                    {experiment.winner === "B" && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                  </div>
                  <p className="text-sm font-medium text-ink">{experiment.variant_b.plan}</p>
                  <p className="text-lg font-mono font-semibold text-ink mt-1">
                    ${experiment.variant_b.price}
                    <span className="text-xs text-ink-muted font-normal">/{experiment.variant_b.billing}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-4 border-t border-edge">
                {experiment.start_date && (
                  <div>
                    <p className="text-2xs text-ink-muted uppercase tracking-wider">Started</p>
                    <p className="text-sm font-mono text-ink-secondary">
                      {new Date(experiment.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                )}
                {experiment.revenue_impact != null && (
                  <div>
                    <p className="text-2xs text-ink-muted uppercase tracking-wider">Revenue Impact</p>
                    <p className={`text-sm font-mono font-semibold ${experiment.revenue_impact >= 0 ? "text-success" : "text-danger"}`}>
                      {experiment.revenue_impact >= 0 ? "+" : ""}{formatCurrency(experiment.revenue_impact)}
                    </p>
                  </div>
                )}
                {experiment.statistical_significance != null && (
                  <div>
                    <p className="text-2xs text-ink-muted uppercase tracking-wider">Significance</p>
                    <p className={`text-sm font-mono font-semibold ${experiment.statistical_significance >= 95 ? "text-success" : "text-warning"}`}>
                      {Number(experiment.statistical_significance).toFixed(1)}%
                    </p>
                  </div>
                )}
                <div className="ml-auto">
                  <WinnerBadge winner={experiment.winner} />
                </div>
              </div>
            </div>
          ))}
          {experiments.length === 0 && (
            <div className="text-center py-8 text-ink-muted text-sm">
              No pricing experiments yet.
            </div>
          )}
        </div>
      </div>

      {/* Features by Retention Impact */}
      {retentionFeatures.length > 0 && (
        <div className="card animate-in stagger-6">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Features by Retention Impact
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-edge">
                  <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">Feature</th>
                  <th className="text-center text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">Status</th>
                  <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">Adoption</th>
                  <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">Retention Impact</th>
                </tr>
              </thead>
              <tbody>
                {retentionFeatures.map((feature) => (
                  <tr key={feature.id} className="border-b border-edge/50">
                    <td className="py-2.5 pr-4">
                      <p className="text-sm font-medium text-ink">{feature.feature_name}</p>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider ${
                        feature.status === "production" ? "bg-success/10 text-success" :
                        feature.status === "beta" ? "bg-warning/10 text-warning" : "bg-accent/10 text-accent"
                      }`}>
                        {feature.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-sm font-mono text-right text-ink-secondary">
                      {feature.adoption_rate != null ? `${Number(feature.adoption_rate).toFixed(0)}%` : "—"}
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
      )}
    </div>
  );
}
