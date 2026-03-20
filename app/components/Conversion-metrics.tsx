import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface ConversionMetricProps {
  label: string
  rate: string
  change: string
  changeLabel: string
}

export function ConversionMetric({ label, rate, change, changeLabel }: ConversionMetricProps) {
  const isPositive = change.startsWith("+")
  const isNegative = change.startsWith("-")

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold tracking-tight text-foreground 2xl:text-2xl">{rate}</span>
        {isPositive && (
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-success 2xl:text-[13px]">
            <ArrowUpRight className="h-2.5 w-2.5 2xl:h-3 2xl:w-3" />
            {change}
          </span>
        )}
        {isNegative && (
          <span className="flex items-center gap-0.5 text-[11px] font-semibold text-danger 2xl:text-[13px]">
            <ArrowDownRight className="h-2.5 w-2.5 2xl:h-3 2xl:w-3" />
            {change}
          </span>
        )}
      </div>
      <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground 2xl:text-[10px]">{label}</span>
      <span className="text-[8px] text-muted-foreground 2xl:text-[9px]">{changeLabel}</span>
    </div>
  )
}
