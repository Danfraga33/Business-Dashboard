export interface JournalEntry {
  id: string;
  date: string;
  business: string | null;
  hypothesis: string;
  shipped: string;
  learned: string;
  blockers: string;
  tomorrow: string;
  tags: string[];
}

export const journalEntries: JournalEntry[] = [
  {
    id: "j-001",
    date: "2026-02-11",
    business: "MailScribe",
    hypothesis: "Churn is driven by poor onboarding, not product-market fit",
    shipped: "- Rebuilt welcome email sequence (5 emails → 3, more focused)\n- Added in-app checklist for first 48 hours\n- Deployed session recording on onboarding flow",
    learned: "Exit survey data shows 62% of churned users never completed setup. This is fixable. The product has value once people get past the initial friction.",
    blockers: "Need access to MailScribe's Intercom to see support ticket patterns during first week.",
    tomorrow: "- Analyze session recordings from new onboarding\n- Draft revised pricing page copy\n- Call with MailScribe's previous founder",
    tags: ["onboarding", "churn", "mailscribe"],
  },
  {
    id: "j-002",
    date: "2026-02-10",
    business: "DeployBot",
    hypothesis: "Enterprise tier at $199/mo can capture larger teams without alienating indie devs",
    shipped: "- Launched enterprise tier on pricing page (no feature gating yet)\n- Added team management UI scaffolding\n- Updated Stripe billing to handle per-seat pricing",
    learned: "Three enterprise inquiries within 6 hours of soft launch. The demand is real. Need to be careful not to bloat the product for the core audience though.",
    blockers: "Stripe Connect setup for multi-seat is more complex than expected.",
    tomorrow: "- Follow up with enterprise leads\n- Scope team permissions system\n- Review DeployBot support queue",
    tags: ["pricing", "enterprise", "deploybot"],
  },
  {
    id: "j-003",
    date: "2026-02-09",
    business: null,
    hypothesis: "Portfolio-level marketing spend is 30% too high relative to organic growth rates",
    shipped: "- Completed full marketing audit across all 4 businesses\n- Built attribution model in spreadsheet\n- Cut PulseMetrics Facebook spend by 40%",
    learned: "DeployBot and FormFlow are growing almost entirely organically (SEO + word of mouth). PulseMetrics is over-reliant on paid. MailScribe hasn't found a channel yet.",
    blockers: "Need to set up proper UTM tracking across all properties.",
    tomorrow: "- Implement UTM framework for all businesses\n- Deep dive into MailScribe churn data\n- Weekly portfolio review prep",
    tags: ["marketing", "portfolio", "attribution"],
  },
  {
    id: "j-004",
    date: "2026-02-07",
    business: "FormFlow",
    hypothesis: "API integration marketplace can increase LTV by 40%",
    shipped: "- Published Zapier integration (beta)\n- Added webhook support for form submissions\n- Updated API docs with integration examples",
    learned: "Zapier integration got 18 installs in first day. This validates that FormFlow users want to connect to their stack. Should prioritize native integrations with top-requested tools.",
    blockers: "None currently.",
    tomorrow: "- Monitor Zapier integration stability\n- Prioritize integration roadmap based on user requests\n- Start MailScribe onboarding audit",
    tags: ["integrations", "formflow", "api"],
  },
];
