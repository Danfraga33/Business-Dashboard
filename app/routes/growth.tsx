import { useLoaderData } from "react-router";
import {
  getMarketingMetrics,
  getChannelPerformance,
  type MarketingMetrics,
  type ChannelPerformance,
} from "../lib/marketing.server";
import { StatCard } from "../components/StatCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Users,
  MousePointerClick,
  ArrowRight,
} from "lucide-react";

interface LoaderData {
  metrics: MarketingMetrics;
  channels: ChannelPerformance[];
}

export async function loader() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [metrics, channels] = await Promise.all([
    getMarketingMetrics(thirtyDaysAgo),
    getChannelPerformance(thirtyDaysAgo),
  ]);

  return { metrics, channels };
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

const CHANNEL_COLORS = [
  "#2563EB", "#059669", "#D97706", "#DC2626", "#7C3AED",
  "#0891B2", "#DB2777", "#65A30D",
];

export default function Growth() {
  const { metrics, channels } = useLoaderData<LoaderData>();

  const totalImpressions = channels.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = channels.reduce((sum, c) => sum + c.clicks, 0);
  const totalLeads = channels.reduce((sum, c) => sum + c.leads, 0);

  // Funnel data
  const funnelSteps = [
    { stage: "Impressions", value: totalImpressions },
    { stage: "Clicks", value: totalClicks },
    { stage: "Leads", value: totalLeads },
    { stage: "Signups", value: metrics.totalSignups },
    { stage: "Conversions", value: metrics.totalConversions },
  ];

  // Channel spend chart data
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
        <h2 className="text-2xl font-semibold text-ink leading-tight">Growth</h2>
        <p className="text-sm text-ink-muted mt-1">
          Acquisition channels, spend efficiency, and funnel performance — last 30 days
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
          label="Blended CAC"
          value={formatCurrency(metrics.blendedCAC)}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Total Signups"
          value={formatNumber(metrics.totalSignups)}
          className="animate-in stagger-2"
        />
        <StatCard
          label="ROAS"
          value={metrics.roas.toFixed(2) + "x"}
          className="animate-in stagger-2"
        />
      </div>

      {/* Sales Funnel */}
      <div className="card animate-in stagger-3">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-accent" />
          Acquisition Funnel
        </h3>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {funnelSteps.map((step, i) => {
            const prevValue = i > 0 ? funnelSteps[i - 1].value : step.value;
            const convRate = prevValue > 0 ? (step.value / prevValue) * 100 : 0;

            return (
              <div key={step.stage} className="flex items-center gap-2 flex-1 min-w-0">
                {i > 0 && (
                  <div className="flex flex-col items-center shrink-0">
                    <ArrowRight className="w-4 h-4 text-ink-muted" />
                    <span className="text-2xs text-ink-muted font-mono">{convRate.toFixed(1)}%</span>
                  </div>
                )}
                <div className="flex-1 text-center p-3 rounded-lg bg-surface border border-edge min-w-[100px]">
                  <p className="text-2xs font-medium text-ink-muted uppercase tracking-wider mb-1">
                    {step.stage}
                  </p>
                  <p className="text-lg font-mono font-semibold text-ink">
                    {formatNumber(step.value)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spend by Channel Chart */}
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

      {/* Channel Performance Table */}
      <div className="card animate-in stagger-5">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" />
          Channel Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                  Channel
                </th>
                <th className="text-center text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-2">
                  Type
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-2">
                  Spend
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-2">
                  Signups
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-2">
                  CAC
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-2">
                  ROAS
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-2">
                  CTR
                </th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel, i) => (
                <tr key={channel.channel_name} className="border-b border-edge/50">
                  <td className="py-2.5 pr-4 text-sm font-medium text-ink">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }}
                      />
                      {channel.channel_name}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider ${
                      channel.channel_type === "paid"
                        ? "bg-warning/10 text-warning"
                        : "bg-success/10 text-success"
                    }`}>
                      {channel.channel_type}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-sm font-mono text-right text-ink">
                    {formatCurrency(channel.spend)}
                  </td>
                  <td className="py-2.5 px-2 text-sm font-mono text-right text-ink-secondary">
                    {formatNumber(channel.signups)}
                  </td>
                  <td className={`py-2.5 px-2 text-sm font-mono text-right ${
                    channel.cac > 0 && channel.cac < 100 ? "text-success" : channel.cac > 200 ? "text-danger" : "text-ink-secondary"
                  }`}>
                    {channel.cac > 0 ? formatCurrency(channel.cac) : "—"}
                  </td>
                  <td className={`py-2.5 px-2 text-sm font-mono text-right ${
                    channel.roas >= 3 ? "text-success font-semibold" : channel.roas >= 1 ? "text-ink" : "text-danger"
                  }`}>
                    {channel.roas > 0 ? channel.roas.toFixed(2) + "x" : "—"}
                  </td>
                  <td className="py-2.5 pl-2 text-sm font-mono text-right text-ink-secondary">
                    {channel.ctr.toFixed(2)}%
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
