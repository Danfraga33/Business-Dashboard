interface MetricComparisonProps {
  label: string;
  budget: number;
  actual: number;
  format?: "currency" | "number" | "percent";
}

function formatValue(value: number, format: string) {
  if (format === "currency") {
    return `$${value.toLocaleString()}`;
  }
  if (format === "percent") {
    return `${value}%`;
  }
  return value.toLocaleString();
}

export function MetricComparison({
  label,
  budget,
  actual,
  format = "currency",
}: MetricComparisonProps) {
  const variance = actual - budget;
  const variancePct = budget !== 0 ? ((variance / budget) * 100).toFixed(0) : "0";
  const isOver = variance > 0;

  return (
    <tr className="border-b border-edge/50 last:border-0">
      <td className="py-3 pr-4 text-sm text-ink-secondary">{label}</td>
      <td className="py-3 px-4 text-sm text-ink-muted font-mono text-right">
        {formatValue(budget, format)}
      </td>
      <td className="py-3 px-4 text-sm text-ink font-mono text-right font-medium">
        {formatValue(actual, format)}
      </td>
      <td
        className={`py-3 pl-4 text-sm font-mono text-right font-medium ${
          isOver ? "text-danger" : "text-success"
        }`}
      >
        {isOver ? "+" : ""}
        {formatValue(variance, format)}
        <span className="text-ink-muted ml-1 text-xs">({variancePct}%)</span>
      </td>
    </tr>
  );
}
