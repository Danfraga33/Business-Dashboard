import { StatCard } from "../../components/StatCard";
import {
  Filter,
  Target,
  ArrowDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  ChevronRight,
  Lightbulb,
} from "lucide-react";
import SalesFunnelDashboard from "~/components/Funnel-horizonal";
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

// ── Funnel Data ──────────────────────────────────────────────

const funnelStages = [
  {
    name: "Prospects",
    count: 1523,
    description: "Someone aware of you — raw audience",
  },
  {
    name: "Leads",
    count: 456,
    description: "Expressed interest — filled form, clicked CTA",
  },
  {
    name: "MQL",
    count: 182,
    description: "Matches your ICP with engagement signal",
  },
  {
    name: "SQL",
    count: 46,
    description: "Ready for sales conversation — passed qualification",
  },
  {
    name: "Won",
    count: 31,
    description: "Closed customer",
  },
];

// Compute conversion rates between stages
const conversions = funnelStages.slice(1).map((stage, i) => {
  const prev = funnelStages[i];
  const rate = (stage.count / prev.count) * 100;
  const lost = prev.count - stage.count;
  return {
    from: prev.name,
    to: stage.name,
    label: `${prev.name} → ${stage.name}`,
    rate,
    lost,
    fromCount: prev.count,
    toCount: stage.count,
  };
});

// Find the worst conversion (bottleneck)
const bottleneck = conversions.reduce((min, c) =>
  c.rate < min.rate ? c : min,
);

// Health thresholds
function getStageHealth(rate: number): "healthy" | "warning" | "critical" {
  if (rate >= 35) return "healthy";
  if (rate >= 20) return "warning";
  return "critical";
}

const healthColors = {
  healthy: "text-success",
  warning: "text-warning",
  critical: "text-danger",
};

const healthBg = {
  healthy: "bg-success/10 border-success/30",
  warning: "bg-warning/10 border-warning/30",
  critical: "bg-danger/10 border-danger/30",
};

// Per-stage metrics
const stageMetrics = [
  {
    stage: "Prospects → Leads",
    timeInStage: "3.2 days",
    touchpoints: "2.1 avg",
    topSource: "Content/SEO",
    topSourceRate: "38.2%",
    avgDealSize: "—",
  },
  {
    stage: "Leads → MQL",
    timeInStage: "5.8 days",
    touchpoints: "4.3 avg",
    topSource: "Paid Search",
    topSourceRate: "44.1%",
    avgDealSize: "—",
  },
  {
    stage: "MQL → SQL",
    timeInStage: "11.4 days",
    touchpoints: "6.7 avg",
    topSource: "Referrals",
    topSourceRate: "52.3%",
    avgDealSize: "$118/mo",
  },
  {
    stage: "SQL → Won",
    timeInStage: "18.6 days",
    touchpoints: "8.2 avg",
    topSource: "Referrals",
    topSourceRate: "24.8%",
    avgDealSize: "$124/mo",
  },
];

// Win rate by source channel
const sourcePerformance = [
  {
    source: "Content/SEO",
    prospects: 5320,
    won: 128,
    winRate: 2.41,
    cac: 42,
    avgARR: 1092,
  },
  {
    source: "Paid Search",
    prospects: 4280,
    won: 89,
    winRate: 2.08,
    cac: 186,
    avgARR: 1188,
  },
  {
    source: "Social Ads",
    prospects: 3352,
    won: 52,
    winRate: 1.55,
    cac: 224,
    avgARR: 948,
  },
  {
    source: "Referrals",
    prospects: 2282,
    won: 43,
    winRate: 1.88,
    cac: 68,
    avgARR: 1404,
  },
];

// Strategies per stage
const stageStrategies: Record<
  string,
  { diagnosis: string; question: string; strategies: string[] }
> = {
  "Prospects → Leads": {
    diagnosis:
      "29.9% conversion — you're losing 70% of your audience before they even express interest.",
    question:
      "Are you reaching the right people? Low conversion = awareness or positioning problem.",
    strategies: [
      "Audit top-of-funnel content — does it speak to your ICP's pain or just generic topics?",
      "Test stronger CTAs on high-traffic pages (demo vs. free trial vs. lead magnet)",
      "Segment traffic by source — which channels bring the most engaged visitors?",
      "Add exit-intent offers on your highest-traffic landing pages",
    ],
  },
  "Leads → MQL": {
    diagnosis:
      "40.2% conversion — your best-performing stage, but 60% of leads still aren't qualifying.",
    question:
      "Are leads actually qualified? Low = bad lead source or vague ICP definition.",
    strategies: [
      "Tighten lead scoring criteria — are you weighting engagement signals correctly?",
      "Compare MQL rates by lead source to find which channels attract your ICP",
      "Review your ICP definition — is it specific enough to filter noise?",
      "Add progressive profiling to capture qualification data earlier",
    ],
  },
  "MQL → SQL": {
    diagnosis:
      "25.6% conversion — your biggest bottleneck. 75% of qualified leads never reach sales.",
    question:
      "Are MQLs being contacted fast enough? Are they actually sales-ready, or is this a timing/handoff issue?",
    strategies: [
      "Measure speed-to-lead — how fast are MQLs contacted after qualifying?",
      "Implement lead routing automation to reduce handoff lag",
      "Review MQL criteria — are marketing and sales aligned on what 'qualified' means?",
      "Add a nurture sequence for MQLs not yet ready — don't let them go cold",
    ],
  },
  "SQL → Won": {
    diagnosis:
      "17.0% conversion — 83% of sales-ready leads are lost at the closing stage.",
    question:
      "Is this a sales execution problem? Objection handling, pricing friction, or deal size mismatch?",
    strategies: [
      "Analyze lost deals — what are the top 3 objections? Build rebuttals and collateral",
      "Review pricing presentation — are you anchoring value before showing price?",
      "Track deal velocity — are deals stalling at a specific point in the sales cycle?",
      "Compare win rates by deal size — are you qualifying for the right budget range?",
    ],
  },
};

// ── Chart Helpers ────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-[13px] text-muted-foreground mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p
          key={entry.name}
          className="text-[13px] font-mono"
          style={{ color: entry.color }}
        >
          {entry.name}:{" "}
          {typeof entry.value === "number"
            ? entry.value.toLocaleString()
            : entry.value}
        </p>
      ))}
    </div>
  );
}

function formatNumber(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toLocaleString();
}

// ── Components ───────────────────────────────────────────────

function BottleneckAlert() {
  const health = getStageHealth(bottleneck.rate);

  return (
    <div
      className={`border rounded-xl px-5 py-4 animate-in stagger-3 ${healthBg[health]}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Biggest Bottleneck: {bottleneck.label}
          </h4>
          <p className="text-[13px] text-secondary-foreground mt-1">
            Only {bottleneck.rate.toFixed(1)}% of{" "}
            {bottleneck.from === "MQL"
              ? "marketing qualified leads"
              : bottleneck.from.toLowerCase() + "s"}{" "}
            convert to{" "}
            {bottleneck.to === "SQL"
              ? "sales qualified leads"
              : bottleneck.to.toLowerCase()}
            . You're losing{" "}
            <span className="font-mono font-semibold text-danger">
              {bottleneck.lost.toLocaleString()}
            </span>{" "}
            at this stage.
          </p>
        </div>
      </div>
    </div>
  );
}

function StageDeepDive() {
  return (
    <div className="card animate-in stagger-4">
      <h3 className="font-serif font-semibold text-foreground mb-1 flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        Stage-by-Stage Breakdown
      </h3>
      <p className="text-[13px] text-muted-foreground mb-6">
        What's happening at each transition — and what it tells you
      </p>

      <div className="space-y-4">
        {conversions.map((conv) => {
          const health = getStageHealth(conv.rate);
          const isBottleneck = conv.label === bottleneck.label;
          const strategy = stageStrategies[conv.label];

          return (
            <div
              key={conv.label}
              className={`border rounded-xl p-4 transition-colors ${
                isBottleneck ? healthBg.critical : "border-border bg-card/50"
              }`}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground">
                      {conv.from}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">
                      {conv.to}
                    </span>
                  </div>
                  {isBottleneck && (
                    <span className="text-[11px] font-semibold text-danger bg-danger/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Bottleneck
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-lg font-mono font-bold ${healthColors[health]}`}
                  >
                    {conv.rate.toFixed(1)}%
                  </span>
                  {health === "healthy" && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                  {health === "warning" && (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  )}
                  {health === "critical" && (
                    <AlertTriangle className="w-4 h-4 text-danger" />
                  )}
                </div>
              </div>

              {/* Volume flow */}
              <div className="flex items-center gap-2 text-[13px] text-muted-foreground mb-3">
                <span className="font-mono">
                  {conv.fromCount.toLocaleString()}
                </span>
                <ArrowDown className="w-3 h-3" />
                <span className="font-mono">
                  {conv.toCount.toLocaleString()}
                </span>
                <span className="ml-1">
                  ({conv.lost.toLocaleString()} lost)
                </span>
              </div>

              {/* Diagnosis */}
              {strategy && (
                <div className="space-y-3">
                  <p className="text-[13px] text-secondary-foreground">
                    {strategy.diagnosis}
                  </p>
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                    <p className="text-[13px] text-secondary-foreground italic">
                      {strategy.question}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageMetricsTable() {
  return (
    <div className="card animate-in stagger-5">
      <h3 className="font-serif font-semibold text-foreground mb-1 flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        Metrics per Stage
      </h3>
      <p className="text-[13px] text-muted-foreground mb-5">
        Time, velocity, and source quality at each transition
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-muted-foreground font-semibold uppercase tracking-wider pb-3 pr-4">
                Stage
              </th>
              <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                Time in Stage
              </th>
              <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                Touchpoints
              </th>
              <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                Best Source
              </th>
              <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 pl-4">
                Avg Deal Size
              </th>
            </tr>
          </thead>
          <tbody>
            {stageMetrics.map((row) => {
              const isBottleneckRow = row.stage === bottleneck.label;
              return (
                <tr
                  key={row.stage}
                  className={`border-b border-border/50 ${
                    isBottleneckRow ? "bg-danger/5" : ""
                  }`}
                >
                  <td className="py-3 pr-4 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {row.stage}
                      {isBottleneckRow && (
                        <AlertTriangle className="w-3 h-3 text-danger" />
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-secondary-foreground">
                    {row.timeInStage}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-secondary-foreground">
                    {row.touchpoints}
                  </td>
                  <td className="py-3 px-4 text-right text-secondary-foreground">
                    {row.topSource}{" "}
                    <span className="font-mono text-primary">
                      ({row.topSourceRate})
                    </span>
                  </td>
                  <td className="py-3 pl-4 text-right font-mono text-secondary-foreground">
                    {row.avgDealSize}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SourceQuality() {
  return (
    <div className="card animate-in stagger-6">
      <h3 className="font-serif font-semibold text-foreground mb-1 flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        CAC by Channel
      </h3>
      <p className="text-[13px] text-muted-foreground mb-5">
        Which channels produce leads that actually close — volume vs. quality
      </p>

      <div className="h-64 sm:h-72 md:h-80 lg:h-96 mb-6 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sourcePerformance}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="source"
              tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="cac" name="CAC" radius={[4, 4, 0, 0]}>
              {sourcePerformance.map((entry, index) => (
                <Cell
                  key={entry.source}
                  fill={
                    entry.cac < 100
                      ? "var(--color-success)"
                      : entry.cac < 200
                        ? "var(--color-warning)"
                        : "var(--color-danger)"
                  }
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-muted-foreground font-semibold uppercase tracking-wider pb-3 pr-4">
                Channel
              </th>
              <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                Prospects
              </th>
              <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                Won
              </th>
              <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                Win Rate
              </th>
              <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 px-4">
                CAC
              </th>
              <th className="text-right text-muted-foreground font-semibold uppercase tracking-wider pb-3 pl-4">
                Avg ARR
              </th>
            </tr>
          </thead>
          <tbody>
            {[...sourcePerformance]
              .sort((a, b) => a.cac - b.cac)
              .map((row) => (
                <tr key={row.source} className="border-b border-border/50">
                  <td className="py-3 pr-4 font-medium text-foreground">
                    {row.source}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-secondary-foreground">
                    {row.prospects.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-secondary-foreground">
                    {row.won}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-primary">
                    {row.winRate.toFixed(2)}%
                  </td>
                  <td className={`py-3 px-4 text-right font-mono font-semibold ${
                    row.cac < 100 ? "text-success" : row.cac < 200 ? "text-warning" : "text-danger"
                  }`}>
                    ${row.cac}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono text-secondary-foreground">
                    ${row.avgARR.toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Strategies() {
  return (
    <div className="card animate-in stagger-7">
      <h3 className="font-serif font-semibold text-foreground mb-1 flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-primary" />
        Action Plan by Stage
      </h3>
      <p className="text-[13px] text-muted-foreground mb-6">
        Prioritized strategies — start with the biggest bottleneck
      </p>

      <div className="space-y-5">
        {[...conversions]
          .sort((a, b) => a.rate - b.rate)
          .map((conv) => {
            const health = getStageHealth(conv.rate);
            const strategy = stageStrategies[conv.label];
            if (!strategy) return null;

            return (
              <div key={conv.label}>
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      health === "healthy"
                        ? "bg-success"
                        : health === "warning"
                          ? "bg-warning"
                          : "bg-danger"
                    }`}
                  />
                  <h4 className="text-sm font-semibold text-foreground">
                    {conv.label}
                  </h4>
                  <span className={`text-[13px] font-mono ${healthColors[health]}`}>
                    {conv.rate.toFixed(1)}%
                  </span>
                </div>
                <ul className="space-y-1.5 ml-4">
                  {strategy.strategies.map((s, i) => (
                    <li
                      key={i}
                      className="text-[13px] text-secondary-foreground flex items-start gap-2"
                    >
                      <span className="text-muted-foreground mt-0.5 shrink-0">
                        {i + 1}.
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function ConversionFunnel() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="font-serif text-2xl font-semibold text-foreground leading-tight">
          Conversion Funnel
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Sales funnel, conversion rates, and CAC by channel
        </p>
      </div>

      {/* Top-line stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          label="Total Prospects"
          value={formatNumber(funnelStages[0].count)}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Deals Won"
          value={formatNumber(funnelStages[4].count)}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Full-Funnel Rate"
          value={`${((funnelStages[4].count / funnelStages[0].count) * 100).toFixed(1)}%`}
          className="animate-in stagger-1"
        />
        <StatCard
          label="Worst Stage"
          value={`${bottleneck.rate.toFixed(1)}%`}
          changeLabel={bottleneck.label}
          className="animate-in stagger-1"
        />
      </div>

      <SalesFunnelDashboard />

      {/* Bottleneck alert */}
      <BottleneckAlert />

      {/* Stage-by-stage deep dive */}
      <StageDeepDive />

      {/* Per-stage metrics table */}
      <StageMetricsTable />

      {/* CAC by channel */}
      <SourceQuality />

      {/* Action plan */}
      <Strategies />
    </div>
  );
}
