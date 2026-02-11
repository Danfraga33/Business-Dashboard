import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface SparklineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export function SparklineChart({
  data,
  color = "#3B82F6",
  height = 40,
}: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ value, index }));
  const isPositive = data[data.length - 1] >= data[0];
  const lineColor = color === "auto" ? (isPositive ? "#10B981" : "#EF4444") : color;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id={`spark-${lineColor}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
            <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={1.5}
          fill={`url(#spark-${lineColor})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
