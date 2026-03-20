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
        <span className="text-2xl font-bold tracking-tight text-foreground 2xl:text-3xl">{rate}</span>
        {isPositive && (
          <span className="flex items-center gap-0.5 text-[13px] font-semibold text-success 2xl:text-[15px]">
            <ArrowUpRight className="h-2.5 w-2.5 2xl:h-3 2xl:w-3" />
            {change}
          </span>
        )}
        {isNegative && (
          <span className="flex items-center gap-0.5 text-[13px] font-semibold text-danger 2xl:text-[15px]">
            <ArrowDownRight className="h-2.5 w-2.5 2xl:h-3 2xl:w-3" />
            {change}
          </span>
        )}
      </div>
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground 2xl:text-[12px]">{label}</span>
      <span className="text-[10px] text-muted-foreground 2xl:text-[11px]">{changeLabel}</span>
    </div>
  )
}
