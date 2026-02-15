import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Load the SKILL.md content
function loadSkillContent(): string {
  try {
    return fs.readFileSync(
      path.join(process.cwd(), "app/ai-accountant/SKILL.md"),
      "utf-8"
    );
  } catch (error) {
    console.error("Failed to load SKILL.md:", error);
    return "";
  }
}

interface PnLData {
  revenue: {
    mrr: number;
    annual: number;
  };
  cogs: {
    hosting: number;
    infrastructure: number;
    thirdPartyApis: number;
    customerSupport: number;
    total: number;
  };
  grossProfit: number;
  grossMargin: number;
  opex: {
    marketing: number;
    salaries: number;
    tools: number;
    legal: number;
    misc: number;
    total: number;
  };
  ebitda: number;
  netMargin: number;
}

export async function analyzeFinancials(pnlData: PnLData): Promise<string> {
  const skillContent = loadSkillContent();

  if (!skillContent) {
    throw new Error("SKILL.md content not found");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable not set");
  }

  const prompt = `
Analyze this SaaS P&L statement and provide strategic acquisition advice:

**P&L Statement (Monthly)**

Revenue: $${pnlData.revenue.mrr.toLocaleString()}
Annual Run Rate: $${pnlData.revenue.annual.toLocaleString()}

Cost of Goods Sold: $${pnlData.cogs.total.toLocaleString()}
  - Hosting & Infrastructure: $${(pnlData.cogs.hosting + pnlData.cogs.infrastructure).toLocaleString()}
  - Third-party APIs: $${pnlData.cogs.thirdPartyApis.toLocaleString()}
  - Customer Support Tools: $${pnlData.cogs.customerSupport.toLocaleString()}

Gross Profit: $${pnlData.grossProfit.toLocaleString()} (${pnlData.grossMargin.toFixed(1)}%)

Operating Expenses: $${pnlData.opex.total.toLocaleString()}
  - Marketing & Ads: $${pnlData.opex.marketing.toLocaleString()}
  - SaaS Tools & Software: $${pnlData.opex.tools.toLocaleString()}
  - Legal & Compliance: $${pnlData.opex.legal.toLocaleString()}
  - Miscellaneous: $${pnlData.opex.misc.toLocaleString()}

Net Income (EBITDA): $${pnlData.ebitda.toLocaleString()} (${pnlData.netMargin.toFixed(1)}%)

Provide analysis following the framework in your skill definition. Be specific, actionable, and concise.
`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: skillContent, // SKILL.md becomes the system prompt
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return message.content[0].type === "text"
      ? message.content[0].text
      : "No analysis available";
  } catch (error) {
    console.error("Failed to analyze financials:", error);
    throw new Error("Failed to generate AI analysis");
  }
}
