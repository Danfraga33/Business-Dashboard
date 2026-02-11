export interface Experiment {
  id: string;
  business: string;
  title: string;
  hypothesis: string;
  startDate: string;
  decisionDate: string;
  status: "running" | "needs_decision" | "concluded";
  outcome?: "shipped" | "killed" | "extended";
  successMetrics: {
    name: string;
    target: string;
    current: string;
    met: boolean | null;
  }[];
  notes: string;
}

export const experiments: Experiment[] = [
  {
    id: "exp-001",
    business: "DeployBot",
    title: "Enterprise Pricing Tier",
    hypothesis: "Adding a $199/mo enterprise tier will increase MRR by 15% without cannibalizing the $29 indie plan",
    startDate: "2026-01-15",
    decisionDate: "2026-02-20",
    status: "running",
    successMetrics: [
      { name: "MRR increase", target: "+15%", current: "+11.3%", met: null },
      { name: "Indie plan churn", target: "<3%", current: "1.9%", met: true },
      { name: "Enterprise signups", target: "≥10", current: "7", met: null },
    ],
    notes: "Strong early signal. 3 enterprise leads came in within first week. Indie plan unaffected so far.",
  },
  {
    id: "exp-002",
    business: "PulseMetrics",
    title: "Reduce Paid Acquisition Spend",
    hypothesis: "Cutting Facebook ad spend by 40% will reduce MRR loss rate without significantly impacting new signups",
    startDate: "2026-02-01",
    decisionDate: "2026-03-01",
    status: "running",
    successMetrics: [
      { name: "New signups (organic)", target: "≥80% of total", current: "71%", met: null },
      { name: "MRR decline", target: "Slow to <2%/mo", current: "-4.7%", met: false },
      { name: "CAC reduction", target: "<$200", current: "$310", met: false },
    ],
    notes: "Too early to tell. Need at least 3 more weeks of data. Organic is improving but paid was covering a retention problem.",
  },
  {
    id: "exp-003",
    business: "MailScribe",
    title: "Onboarding Rebuild",
    hypothesis: "Simplifying onboarding from 8 steps to 3 will improve activation rate from 34% to 60%",
    startDate: "2026-02-10",
    decisionDate: "2026-03-10",
    status: "running",
    successMetrics: [
      { name: "Activation rate", target: "60%", current: "34% (baseline)", met: null },
      { name: "Time to first value", target: "<5 min", current: "18 min (baseline)", met: null },
      { name: "Week-1 churn", target: "<15%", current: "28% (baseline)", met: null },
    ],
    notes: "Just deployed yesterday. Monitoring closely. Session recordings show users are completing the new flow faster.",
  },
  {
    id: "exp-004",
    business: "FormFlow",
    title: "Zapier Integration Impact on LTV",
    hypothesis: "Users who connect at least one Zapier integration will have 40% higher LTV than non-connected users",
    startDate: "2026-02-07",
    decisionDate: "2026-04-07",
    status: "running",
    successMetrics: [
      { name: "Integration adoption", target: "≥20% of users", current: "6.3%", met: null },
      { name: "Connected user retention", target: ">95%/mo", current: "98.2%", met: true },
      { name: "LTV delta", target: "+40%", current: "Insufficient data", met: null },
    ],
    notes: "Very early but connected users are showing significantly better retention already. Need more time for LTV signal.",
  },
];
