import { useLoaderData } from "react-router";
import {
  getMarketingMetrics,
  getChannelPerformance,
  type MarketingMetrics,
  type ChannelPerformance,
} from "../../lib/marketing.server";
import { getLatestSaasMetrics } from "../../lib/data.server";
import { getFeatureRollouts } from "../../lib/operations.server";
import type { SaasMetrics, FeatureRollout } from "../../types/dashboard";
import { StatCard } from "../../components/StatCard";
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
  Sparkles,
  Rocket,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface LoaderData {
  metrics: MarketingMetrics;
  channels: ChannelPerformance[];
  features: FeatureRollout[];
  latestSaas: SaasMetrics | null;
}

export async function loader() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [metrics, channels, features, latestSaas] = await Promise.all([
    getMarketingMetrics(thirtyDaysAgo),
    getChannelPerformance(thirtyDaysAgo),
    getFeatureRollouts(),
    getLatestSaasMetrics(),
  ]);

  return { metrics, channels, features, latestSaas };
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

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function AcquisitionExpansion() {
  const { metrics, channels, features, latestSaas } = useLoaderData<LoaderData>();

  const avgAdoption = features.filter((f) => f.adoption_rate != null).length > 0
    ? features.filter((f) => f.adoption_rate != null).reduce((sum, f) => sum + (f.adoption_rate ?? 0), 0) /
      features.filter((f) => f.adoption_rate != null).length
    : 0;

  // Spend vs Revenue by Channel
  const spendData = channels
    .filter((c) => c.spend > 0)
    .map((c) => ({
      name: c.channel_name,
      spend: c.spend,
      revenue: c.revenue,
    }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Tier 3 — Scale</span>
        </div>
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Acquisition & Expansion
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Acquisition channels, expansion revenue, and growth levers — last 30 days
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Spend"
          value={formatCurrency(metrics.totalSpend)}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Total Signups"
          value={formatNumber(metrics.totalSignups)}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Net Revenue Retention"
          value={latestSaas ? Number(latestSaas.nrr).toFixed(1) + "%" : "—"}
          className="animate-in stagger-2"
        />
        <StatCard
          label="Avg Feature Adoption"
          value={avgAdoption.toFixed(0) + "%"}
          className="animate-in stagger-2"
        />
      </div>

      {/* NRR Health Gauge */}
      {latestSaas && (
        <div className="card animate-in stagger-3">
          <h3 className="text-base font-semibold text-ink mb-4 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-accent" />
            Net Revenue Retention
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-mono font-semibold ${
              Number(latestSaas.nrr) >= 110 ? "text-success" : Number(latestSaas.nrr) >= 100 ? "text-warning" : "text-danger"
            }`}>
              {Number(latestSaas.nrr).toFixed(1)}%
            </span>
          </div>
          <div className={`inline-flex items-center gap-1.5 mt-3 px-2 py-0.5 rounded-full text-2xs font-medium ${
            Number(latestSaas.nrr) >= 110 ? "bg-success/10 text-success" : Number(latestSaas.nrr) >= 100 ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"
          }`}>
            {Number(latestSaas.nrr) >= 110 ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <AlertTriangle className="w-3 h-3" />
            )}
            Target: &gt;110%
          </div>
          <p className="text-xs text-ink-muted mt-2">
            {Number(latestSaas.nrr) >= 110
              ? "Expansion revenue exceeds churn — healthy growth dynamics"
              : Number(latestSaas.nrr) >= 100
              ? "Revenue stable but limited expansion — optimize upsell paths"
              : "Revenue contracting — prioritize retention before scaling acquisition"}
          </p>
        </div>
      )}

      {/* Spend vs Revenue by Channel */}
      {spendData.length > 0 && (
        <div className="card animate-in stagger-4">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-warning" />
            Spend vs Revenue by Channel
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={spendData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
              <XAxis
                type="number"
                tick={{ fill: "#78716C", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "#78716C", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="spend" fill="#EF4444" radius={[0, 3, 3, 0]} name="Spend" />
              <Bar dataKey="revenue" fill="#059669" radius={[0, 3, 3, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Channel Acquisition Table */}
      <div className="card animate-in stagger-5">
        <h3 className="text-base font-semibold text-ink mb-5">Channel Acquisition</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">Channel</th>
                <th className="text-center text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">Type</th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">Spend</th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">Signups</th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">Revenue</th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">ROAS</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel) => (
                <tr key={channel.channel_name} className="border-b border-edge/50">
                  <td className="py-2.5 pr-4 text-sm font-medium text-ink">{channel.channel_name}</td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider ${
                      channel.channel_type === "paid" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                    }`}>
                      {channel.channel_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right text-ink">{formatCurrency(channel.spend)}</td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right text-ink-secondary">{formatNumber(channel.signups)}</td>
                  <td className="py-2.5 px-4 text-sm font-mono text-right text-ink">{formatCurrency(channel.revenue)}</td>
                  <td className={`py-2.5 pl-4 text-sm font-mono text-right ${
                    channel.roas >= 3 ? "text-success font-semibold" : channel.roas >= 1 ? "text-ink" : "text-danger"
                  }`}>
                    {channel.roas > 0 ? channel.roas.toFixed(2) + "x" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Rollouts for Expansion */}
      <div className="card animate-in stagger-6">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          Feature Rollouts — Expansion Levers
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">Feature</th>
                <th className="text-center text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">Status</th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">Adoption</th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature) => (
                <tr key={feature.id} className="border-b border-edge/50">
                  <td className="py-2.5 pr-4">
                    <p className="text-sm font-medium text-ink">{feature.feature_name}</p>
                    {feature.description && (
                      <p className="text-xs text-ink-muted mt-0.5 truncate max-w-xs">{feature.description}</p>
                    )}
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
                    <span className={
                      (feature.engagement_score ?? 0) >= 70 ? "text-success" :
                      (feature.engagement_score ?? 0) >= 40 ? "text-warning" : "text-ink-secondary"
                    }>
                      {feature.engagement_score != null ? `${feature.engagement_score}/100` : "—"}
                    </span>
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
