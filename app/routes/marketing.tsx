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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart3, PieChartIcon } from "lucide-react";

const COLORS = [
  "#2563EB",
  "#8B5CF6",
  "#EC4899",
  "#D97706",
  "#059669",
  "#6366F1",
  "#14B8A6",
  "#F97316",
];

interface LoaderData {
  metrics: MarketingMetrics;
  channelPerformance: ChannelPerformance[];
}

export async function loader() {
  const endDate = new Date();
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [metrics, channelPerformance] = await Promise.all([
    getMarketingMetrics(startDate, endDate),
    getChannelPerformance(startDate, endDate),
  ]);

  return { metrics, channelPerformance };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-edge rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-ink-muted mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p
          key={entry.name}
          className="text-xs font-mono"
          style={{ color: entry.color }}
        >
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-surface border border-edge rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-ink mb-1">{data.name}</p>
      <p className="text-xs font-mono text-ink-secondary">
        {formatCurrency(data.value)}
      </p>
    </div>
  );
}

export default function MarketingOverview() {
  const { metrics, channelPerformance } = useLoaderData<LoaderData>();

  const top8Channels = channelPerformance.slice(0, 8);

  const barChartData = top8Channels.map((channel) => ({
    name: channel.channel_name,
    Conversions: channel.conversions,
    Signups: channel.signups,
  }));

  const pieChartData = channelPerformance.map((channel, index) => ({
    name: channel.channel_name,
    value: channel.spend,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Marketing Overview
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Performance across all channels — last 30 days
        </p>
      </div>

      {/* Metrics */}
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
          value={metrics.totalSignups.toLocaleString()}
          className="animate-in stagger-2"
        />
        <StatCard
          label="Conversion Rate"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          className="animate-in stagger-2"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Channel Performance */}
        <div className="card animate-in stagger-3">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            Channel Performance
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-edge)"
              />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: "#78716C", fontSize: 11 }}
                axisLine={{ stroke: "var(--color-edge)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#78716C", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="Signups" fill="#2563EB" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Conversions" fill="#059669" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spend Distribution */}
        <div className="card animate-in stagger-4">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-[#8B5CF6]" />
            Spend Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
            {pieChartData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-2xs text-ink-muted">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Channels Table */}
      <div className="card animate-in stagger-5">
        <h3 className="text-base font-semibold text-ink mb-5">
          All Channels
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                  Channel
                </th>
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Type
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Spend
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Signups
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Conversions
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  CAC
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody>
              {channelPerformance.map((channel) => (
                <tr
                  key={channel.channel_name}
                  className="border-b border-edge/50"
                >
                  <td className="py-3 pr-4 text-sm font-medium text-ink">
                    {channel.channel_name}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold uppercase tracking-wider ${
                        channel.channel_type === "paid"
                          ? "bg-accent/10 text-accent"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {channel.channel_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-right text-ink-secondary">
                    {formatCurrency(channel.spend)}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-right text-ink-secondary">
                    {channel.signups.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-right text-ink-secondary">
                    {channel.conversions.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-right text-ink-secondary">
                    {formatCurrency(channel.cac)}
                  </td>
                  <td className="py-3 pl-4 text-sm font-mono text-right font-semibold text-ink">
                    {channel.roas.toFixed(2)}x
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
