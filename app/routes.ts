import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("components/Layout.tsx", [
    index("routes/morning-brief.tsx"),
    route("health", "routes/health.tsx"),
    route("retention", "routes/retention.tsx"),
    route("growth-levers/gtm", "routes/growth-levers/gtm.tsx"),
    route("growth/conversion-funnel", "routes/growth/conversion-funnel.tsx"),
    route("diagnostics/unit-economics", "routes/diagnostics/unit-economics.tsx"),
    route("customers", "routes/customers.tsx"),
    route("financials", "routes/financials.tsx"),
    route("learnings", "routes/learnings.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
