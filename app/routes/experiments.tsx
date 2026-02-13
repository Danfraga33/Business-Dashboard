import { useLoaderData } from "react-router";
import { getPricingExperiments } from "../lib/operations.server";
import type { PricingExperiment } from "../types/dashboard";
import { StatCard } from "../components/StatCard";
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface LoaderData {
  experiments: PricingExperiment[];
}

export async function loader() {
  const experiments = await getPricingExperiments();
  return { experiments };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

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

export default function Experiments() {
  const { experiments } = useLoaderData<LoaderData>();

  const active = experiments.filter((e) => e.status === "active");
  const completed = experiments.filter((e) => e.status === "completed");
  const totalRevenueImpact = completed.reduce(
    (sum, e) => sum + (e.revenue_impact || 0),
    0
  );
  const avgSignificance = completed.length > 0
    ? completed.reduce((sum, e) => sum + (e.statistical_significance || 0), 0) / completed.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">Experiments</h2>
        <p className="text-sm text-ink-muted mt-1">
          Pricing experiments — hypothesis, metrics, and results
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Active Experiments"
          value={active.length.toString()}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Completed"
          value={completed.length.toString()}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Total Revenue Impact"
          value={formatCurrency(totalRevenueImpact)}
          className="animate-in stagger-2"
        />
        <StatCard
          label="Avg Significance"
          value={avgSignificance.toFixed(1) + "%"}
          className="animate-in stagger-2"
        />
      </div>

      {/* Experiment Cards */}
      <div className="space-y-5">
        {experiments.map((experiment, i) => (
          <div
            key={experiment.id}
            className={`card animate-in stagger-${Math.min(i + 3, 6)}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <FlaskConical className="w-4 h-4 text-accent shrink-0" />
                  <h3 className="text-base font-semibold text-ink truncate">
                    {experiment.name}
                  </h3>
                  <StatusBadge status={experiment.status} />
                </div>
                {experiment.hypothesis && (
                  <p className="text-sm text-ink-secondary leading-relaxed">
                    {experiment.hypothesis}
                  </p>
                )}
              </div>
            </div>

            {/* Variants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className={`p-4 rounded-lg border ${
                experiment.winner === "A" ? "border-success/30 bg-success/5" : "border-edge bg-surface"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider">
                    Variant A
                  </span>
                  {experiment.winner === "A" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  )}
                </div>
                <p className="text-sm font-medium text-ink">{experiment.variant_a.plan}</p>
                <p className="text-lg font-mono font-semibold text-ink mt-1">
                  ${experiment.variant_a.price}
                  <span className="text-xs text-ink-muted font-normal">/{experiment.variant_a.billing}</span>
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                experiment.winner === "B" ? "border-success/30 bg-success/5" : "border-edge bg-surface"
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider">
                    Variant B
                  </span>
                  {experiment.winner === "B" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                  )}
                </div>
                <p className="text-sm font-medium text-ink">{experiment.variant_b.plan}</p>
                <p className="text-lg font-mono font-semibold text-ink mt-1">
                  ${experiment.variant_b.price}
                  <span className="text-xs text-ink-muted font-normal">/{experiment.variant_b.billing}</span>
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="flex items-center gap-6 pt-4 border-t border-edge">
              {experiment.start_date && (
                <div>
                  <p className="text-2xs text-ink-muted uppercase tracking-wider">Started</p>
                  <p className="text-sm font-mono text-ink-secondary">
                    {new Date(experiment.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              )}
              {experiment.end_date && (
                <div>
                  <p className="text-2xs text-ink-muted uppercase tracking-wider">Ended</p>
                  <p className="text-sm font-mono text-ink-secondary">
                    {new Date(experiment.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
          <div className="text-center py-12 text-ink-muted text-sm">
            No experiments yet. Create one to start testing pricing hypotheses.
          </div>
        )}
      </div>
    </div>
  );
}
