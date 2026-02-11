interface HealthIndicatorProps {
  status: "healthy" | "watch" | "critical";
  size?: "sm" | "md";
  showLabel?: boolean;
}

const statusConfig = {
  healthy: { color: "bg-success", label: "Healthy", ring: "ring-success/20" },
  watch: { color: "bg-warning", label: "Watch", ring: "ring-warning/20" },
  critical: { color: "bg-danger", label: "Critical", ring: "ring-danger/20" },
};

export function HealthIndicator({
  status,
  size = "md",
  showLabel = false,
}: HealthIndicatorProps) {
  const config = statusConfig[status];
  const dotSize = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  const ringSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${ringSize} rounded-full ring-4 ${config.ring} flex items-center justify-center`}
      >
        <div
          className={`${dotSize} rounded-full ${config.color}`}
          style={{
            animation:
              status === "critical" ? "pulse-glow 2s ease-in-out infinite" : undefined,
          }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-ink-secondary">
          {config.label}
        </span>
      )}
    </div>
  );
}
