interface LegendItem {
  color: string
  label: string
}

const legendItems: LegendItem[] = [
  { color: "bg-[#0a1e46]", label: "Hot Leads" },
  { color: "bg-[#0f55a0]", label: "Warm Leads" },
  { color: "bg-[#32c8c8]", label: "Cold Leads" },
]

export function FunnelLegend() {
  return (
    <div className="flex items-center justify-center gap-6">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
          <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
