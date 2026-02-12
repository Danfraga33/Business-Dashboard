import { useLoaderData } from "react-router";
import { getChannelPerformance, type ChannelPerformance } from "../lib/marketing.server";
import { StatCard } from "../components/StatCard";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, PieChartIcon } from "lucide-react";

const COLORS = ["#059669", "#2563EB", "#8B5CF6", "#D97706", "#EC4899", "#6366F1"];

interface LoaderData {
  organicChannels: ChannelPerformance[];
}

export async function loader() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const organicChannels = await getChannelPerformance(startDate, endDate, "organic");

  return { organicChannels };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-surface border border-edge rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-ink mb-1">{data.name}</p>
      <p className="text-xs font-mono text-ink-secondary">
        {data.value.toLocaleString()} signups
      </p>
    </div>
  );
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

export default function MarketingOrganic() {
  const { organicChannels } = useLoaderData<LoaderData>();

  const totalSignups = organicChannels.reduce((sum, ch) => sum + ch.signups, 0);
  const totalConversions = organicChannels.reduce((sum, ch) => sum + ch.conversions, 0);
  const conversionRate = totalSignups > 0 ? (totalConversions / totalSignups) * 100 : 0;
  const organicRevenue = organicChannels.reduce((sum, ch) => sum + ch.revenue, 0);

  const pieData = organicChannels.map((ch) => ({
    name: ch.channel_name,
    value: ch.signups,
  }));

  const barData = organicChannels.map((ch) => ({
    name: ch.channel_name,
    Signups: ch.signups,
    Conversions: ch.conversions,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Organic Channels
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Unpaid acquisition and engagement metrics — last 30 days
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Total Signups"
          value={totalSignups.toLocaleString()}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Total Conversions"
          value={totalConversions.toLocaleString()}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Conversion Rate"
          value={`${conversionRate.toFixed(2)}%`}
          className="animate-in stagger-2"
        />
        <StatCard
          label="Organic Revenue"
          value={formatCurrency(organicRevenue)}
          className="animate-in stagger-2"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Signups Distribution */}
        <div className="card animate-in stagger-3">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-success" />
            Signups Distribution
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-2xs text-ink-muted">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signups vs Conversions */}
        <div className="card animate-in stagger-4">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            Signups vs Conversions
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
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
      </div>

      {/* Table */}
      <div className="card animate-in stagger-5">
        <h3 className="text-base font-semibold text-ink mb-5">
          Organic Channels Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                  Channel
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Clicks
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  CTR
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Signups
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Conv.
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Conv. Rate
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {organicChannels.map((channel) => {
                const chConvRate =
                  channel.signups > 0
                    ? (channel.conversions / channel.signups) * 100
                    : 0;
                return (
                  <tr
                    key={channel.channel_name}
                    className="border-b border-edge/50"
                  >
                    <td className="py-3 pr-4 text-sm font-medium text-ink">
                      {channel.channel_name}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-right text-ink-secondary">
                      {channel.clicks.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-right text-ink-secondary">
                      {channel.ctr.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-right text-ink-secondary">
                      {channel.signups.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-right text-ink-secondary">
                      {channel.conversions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-right text-ink-secondary">
                      {chConvRate.toFixed(2)}%
                    </td>
                    <td className="py-3 pl-4 text-sm font-mono text-right font-semibold text-ink">
                      {formatCurrency(channel.revenue)}
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
