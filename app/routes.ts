import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("components/Layout.tsx", [
    index("routes/morning-brief.tsx"),
    route("health", "routes/health.tsx"),
    route("growth", "routes/growth.tsx"),
    route("retention", "routes/retention.tsx"),
    route("financials", "routes/financials.tsx"),
    route("experiments", "routes/experiments.tsx"),
    route("decisions", "routes/decisions.tsx"),
    route("strategy", "routes/strategy.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
