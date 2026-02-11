import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  prefix?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  prefix,
  className = "",
}: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div className={`card ${className}`}>
      <p className="text-xs font-medium text-ink-muted uppercase tracking-wider mb-3">
        {label}
      </p>
      <p className="metric-value text-2xl text-ink leading-none">
        {prefix}
        {value}
      </p>
      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {isPositive && <TrendingUp className="w-3.5 h-3.5 text-success" />}
          {isNegative && <TrendingDown className="w-3.5 h-3.5 text-danger" />}
          {isNeutral && <Minus className="w-3.5 h-3.5 text-ink-muted" />}
          <span
            className={`text-xs font-medium font-mono ${
              isPositive
                ? "text-success"
                : isNegative
                ? "text-danger"
                : "text-ink-muted"
            }`}
          >
            {isPositive && "+"}
            {change.toFixed(1)}%
          </span>
          {changeLabel && (
            <span className="text-xs text-ink-muted">{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}
