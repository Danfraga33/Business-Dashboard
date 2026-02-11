export interface PLItem {
  category: string;
  budget: number;
  actual: number;
  items?: { name: string; amount: number }[];
}

export interface MonthlyBurn {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
  runway: number;
}

export const plSummary = {
  revenue: {
    total: 40500,
    breakdown: [
      { name: "FormFlow", amount: 12400 },
      { name: "PulseMetrics", amount: 8200 },
      { name: "DeployBot", amount: 15800 },
      { name: "MailScribe", amount: 4100 },
    ],
  },
  expenses: {
    total: 28400,
    breakdown: [
      { category: "Infrastructure", budget: 8000, actual: 7200 },
      { category: "Marketing", budget: 6000, actual: 7800 },
      { category: "Contractors", budget: 5000, actual: 4600 },
      { category: "Software & Tools", budget: 3000, actual: 3200 },
      { category: "Support", budget: 2500, actual: 2100 },
      { category: "Legal & Compliance", budget: 1500, actual: 1800 },
      { category: "Misc / Contingency", budget: 2000, actual: 1700 },
    ],
  },
  netIncome: 12100,
};

export const monthlyBurn: MonthlyBurn[] = [
  { month: "Sep", revenue: 25000, expenses: 22000, net: 3000, runway: 18.5 },
  { month: "Oct", revenue: 28000, expenses: 24000, net: 4000, runway: 17.2 },
  { month: "Nov", revenue: 32000, expenses: 26000, net: 6000, runway: 16.8 },
  { month: "Dec", revenue: 35000, expenses: 27500, net: 7500, runway: 15.9 },
  { month: "Jan", revenue: 39200, expenses: 28000, net: 11200, runway: 15.1 },
  { month: "Feb", revenue: 40500, expenses: 28400, net: 12100, runway: 14.2 },
];

export const budgetAlerts = [
  {
    category: "Marketing",
    severity: "danger" as const,
    message: "30% over budget — driven by PulseMetrics paid acquisition push",
    overage: 1800,
  },
  {
    category: "Legal & Compliance",
    severity: "warning" as const,
    message: "20% over budget — MailScribe IP review cost more than estimated",
    overage: 300,
  },
  {
    category: "Software & Tools",
    severity: "warning" as const,
    message: "Approaching limit — new monitoring tool added this month",
    overage: 200,
  },
];
