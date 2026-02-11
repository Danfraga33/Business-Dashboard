import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("components/Layout.tsx", [
    index("routes/morning-brief.tsx"),
    route("portfolio", "routes/portfolio.tsx"),
    route("financials", "routes/financials.tsx"),
    route("journal", "routes/journal.tsx"),
    route("experiments", "routes/experiments.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
