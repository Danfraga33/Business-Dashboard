export const briefing = {
  date: "2026-02-11",
  greeting: "Good morning, Daniel",
  dayOfWeek: "Wednesday",
  executiveSummary:
    "Portfolio MRR hit $40.5k (+3.3% WoW), led by DeployBot's enterprise tier momentum. However, MailScribe's churn accelerated to 8.4% — the onboarding rebuild deployed yesterday is critical. PulseMetrics continues its slow decline; the paid spend cut hasn't reversed the trend yet. FormFlow remains the steady performer with strong organic growth.",
  redFlags: [
    {
      severity: "critical" as const,
      business: "MailScribe",
      title: "Churn accelerating despite intervention",
      detail:
        "Monthly churn jumped from 6.1% to 8.4%. At this rate, MailScribe loses 50% of its customer base within 6 months. The onboarding rebuild went live yesterday — you need to monitor activation rates daily this week.",
      metric: "8.4% churn (+2.3pp)",
    },
    {
      severity: "warning" as const,
      business: "PulseMetrics",
      title: "MRR decline not slowing",
      detail:
        "PulseMetrics MRR dropped another $400 this month. The Facebook ad cut was the right call (CAC was unsustainable), but organic channels aren't compensating. The product may have a positioning problem, not just a channel problem.",
      metric: "-$400 MRR",
    },
    {
      severity: "warning" as const,
      business: "Portfolio",
      title: "Marketing budget 30% over",
      detail:
        "Total marketing spend is $7,800 against a $6,000 budget, primarily driven by PulseMetrics' paid acquisition that you've already started cutting. Should normalize next month.",
      metric: "$1,800 over budget",
    },
  ],
  opportunities: [
    {
      business: "DeployBot",
      title: "Enterprise pipeline building fast",
      detail:
        "7 enterprise signups in 3 weeks with zero targeted outreach. Three inbound leads from companies with 20+ developers. Consider a dedicated enterprise landing page and case study.",
      impact: "Potential +$4k MRR this quarter",
    },
    {
      business: "FormFlow",
      title: "Zapier integration showing strong retention signal",
      detail:
        "Connected users have 98.2% monthly retention vs 94.1% for non-connected. If you can push integration adoption from 6.3% to 20%, FormFlow's churn effectively drops to near-zero for that cohort.",
      impact: "Could reduce FormFlow churn by 40%",
    },
    {
      business: "Portfolio",
      title: "Cross-sell opportunity between FormFlow and DeployBot",
      detail:
        "12 customers overlap between FormFlow and DeployBot. These power users could beta test a bundle offering or become case studies for a portfolio approach.",
      impact: "Higher LTV + lower acquisition cost",
    },
  ],
  patterns: [
    {
      title: "Organic growth correlates with documentation quality",
      detail:
        "DeployBot and FormFlow (both growing organically) have extensive docs and active community forums. PulseMetrics and MailScribe don't. Pattern suggests investing in documentation pays off more than paid acquisition for developer-focused tools.",
    },
    {
      title: "Onboarding completion predicts 90-day retention",
      detail:
        "Across all four businesses, users who complete onboarding within 48 hours have 3.2x better 90-day retention. This is your highest-leverage operational metric across the portfolio.",
    },
  ],
  recommendedActions: [
    {
      priority: "high" as const,
      action: "Monitor MailScribe onboarding metrics daily this week",
      context:
        "The rebuild went live yesterday. You need daily activation rate and time-to-value data to know if it's working before the monthly churn number locks in.",
      business: "MailScribe",
    },
    {
      priority: "high" as const,
      action: "Create enterprise landing page for DeployBot",
      context:
        "Enterprise leads are converting from the generic pricing page. A dedicated page with case studies and security/compliance info could 2-3x conversion for this segment.",
      business: "DeployBot",
    },
    {
      priority: "medium" as const,
      action: "Investigate PulseMetrics positioning",
      context:
        "The product works but the market message isn't landing. Schedule user interviews with 5 recently churned customers to understand why they left and where they went.",
      business: "PulseMetrics",
    },
  ],
};
