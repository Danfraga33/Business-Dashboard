import { StatCard } from "../components/StatCard";
import { HealthIndicator } from "../components/HealthIndicator";
import { SparklineChart } from "../components/SparklineChart";
import { businesses, aggregateMetrics } from "../data/portfolio";
import { TrendingUp, TrendingDown } from "lucide-react";

function BusinessCard({ business }: { business: (typeof businesses)[0] }) {
  const mrrChange =
    ((business.metrics.mrr - business.metrics.mrrPrevious) /
      business.metrics.mrrPrevious) *
    100;
  const churnDelta = business.metrics.churn - business.metrics.churnPrevious;

  return (
    <div className="card group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <HealthIndicator status={business.status} />
            <h3 className="text-base font-semibold text-ink">
              {business.name}
            </h3>
          </div>
          <p className="text-xs text-ink-muted">{business.description}</p>
        </div>
        <span className="text-2xs font-mono text-ink-muted bg-base/50 px-2 py-1 rounded-md">
          Acq. {new Date(business.acquiredDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
        </span>
      </div>

      {/* Sparkline */}
      <div className="mb-4 -mx-1">
        <SparklineChart data={business.sparkline} color="auto" height={48} />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xs font-medium text-ink-muted uppercase tracking-wider mb-1">
            MRR
          </p>
          <p className="metric-value text-lg text-ink">
            ${business.metrics.mrr.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {mrrChange >= 0 ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : (
              <TrendingDown className="w-3 h-3 text-danger" />
            )}
            <span
              className={`text-2xs font-mono font-medium ${
                mrrChange >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {mrrChange >= 0 ? "+" : ""}
              {mrrChange.toFixed(1)}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-2xs font-medium text-ink-muted uppercase tracking-wider mb-1">
            Churn
          </p>
          <p className="metric-value text-lg text-ink">
            {business.metrics.churn}%
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {churnDelta <= 0 ? (
              <TrendingDown className="w-3 h-3 text-success" />
            ) : (
              <TrendingUp className="w-3 h-3 text-danger" />
            )}
            <span
              className={`text-2xs font-mono font-medium ${
                churnDelta <= 0 ? "text-success" : "text-danger"
              }`}
            >
              {churnDelta > 0 ? "+" : ""}
              {churnDelta.toFixed(1)}pp
            </span>
          </div>
        </div>
        <div>
          <p className="text-2xs font-medium text-ink-muted uppercase tracking-wider mb-1">
            Customers
          </p>
          <p className="metric-value text-lg text-ink">
            {business.metrics.customers}
          </p>
        </div>
        <div>
          <p className="text-2xs font-medium text-ink-muted uppercase tracking-wider mb-1">
            LTV / CAC
          </p>
          <p className="metric-value text-lg text-ink">
            {(business.metrics.ltv / business.metrics.cac).toFixed(1)}x
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Portfolio() {
  const mrrChange =
    ((aggregateMetrics.totalMRR - aggregateMetrics.totalMRRPrevious) /
      aggregateMetrics.totalMRRPrevious) *
    100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Portfolio Overview
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          {businesses.length} acquired businesses
        </p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total MRR"
          value={aggregateMetrics.totalMRR.toLocaleString()}
          prefix="$"
          change={mrrChange}
          changeLabel="vs last month"
          className="animate-in stagger-1"
        />
        <StatCard
          label="Monthly Burn"
          value={aggregateMetrics.burnRate.toLocaleString()}
          prefix="$"
          className="animate-in stagger-2"
        />
        <StatCard
          label="Runway"
          value={`${aggregateMetrics.runway} mo`}
          className="animate-in stagger-3"
        />
        <StatCard
          label="Active Deals"
          value={aggregateMetrics.activeDeals.toString()}
          className="animate-in stagger-4"
        />
      </div>

      {/* Business Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {businesses.map((business, i) => (
          <div key={business.id} className={`animate-in stagger-${Math.min(i + 3, 6)}`}>
            <BusinessCard business={business} />
          </div>
        ))}
      </div>
    </div>
  );
}
