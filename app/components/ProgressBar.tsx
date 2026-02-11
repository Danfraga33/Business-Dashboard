interface ProgressBarProps {
  progress: number;
  color?: "accent" | "success" | "warning" | "danger";
  height?: number;
  showLabel?: boolean;
  label?: string;
}

const colorMap = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

const bgMap = {
  accent: "bg-accent/10",
  success: "bg-success/10",
  warning: "bg-warning/10",
  danger: "bg-danger/10",
};

export function ProgressBar({
  progress,
  color = "accent",
  height = 6,
  showLabel = false,
  label,
}: ProgressBarProps) {
  const clamped = Math.min(Math.max(progress, 0), 100);

  return (
    <div>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs text-ink-secondary">{label}</span>
          )}
          {showLabel && (
            <span className="text-xs font-mono text-ink-muted">
              {clamped.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full ${bgMap[color]} overflow-hidden`}
        style={{ height }}
      >
        <div
          className={`h-full rounded-full ${colorMap[color]} transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
