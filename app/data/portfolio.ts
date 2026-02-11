export interface Business {
  id: string;
  name: string;
  description: string;
  acquiredDate: string;
  status: "healthy" | "watch" | "critical";
  metrics: {
    mrr: number;
    mrrPrevious: number;
    churn: number;
    churnPrevious: number;
    customers: number;
    growthRate: number;
    ltv: number;
    cac: number;
  };
  sparkline: number[];
}

export const businesses: Business[] = [
  {
    id: "formflow",
    name: "FormFlow",
    description: "No-code form builder for SaaS onboarding",
    acquiredDate: "2025-06-15",
    status: "healthy",
    metrics: {
      mrr: 12400,
      mrrPrevious: 11200,
      churn: 2.8,
      churnPrevious: 3.1,
      customers: 284,
      growthRate: 10.7,
      ltv: 1860,
      cac: 220,
    },
    sparkline: [9200, 9600, 9800, 10100, 10400, 10600, 10900, 11200, 11500, 11800, 12000, 12400],
  },
  {
    id: "pulsemetrics",
    name: "PulseMetrics",
    description: "Real-time analytics for e-commerce brands",
    acquiredDate: "2025-09-02",
    status: "watch",
    metrics: {
      mrr: 8200,
      mrrPrevious: 8600,
      churn: 5.2,
      churnPrevious: 4.1,
      customers: 156,
      growthRate: -4.7,
      ltv: 1420,
      cac: 310,
    },
    sparkline: [7800, 8100, 8400, 8800, 9000, 8900, 8700, 8600, 8500, 8400, 8300, 8200],
  },
  {
    id: "deploybot",
    name: "DeployBot",
    description: "One-click deployment automation for indie devs",
    acquiredDate: "2025-11-20",
    status: "healthy",
    metrics: {
      mrr: 15800,
      mrrPrevious: 14200,
      churn: 1.9,
      churnPrevious: 2.1,
      customers: 412,
      growthRate: 11.3,
      ltv: 2340,
      cac: 180,
    },
    sparkline: [11000, 11500, 12000, 12600, 13100, 13500, 14000, 14200, 14800, 15100, 15500, 15800],
  },
  {
    id: "mailscribe",
    name: "MailScribe",
    description: "AI email copywriting for newsletters",
    acquiredDate: "2026-01-08",
    status: "critical",
    metrics: {
      mrr: 4100,
      mrrPrevious: 5200,
      churn: 8.4,
      churnPrevious: 6.1,
      customers: 89,
      growthRate: -21.2,
      ltv: 680,
      cac: 420,
    },
    sparkline: [6200, 6100, 5900, 5700, 5500, 5400, 5200, 5100, 4800, 4500, 4300, 4100],
  },
];

export const aggregateMetrics = {
  totalMRR: 40500,
  totalMRRPrevious: 39200,
  burnRate: 28400,
  runway: 14.2,
  activeDeals: 3,
  totalCustomers: 941,
};
