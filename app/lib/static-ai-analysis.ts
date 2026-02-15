interface PnLData {
  revenue: { mrr: number; annual: number };
  cogs: {
    total: number;
    hosting: number;
    infrastructure: number;
    thirdPartyApis: number;
    customerSupport: number;
  };
  grossProfit: number;
  grossMargin: number;
  opex: {
    total: number;
    marketing: number;
    tools: number;
    salaries: number;
    legal: number;
    misc: number;
  };
  ebitda: number;
  netMargin: number;
}

/**
 * Generates static P&L analysis based on the AI Accountant SKILL.md framework
 * This is a rule-based analysis that doesn't require API calls
 */
export function generateStaticAnalysis(pnlData: PnLData): {
  healthAssessment: string;
  marginAnalysis: {
    grossMargin: { value: number; status: 'good' | 'warning' | 'danger'; message: string };
    netMargin: { value: number; status: 'good' | 'warning' | 'danger'; message: string };
  };
  costStructure: {
    cogs: string;
    marketing: string;
  };
  quickWins: string[];
  structuralImprovements: string[];
  scaleLevers: string[];
} {
  const infraCostPct = ((pnlData.cogs.hosting + pnlData.cogs.infrastructure) / pnlData.revenue.mrr) * 100;
  const marketingEfficiency = (pnlData.opex.marketing / pnlData.grossProfit) * 100;
  const cogsPct = (pnlData.cogs.total / pnlData.revenue.mrr) * 100;
  const opexRatio = (pnlData.opex.total / pnlData.grossProfit) * 100;

  // Health Assessment
  let healthMessage = "";
  if (pnlData.grossMargin >= 70) {
    healthMessage = `Business is fundamentally viable with ${pnlData.grossMargin.toFixed(1)}% gross margin (excellent - above 70% SaaS benchmark). `;
  } else if (pnlData.grossMargin >= 60) {
    healthMessage = `Business is fundamentally viable with ${pnlData.grossMargin.toFixed(1)}% gross margin (healthy - above 60% SaaS benchmark). `;
  } else if (pnlData.grossMargin >= 50) {
    healthMessage = `Business has ${pnlData.grossMargin.toFixed(1)}% gross margin (below 60% SaaS benchmark - needs improvement). `;
  } else {
    healthMessage = `⚠️ Business has ${pnlData.grossMargin.toFixed(1)}% gross margin (structural concern - well below 60% SaaS benchmark). `;
  }

  if (pnlData.ebitda >= 0) {
    healthMessage += `Currently profitable with $${Math.abs(pnlData.ebitda).toLocaleString()}/month EBITDA.`;
  } else {
    healthMessage += `Currently burning $${Math.abs(pnlData.ebitda).toLocaleString()}/month.`;
  }

  // Margin Analysis
  const grossMarginStatus = pnlData.grossMargin >= 70 ? 'good' : pnlData.grossMargin >= 60 ? 'warning' : 'danger';
  const netMarginStatus = pnlData.netMargin >= 20 ? 'good' : pnlData.netMargin >= 0 ? 'warning' : 'danger';

  const grossMarginMessage = pnlData.grossMargin >= 70
    ? "Excellent - healthy SaaS economics"
    : pnlData.grossMargin >= 60
    ? "Healthy - room for optimization"
    : "Below target - focus on COGS reduction";

  const netMarginMessage = pnlData.netMargin >= 20
    ? "Strong profitability"
    : pnlData.netMargin >= 0
    ? "Break-even - focus on efficiency"
    : "Burning cash - prioritize path to profitability";

  // Cost Structure Analysis
  let cogsAnalysis = `COGS is ${cogsPct.toFixed(1)}% of revenue. `;
  if (infraCostPct > 8) {
    cogsAnalysis += `Infrastructure costs (${infraCostPct.toFixed(1)}% of revenue) are high — target is 3-5%. Optimization could improve gross margin by 200-400 bps.`;
  } else if (infraCostPct > 5) {
    cogsAnalysis += `Infrastructure costs (${infraCostPct.toFixed(1)}% of revenue) are slightly elevated but manageable.`;
  } else {
    cogsAnalysis += `Infrastructure costs (${infraCostPct.toFixed(1)}% of revenue) are within healthy range (3-5% target).`;
  }

  let marketingAnalysis = `Marketing spend is ${marketingEfficiency.toFixed(0)}% of gross profit. `;
  if (marketingEfficiency > 50) {
    marketingAnalysis += "This is very high — validate CAC payback urgently before scaling further. You're spending $0.50+ per dollar of gross profit on marketing.";
  } else if (marketingEfficiency > 40) {
    marketingAnalysis += "This is high — validate CAC payback before scaling. Focus on channel efficiency and conversion optimization.";
  } else if (marketingEfficiency > 20) {
    marketingAnalysis += "This is reasonable for a growth-stage SaaS. Continue monitoring CAC efficiency.";
  } else {
    marketingAnalysis += "This is conservative — may have room to invest more in proven channels if unit economics support it.";
  }

  // Quick Wins (Q1)
  const quickWins: string[] = [];

  // Pricing opportunity
  if (pnlData.grossMargin < 70 || pnlData.netMargin < 20) {
    quickWins.push("Review pricing against market — potential 10-20% increase if value delivery is strong and churn is low");
  } else {
    quickWins.push("Test pricing elasticity — business is healthy enough to experiment with value-based tiers");
  }

  // SaaS tool consolidation
  if (pnlData.opex.tools > pnlData.revenue.mrr * 0.05) {
    quickWins.push(`Consolidate SaaS tools ($${pnlData.opex.tools.toLocaleString()}/month is ${((pnlData.opex.tools / pnlData.revenue.mrr) * 100).toFixed(1)}% of revenue) — target 20-30% reduction`);
  } else {
    quickWins.push(`Audit SaaS tools ($${pnlData.opex.tools.toLocaleString()}/month) for redundancies and unused seats`);
  }

  // Infrastructure optimization
  if (infraCostPct > 8) {
    quickWins.push("Optimize infrastructure costs — move to reserved instances, audit database queries, implement caching");
  } else if (infraCostPct > 5) {
    quickWins.push("Review infrastructure efficiency — ensure auto-scaling and resource optimization are in place");
  }

  // Marketing efficiency
  if (marketingEfficiency > 40) {
    quickWins.push("Cut or pause lowest-performing marketing channels until CAC payback is validated");
  }

  // Structural Improvements (Q2-Q3)
  const structuralImprovements: string[] = [
    "Implement product-led growth features (self-serve onboarding, freemium tier, integration marketplace)",
    "Reduce churn through better onboarding automation and customer success triggers",
    "Build comprehensive self-service documentation to reduce support costs",
  ];

  // Add context-specific improvements
  if (pnlData.cogs.customerSupport > pnlData.revenue.mrr * 0.05) {
    structuralImprovements.push("Support costs are high — invest in help center, chatbot, and onboarding optimization");
  }

  if (opexRatio > 60) {
    structuralImprovements.push("OpEx is high relative to gross profit — focus on process automation and efficiency gains");
  }

  // Scale Levers (Q4+)
  const scaleLevers: string[] = [
    "Launch enterprise tier with dedicated support, SLA commitments, and premium pricing",
    "Scale proven acquisition channels while maintaining CAC efficiency (target <12 month payback)",
    `Path to $${(pnlData.revenue.mrr * 2).toLocaleString()}/month MRR within 12 months through pricing, expansion, and acquisition`,
  ];

  // Add context-specific scale opportunities
  if (pnlData.grossMargin >= 70 && pnlData.ebitda >= 0) {
    scaleLevers.push("Business has strong unit economics — can afford to invest in growth marketing aggressively");
  } else if (pnlData.grossMargin >= 60) {
    scaleLevers.push("Focus on margin expansion before scaling acquisition spend heavily");
  }

  return {
    healthAssessment: healthMessage,
    marginAnalysis: {
      grossMargin: {
        value: pnlData.grossMargin,
        status: grossMarginStatus,
        message: grossMarginMessage,
      },
      netMargin: {
        value: pnlData.netMargin,
        status: netMarginStatus,
        message: netMarginMessage,
      },
    },
    costStructure: {
      cogs: cogsAnalysis,
      marketing: marketingAnalysis,
    },
    quickWins,
    structuralImprovements,
    scaleLevers,
  };
}
