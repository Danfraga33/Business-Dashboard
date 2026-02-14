
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StageMetric {
  name: string
  count: number
  conversionRate: number
  trend: "up" | "down" | "flat"
  trendValue: string
}

interface StageMetricsProps {
  metrics: StageMetric[]
}

export function StageMetrics({ metrics }: StageMetricsProps) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-secondary"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {metric.name}
            </span>
            {metric.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-accent" />}
            {metric.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
            {metric.trend === "flat" && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold tracking-tight text-card-foreground">
              {metric.count.toLocaleString()}
            </span>
            <span
              className={`text-xs font-semibold ${
                metric.trend === "up"
                  ? "text-accent"
                  : metric.trend === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {metric.trendValue}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${metric.conversionRate}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">{metric.conversionRate}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}
