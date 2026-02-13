import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  layout("components/Layout.tsx", [
    index("routes/morning-brief.tsx"),
    route("health", "routes/health.tsx"),
    route("customers", "routes/customers.tsx"),
    route("growth/retention-monetization", "routes/growth/retention-monetization.tsx"),
    route("growth/conversions-cac", "routes/growth/conversions-cac.tsx"),
    route("growth/acquisition-expansion", "routes/growth/acquisition-expansion.tsx"),
    route("growth-levers/gtm", "routes/growth-levers/gtm.tsx"),
    route("growth-levers/defensibility", "routes/growth-levers/defensibility.tsx"),
    route("financials", "routes/financials.tsx"),
    route("learnings", "routes/learnings.tsx"),
    route("settings", "routes/settings.tsx"),
  ]),
] satisfies RouteConfig;
