import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("components/Layout.tsx", [
    index("routes/morning-brief.tsx"),
    route("portfolio", "routes/portfolio.tsx"),
    route("financials", "routes/financials.tsx"),
    route("journal", "routes/journal.tsx"),
    route("experiments", "routes/experiments.tsx"),
    route("settings", "routes/settings.tsx"),
    route("marketing", "routes/marketing.tsx"),
    route("marketing/paid", "routes/marketing.paid.tsx"),
    route("marketing/organic", "routes/marketing.organic.tsx"),
  ]),
] satisfies RouteConfig;
