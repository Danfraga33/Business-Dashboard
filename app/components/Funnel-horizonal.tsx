import { ConversionMetric } from "./Conversion-metrics"
import { FunnelFlow } from "./Funnel-flow"
import { FunnelHeader } from "./Funnel-Header"
import { FunnelLegend } from "./Funnel-Legend"


import { StageMetrics } from "./Stage-metrics"

// Data matching gtm.tsx funnel stages
const funnelStagesData = [
  { name: "Prospects", count: 1523 },
  { name: "Leads", count: 456 },
  { name: "MQL", count: 182 },
  { name: "SQL", count: 46 },
  { name: "Won", count: 31 },
]

// Compute hot/warm/cold breakdown (simplified distribution for viz)
const funnelStages = funnelStagesData.map((stage) => ({
  name: stage.name,
  total: stage.count,
  hot: Math.round(stage.count * 0.28), // ~28% hot
  warm: Math.round(stage.count * 0.32), // ~32% warm
  cold: Math.round(stage.count * 0.40), // ~40% cold
}))

// Compute conversion metrics between stages
const conversions = funnelStagesData.slice(1).map((stage, i) => {
  const prev = funnelStagesData[i]
  const rate = ((stage.count / prev.count) * 100).toFixed(0)
  return {
    from: prev.name,
    to: stage.name,
    rate: `${rate}%`,
  }
})

// Stage metrics with real conversion rates
const stageMetrics = funnelStagesData.map((stage, i) => {
  const conversionRate = i === 0 ? 100 : ((stage.count / funnelStagesData[0].count) * 100).toFixed(0)
  const trend = (i % 2 === 0 ? "up" : "down") as "up" | "down"
  return {
    name: stage.name,
    count: stage.count,
    conversionRate: Number(conversionRate),
    trend,
    trendValue: i % 2 === 0 ? "+5%" : "-2%",
  }
})

export default function SalesFunnelDashboard() {
  return (
    <main className="flex flex-col bg-background">
      <div className="flex w-full flex-col gap-6">
        {/* Header */}
        <FunnelHeader />

        {/* Top Stats */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
              {funnelStages[0].total.toLocaleString()}
            </h1>
            <p className="mt-1 text-sm text-ink-muted">Total Prospects</p>
          </div>
        </div>

        {/* Main Funnel Visualization */}
        <div className="relative overflow-hidden rounded-2xl border border-edge bg-card">
          {/* Conversion Metrics Overlay - only show on extra large screens */}
          <div className="absolute inset-x-0 top-0 z-10 hidden items-start justify-around px-12 pt-6 pointer-events-none 2xl:flex">
            <div />
            <ConversionMetric
              label="Prospect to Lead"
              rate={conversions[0].rate}
              change="+8%"
              changeLabel="vs last year"
            />
            <ConversionMetric
              label="Lead to MQL"
              rate={conversions[1].rate}
              change="+5%"
              changeLabel="vs last year"
            />
            <ConversionMetric
              label="MQL to SQL"
              rate={conversions[2].rate}
              change="-2%"
              changeLabel="vs last year"
            />
            <ConversionMetric
              label="SQL to Won"
              rate={conversions[3].rate}
              change="+6%"
              changeLabel="vs last year"
            />
          </div>

          {/* Funnel Flow Chart - responsive height */}
          <div className="h-[300px] w-full pt-4 sm:h-[360px] md:h-[420px] lg:h-[480px]">
            <FunnelFlow stages={funnelStages} />
          </div>

          {/* Legend */}
          <div className="border-t border-edge px-4 py-3 sm:px-6 sm:py-4">
            <FunnelLegend />
          </div>
        </div>

        {/* Stage Metrics Cards - responsive grid */}
        <div className="block lg:hidden">
          <StageMetrics metrics={stageMetrics} />
        </div>
      </div>
    </main>
  )
}
