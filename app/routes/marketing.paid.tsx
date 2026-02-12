import { useLoaderData } from "react-router";
import {
  getMarketingMetrics,
  getChannelPerformance,
  type MarketingMetrics,
  type ChannelPerformance,
} from "../lib/marketing.server";
import { StatCard } from "../components/StatCard";
import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { DollarSign, Target, TrendingUp } from "lucide-react";

interface LoaderData {
  metrics: MarketingMetrics;
  paidChannels: ChannelPerformance[];
}

export async function loader() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const [metrics, paidChannels] = await Promise.all([
    getMarketingMetrics(startDate, endDate),
    getChannelPerformance(startDate, endDate, "paid"),
  ]);

  return { metrics, paidChannels };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function ScatterTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-surface border border-edge rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-ink mb-1.5">{data.name}</p>
      <p className="text-xs font-mono text-ink-secondary">
        Spend: {formatCurrency(data.x)}
      </p>
      <p className="text-xs font-mono text-ink-secondary">
        Conversions: {data.y.toLocaleString()}
      </p>
      <p className="text-xs font-mono text-ink-secondary">
        CAC: {formatCurrency(data.z)}
      </p>
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
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
          {entry.name}:{" "}
          {entry.name === "CAC"
            ? formatCurrency(entry.value)
            : `${entry.value.toFixed(2)}x`}
        </p>
      ))}
    </div>
  );
}

export default function MarketingPaid() {
  const { metrics, paidChannels } = useLoaderData<LoaderData>();

  const paidSpend = paidChannels.reduce((sum, ch) => sum + ch.spend, 0);
  const paidSignups = paidChannels.reduce((sum, ch) => sum + ch.signups, 0);
  const paidConversions = paidChannels.reduce(
    (sum, ch) => sum + ch.conversions,
    0
  );
  const paidCAC = paidConversions > 0 ? paidSpend / paidConversions : 0;

  const scatterData = paidChannels.map((ch) => ({
    x: ch.spend,
    y: ch.conversions,
    z: ch.cac,
    name: ch.channel_name,
  }));

  const cacData = paidChannels.map((ch) => ({
    name: ch.channel_name,
    CAC: ch.cac,
  }));

  const roasData = paidChannels.map((ch) => ({
    name: ch.channel_name,
    ROAS: ch.roas,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Paid Channels
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Spend efficiency and acquisition metrics — last 30 days
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          label="Paid Spend"
          value={formatCurrency(paidSpend)}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Paid CAC"
          value={formatCurrency(paidCAC)}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Paid Signups"
          value={paidSignups.toLocaleString()}
          className="animate-in stagger-2"
        />
        <StatCard
          label="Paid Conversions"
          value={paidConversions.toLocaleString()}
          className="animate-in stagger-2"
        />
      </div>

      {/* Scatter Plot */}
      <div className="card animate-in stagger-3">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" />
          Spend vs Conversions
        </h3>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-edge)"
            />
            <XAxis
              type="number"
              dataKey="x"
              name="Spend"
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fill: "#78716C", fontSize: 11 }}
              axisLine={{ stroke: "var(--color-edge)" }}
              tickLine={false}
              label={{
                value: "Spend",
                position: "insideBottom",
                offset: -10,
                style: { fill: "#78716C", fontSize: 11 },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Conversions"
              tick={{ fill: "#78716C", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: "Conversions",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#78716C", fontSize: 11 },
              }}
            />
            <ZAxis type="number" dataKey="z" range={[50, 400]} name="CAC" />
            <Tooltip content={<ScatterTooltip />} />
            <Scatter name="Channels" data={scatterData} fill="#2563EB" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* CAC + ROAS Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CAC by Channel */}
        <div className="card animate-in stagger-4">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-danger" />
            CAC by Channel
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cacData}>
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
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="CAC" fill="#DC2626" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ROAS by Channel */}
        <div className="card animate-in stagger-5">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            ROAS by Channel
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={roasData}>
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
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="ROAS" fill="#059669" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="card animate-in stagger-6">
        <h3 className="text-base font-semibold text-ink mb-5">
          Paid Channels Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pr-4">
                  Channel
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 px-4">
                  Spend
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
                  CAC
                </th>
                <th className="text-right text-2xs font-semibold text-ink-muted uppercase tracking-wider pb-3 pl-4">
                  ROAS
                </th>
              </tr>
            </thead>
            <tbody>
              {paidChannels.map((channel) => (
                <tr
                  key={channel.channel_name}
                  className="border-b border-edge/50"
                >
                  <td className="py-3 pr-4 text-sm font-medium text-ink">
                    {channel.channel_name}
                  </td>
                  <td className="py-3 px-4 text-sm font-mono text-right text-ink-secondary">
                    {formatCurrency(channel.spend)}
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
