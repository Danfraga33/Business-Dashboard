import { useState } from 'react';
import { Download, ChevronDown, ChevronUp, TrendingUp, AlertCircle, CheckCircle2, Users, DollarSign, TrendingDown } from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PricingTier {
  name: string;
  price: string;
  pricePerMonth: number;
  color: 'amber' | 'emerald';
}

interface ValueQuantification {
  problemSolved: string;
  timePerWeek: number;
  hourlyRate: number;
  revenueImpact?: number;
  totalValuePerYear: number;
}

interface CustomerInterview {
  question: string;
  responses: string[];
  insight: string;
}

interface ValueCapture {
  customerValue: number;
  yourPrice: number;
  capturePercent: number;
  interpretation: string;
}

interface Decision {
  currentAssessment: string;
  whyNotRaise: string;
  nextAction: string;
}

interface ActualData {
  financial: {
    currentPrice: string;
    customers: number;
    mrr: number;
    arr: number;
    revenuePerCustomerPerYear: number;
    cac: number;
    cacPayback: string;
    grossMargin: string;
  };
  churnRetention: {
    customersLast12Months: string;
    monthlyChurn: string;
    annualRetention: string;
    churnReasons: { reason: string; count: number }[];
  };
  customerProfile: {
    typical: string;
    size: string;
    businessType: string;
    problemSolved: string;
    valuePerception: string;
    willingToPay: string;
  };
  satisfaction: {
    nps: string;
    wouldRecommend: string;
    featureAdoption: string;
    supportFrequency: string;
    lastInteraction: string;
  };
  expansionSignals?: {
    askingForPremium: string;
    wouldPayMore: string;
    dailyUsage: string;
    integrations: string;
  };
}

interface HealthMetric {
  tier: string;
  mrr: number;
  customers: number;
  churn: string;
  growth: string;
  status: 'green' | 'yellow' | 'red';
}

// ============================================================================
// DATA
// ============================================================================

const starterTier: PricingTier = {
  name: 'Starter',
  price: '$25/month',
  pricePerMonth: 25,
  color: 'amber'
};

const growthTier: PricingTier = {
  name: 'Growth',
  price: '$99/month',
  pricePerMonth: 99,
  color: 'emerald'
};

const starterValueQuantification: ValueQuantification = {
  problemSolved: 'Replaces 3 hours/week of manual [task] for solo founders',
  timePerWeek: 3,
  hourlyRate: 30,
  totalValuePerYear: 4320
};

const growthValueQuantification: ValueQuantification = {
  problemSolved: 'Replaces 15 hours/week of manual work + generates revenue for small teams (5–20 people)',
  timePerWeek: 15,
  hourlyRate: 40,
  revenueImpact: 1500,
  totalValuePerYear: 46800
};

const starterInterviews: CustomerInterview[] = [
  {
    question: 'How much time does this save you?',
    responses: ['Customer A: "2–3 hours/week" ✓', 'Customer B: "3–4 hours/week" ✓', 'Customer C: "4 hours/week" ✓'],
    insight: 'Average: 3.2 hours/week (validates estimate)'
  },
  {
    question: 'What would you do instead?',
    responses: ['Customer A: "Hire a VA at $300–400/month"', 'Customer B: "Use a freelancer at $500/month"', 'Customer C: "Do it manually (lose the time)"'],
    insight: 'Average WTP anchor: $400/month'
  },
  {
    question: 'At $25/month, is this good value?',
    responses: ['Customer A: "Yes, great value"', 'Customer B: "Yes, obvious choice vs. freelancer"', 'Customer C: "Yes, even at $50 I\'d use it"'],
    insight: 'All say: Clear value at current price'
  },
  {
    question: 'If we doubled to $50/month, would you leave?',
    responses: ['Customer A: "Maybe, depends on features"', 'Customer B: "Probably yes, still cheaper than freelancer"', 'Customer C: "No, still worth it"'],
    insight: 'Average: 2 of 5 would consider leaving; room exists'
  }
];

const growthInterviews: CustomerInterview[] = [
  {
    question: 'How much time does this save your team?',
    responses: ['Customer A: "12 hours/week" ✓', 'Customer B: "15 hours/week" ✓', 'Customer C: "18 hours/week" ✓'],
    insight: 'Average: 15 hours/week (validates estimate)'
  },
  {
    question: 'Besides time, any other impact?',
    responses: ['Customer A: "Faster reporting, better decisions"', 'Customer B: "Can take on more projects with same team"', 'Customer C: "Fewer errors = fewer rework hours"'],
    insight: 'Average impact: ~15–20% efficiency/revenue gain'
  },
  {
    question: 'What would you do instead?',
    responses: ['Customer A: "Hire another person ($60k/year)"', 'Customer B: "Buy 3 separate tools ($500/month combined)"', 'Customer C: "Build it ourselves (6 months, 1 engineer)"'],
    insight: 'Average WTP anchor: $2,000–3,000/month'
  },
  {
    question: 'At $99/month, is this good value?',
    responses: ['Customer A: "Incredible value; 20x cheaper than hiring"', 'Customer B: "Great value vs. buying 3 tools"', 'Customer C: "Amazing; we\'d pay 10x more"'],
    insight: 'All say: Obvious choice at current price'
  },
  {
    question: 'If we doubled to $199/month, would you leave?',
    responses: ['Customer A: "No, still $1,800/year vs. $60k salary"', 'Customer B: "No, still cheaper than tool stack"', 'Customer C: "No, ROI is so clear"'],
    insight: 'All: Would NOT leave; significant headroom'
  }
];

const starterValueCapture: ValueCapture = {
  customerValue: 4320,
  yourPrice: 300,
  capturePercent: 7,
  interpretation: 'You\'re capturing 7% of the value you create. Customers are keeping 93% of the benefit. You have significant pricing headroom.'
};

const growthValueCapture: ValueCapture = {
  customerValue: 46800,
  yourPrice: 1188,
  capturePercent: 2.5,
  interpretation: 'You\'re capturing 2.5% of the value you create. Customers are keeping 97.5% of the benefit. You have MASSIVE pricing headroom.'
};

const starterDecision: Decision = {
  currentAssessment: 'Current price ($25) is UNDERPRICED relative to value',
  whyNotRaise: 'Because 2 of 5 customers showed hesitation at 2x price. Testing is smarter than guessing.',
  nextAction: 'Test $49/month with new sign-ups (next 30 days). If churn stays <5%, make permanent. If churn spikes, revert to $25.'
};

const growthDecision: Decision = {
  currentAssessment: 'Current price ($99) is SIGNIFICANTLY UNDERPRICED. Could raise to $199–299 and still be 5–6% value capture.',
  whyNotRaise: 'Because you want to grow user base (not just maximize price). Growth customers → potential upsell → expansion revenue. Lower price = more customers = more word-of-mouth.',
  nextAction: 'Keep at $99/month (growth strategy). Revisit when ARR reaches $100k+. At that point: Raise to $199/month (proven value).'
};

const starterActualData: ActualData = {
  financial: {
    currentPrice: '$25/month',
    customers: 25,
    mrr: 625,
    arr: 7500,
    revenuePerCustomerPerYear: 300,
    cac: 50,
    cacPayback: '2 months',
    grossMargin: '85%'
  },
  churnRetention: {
    customersLast12Months: '25 → 27 (net +2, good trend)',
    monthlyChurn: '0.5%',
    annualRetention: '94%',
    churnReasons: [
      { reason: 'No longer needs it (pivoted business)', count: 2 },
      { reason: 'Price sensitivity', count: 0 },
      { reason: 'Product issues', count: 1 }
    ]
  },
  customerProfile: {
    typical: 'Solo founder / freelancer',
    size: '1 person (self)',
    businessType: 'Service business (consultant, freelancer, coach)',
    problemSolved: 'Save 3–4 hours/week on [specific task]',
    valuePerception: '"Saves me time so I can focus on billables"',
    willingToPay: '$50–100/month (said in interviews)'
  },
  satisfaction: {
    nps: 'Not formally tracked (too early)',
    wouldRecommend: '80% (informal feedback)',
    featureAdoption: 'High (70%+ use core features)',
    supportFrequency: 'Low (0.2 per customer per month)',
    lastInteraction: 'Last 30 days (healthy engagement)'
  }
};

const growthActualData: ActualData = {
  financial: {
    currentPrice: '$99/month',
    customers: 18,
    mrr: 1782,
    arr: 21384,
    revenuePerCustomerPerYear: 1188,
    cac: 200,
    cacPayback: '2 months',
    grossMargin: '80%'
  },
  churnRetention: {
    customersLast12Months: '18 → 18 (stable, good sign)',
    monthlyChurn: '0%',
    annualRetention: '100%',
    churnReasons: []
  },
  customerProfile: {
    typical: 'Small business owner / team lead',
    size: '5–15 people',
    businessType: 'Service business, agencies, SaaS',
    problemSolved: 'Save 12–18 hours/week; improve team efficiency',
    valuePerception: '"Reduced costs + faster delivery = more revenue"',
    willingToPay: '$500–2,000/month (said in interviews)'
  },
  satisfaction: {
    nps: 'Not formally tracked (too early)',
    wouldRecommend: '100% (informal feedback)',
    featureAdoption: 'Very high (90%+ use advanced features)',
    supportFrequency: '0.8 per customer per month (engaged)',
    lastInteraction: 'Last 7 days (very engaged)'
  },
  expansionSignals: {
    askingForPremium: '5 (28%)',
    wouldPayMore: '8 (44%)',
    dailyUsage: '16 (89%)',
    integrations: '12 (67%)'
  }
};

const healthMetrics: HealthMetric[] = [
  {
    tier: 'Starter',
    mrr: 625,
    customers: 25,
    churn: '0.5%',
    growth: '+8% YoY',
    status: 'green'
  },
  {
    tier: 'Growth',
    mrr: 1782,
    customers: 18,
    churn: '0%',
    growth: '+50% YoY',
    status: 'green'
  }
];

const researchTemplates = [
  {
    name: '5-Question Customer Interview Script',
    description: 'The 5 questions from Step 2',
    format: 'PDF, 1 page, 15-minute call',
    lastVersion: 'Jan 2026'
  },
  {
    name: 'Value Quantification Template (Excel)',
    description: 'Calculation sheet for estimating customer value',
    format: 'Plug in: hours saved, hourly rate, revenue impact',
    lastVersion: 'Jan 2026'
  },
  {
    name: 'Monthly Metrics Tracker (Excel)',
    description: 'Track: MRR, customers, churn, satisfaction',
    format: 'Updates monthly; shows trends',
    lastVersion: 'Jan 2026'
  }
];

// ============================================================================
// COMPONENTS
// ============================================================================

function TierHeader({ tier, valueQuantification, valueCapture }: {
  tier: PricingTier;
  valueQuantification: ValueQuantification;
  valueCapture: ValueCapture;
}) {
  const isStarter = tier.color === 'amber';
  const accentColor = isStarter ? 'amber' : 'emerald';

  return (
    <div className="relative overflow-hidden">
      {/* Diagonal accent bar */}
      <div className={`absolute -left-8 top-0 bottom-0 w-2 bg-${accentColor}-500 transform -skew-y-3`} />

      <div className="pl-8 pr-6 py-8 bg-gradient-to-br from-slate-50 to-white border-b-4 border-slate-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[15px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {tier.name} Tier
            </div>
            <div className="text-6xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {tier.price}
            </div>
            <div className="text-base text-slate-600 font-medium" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Why this price?
            </div>
          </div>

          {/* Value capture pill */}
          <div className={`px-6 py-3 rounded-full bg-${accentColor}-50 border-2 border-${accentColor}-200`}>
            <div className="text-[15px] font-bold text-slate-600 uppercase tracking-wider mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Value Capture
            </div>
            <div className={`text-4xl font-black text-${accentColor}-700 tabular-nums`} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {valueCapture.capturePercent}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ValueQuantificationSection({ data, tier }: { data: ValueQuantification; tier: PricingTier }) {
  const isStarter = tier.color === 'amber';
  const accentColor = isStarter ? 'amber' : 'emerald';

  const monthlyValue = (data.timePerWeek * 4 * data.hourlyRate) + (data.revenueImpact || 0);
  const timeValue = data.timePerWeek * 4 * data.hourlyRate;

  return (
    <div className="px-8 py-8 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-8 h-1 bg-${accentColor}-500`} />
        <h3 className="font-serif text-base font-black text-slate-900 uppercase tracking-[0.15em]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Step 1: Value Quantification
        </h3>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-[15px] font-bold text-slate-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            What problem does {tier.name} solve?
          </div>
          <div className="text-lg text-slate-800 font-medium" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            └─ {data.problemSolved}
          </div>
        </div>

        <div>
          <div className="text-[15px] font-bold text-slate-500 uppercase tracking-wider mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            What's that worth?
          </div>
          <div className="pl-4 space-y-2 text-base text-slate-700" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-500">└─</span>
              <span>{data.timePerWeek} hrs/week × 4 weeks × ${data.hourlyRate}/hr {data.revenueImpact ? '(loaded team cost)' : '(freelancer rate)'}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-500">└─</span>
              <span>= ${monthlyValue.toLocaleString()}/month = ${data.totalValuePerYear.toLocaleString()}/year in value</span>
            </div>
            {data.revenueImpact && (
              <>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-slate-500">└─</span>
                  <span>Revenue uplift: "We close deals 20% faster" = ${data.revenueImpact}/mo uplift</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500">└─</span>
                  <span className="font-bold text-slate-900">Total value: ${timeValue * 12 + data.revenueImpact * 12}/year</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerValidationSection({ interviews, tier }: { interviews: CustomerInterview[]; tier: PricingTier }) {
  const isStarter = tier.color === 'amber';
  const accentColor = isStarter ? 'amber' : 'emerald';

  return (
    <div className="px-8 py-8 bg-slate-50 border-b border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-8 h-1 bg-${accentColor}-500`} />
        <h3 className="font-serif text-base font-black text-slate-900 uppercase tracking-[0.15em]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Step 2: Customer Validation ({interviews.length + 1} customers interviewed)
        </h3>
      </div>

      <div className="space-y-6">
        {interviews.map((interview, idx) => (
          <div key={idx} className="bg-white rounded-lg p-6 border-l-4 border-slate-300 shadow-sm">
            <div className="text-base font-bold text-slate-900 mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Q: "{interview.question}"
            </div>
            <div className="space-y-2 mb-4">
              {interview.responses.map((response, ridx) => (
                <div key={ridx} className="text-base text-slate-700 flex items-start gap-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  <span className="text-slate-400">└─</span>
                  <span>{response}</span>
                </div>
              ))}
            </div>
            <div className={`text-base font-bold text-${accentColor}-700 flex items-start gap-2`} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              <span className="text-slate-400">└─</span>
              <span>{interview.insight}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ValueCaptureSection({ data, tier }: { data: ValueCapture; tier: PricingTier }) {
  const isStarter = tier.color === 'amber';
  const accentColor = isStarter ? 'amber' : 'emerald';

  return (
    <div className="px-8 py-8 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-8 h-1 bg-${accentColor}-500`} />
        <h3 className="font-serif text-base font-black text-slate-900 uppercase tracking-[0.15em]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Step 3: Value Capture Analysis
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="text-[15px] font-bold text-slate-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Estimated customer value
          </div>
          <div className="text-3xl font-black text-slate-900 tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            ${data.customerValue.toLocaleString()}/year
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="text-[15px] font-bold text-slate-500 uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Current price
          </div>
          <div className="text-3xl font-black text-slate-900 tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            ${data.yourPrice.toLocaleString()}/year
          </div>
        </div>

        <div className={`bg-${accentColor}-50 rounded-lg p-6 border-2 border-${accentColor}-300`}>
          <div className="text-[15px] font-bold text-slate-600 uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Value capture
          </div>
          <div className={`text-3xl font-black text-${accentColor}-700 tabular-nums`} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {data.capturePercent}%
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
        <div className="text-[15px] font-bold text-blue-700 uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Interpretation
        </div>
        <div className="text-base text-blue-900 leading-relaxed" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {data.interpretation}
        </div>
      </div>
    </div>
  );
}

function DecisionSection({ decision, tier }: { decision: Decision; tier: PricingTier }) {
  const isStarter = tier.color === 'amber';
  const accentColor = isStarter ? 'amber' : 'emerald';

  return (
    <div className="px-8 py-8 bg-slate-900 text-white">
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-8 h-1 bg-${accentColor}-400`} />
        <h3 className="font-serif text-base font-black uppercase tracking-[0.15em]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Decision
        </h3>
      </div>

      <div className="space-y-6">
        <div>
          <div className="text-[15px] font-bold text-slate-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Current assessment
          </div>
          <div className="text-2xl font-bold text-white" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            {decision.currentAssessment}
          </div>
        </div>

        <div>
          <div className="text-[15px] font-bold text-slate-400 uppercase tracking-wider mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Why not raise immediately?
          </div>
          <div className="text-base text-slate-300 flex items-start gap-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            <span>└─</span>
            <span>{decision.whyNotRaise}</span>
          </div>
        </div>

        <div className={`bg-${accentColor}-500/10 border-2 border-${accentColor}-500/30 rounded-lg p-6`}>
          <div className={`text-[15px] font-bold text-${accentColor}-300 uppercase tracking-wider mb-3`} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Next action
          </div>
          <div className={`text-lg font-medium text-${accentColor}-50 leading-relaxed`} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            └─ {decision.nextAction}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActualDataSection({ data, tier }: { data: ActualData; tier: PricingTier }) {
  const isStarter = tier.color === 'amber';
  const accentColor = isStarter ? 'amber' : 'emerald';

  return (
    <div className="px-8 py-8 bg-gradient-to-br from-slate-50 to-white border-b border-slate-200">
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-8 h-1 bg-${accentColor}-500`} />
        <h3 className="font-serif text-base font-black text-slate-900 uppercase tracking-[0.15em]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          {tier.name} Segment — Actual Data
        </h3>
      </div>

      {/* Financial Metrics */}
      <div className="mb-8">
        <div className="text-[15px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Financial Metrics
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Current price</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{data.financial.currentPrice}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Customers</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{data.financial.customers}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>MRR</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>${data.financial.mrr}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>ARR</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>${data.financial.arr}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>CAC</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>${data.financial.cac}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>CAC payback</div>
            <div className="text-2xl font-black text-slate-900" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{data.financial.cacPayback}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Gross margin</div>
            <div className="text-2xl font-black text-slate-900" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{data.financial.grossMargin}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
            <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Rev/cust/yr</div>
            <div className="text-2xl font-black text-slate-900 tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>${data.financial.revenuePerCustomerPerYear}</div>
          </div>
        </div>
      </div>

      {/* Churn & Retention */}
      <div className="mb-8">
        <div className="text-[15px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Churn & Retention
        </div>
        <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Last 12 months</div>
              <div className="text-lg font-bold text-slate-900" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{data.churnRetention.customersLast12Months}</div>
            </div>
            <div>
              <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Monthly churn</div>
              <div className="text-lg font-bold text-slate-900" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{data.churnRetention.monthlyChurn}</div>
            </div>
            <div>
              <div className="text-[15px] text-slate-500 mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Annual retention</div>
              <div className="text-lg font-bold text-emerald-700" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{data.churnRetention.annualRetention}</div>
            </div>
          </div>

          {data.churnRetention.churnReasons.length > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="text-[15px] font-bold text-slate-500 uppercase tracking-wider mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                Churn reasons (last 3 churned customers)
              </div>
              <div className="space-y-2">
                {data.churnRetention.churnReasons.map((reason, idx) => (
                  <div key={idx} className="text-base text-slate-700 flex items-start gap-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    <span className="text-slate-400">└─</span>
                    <span>{reason.reason}: {reason.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Profile & Satisfaction in 2 columns */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="text-[15px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Customer Profile
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm space-y-3 text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            <div>
              <span className="text-slate-500 font-semibold">Typical customer:</span>{' '}
              <span className="text-slate-900">{data.customerProfile.typical}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Company size:</span>{' '}
              <span className="text-slate-900">{data.customerProfile.size}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Business type:</span>{' '}
              <span className="text-slate-900">{data.customerProfile.businessType}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Problem solved:</span>{' '}
              <span className="text-slate-900">{data.customerProfile.problemSolved}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Value perception:</span>{' '}
              <span className="text-slate-900">{data.customerProfile.valuePerception}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Willing to pay:</span>{' '}
              <span className="text-slate-900 font-bold">{data.customerProfile.willingToPay}</span>
            </div>
          </div>
        </div>

        <div>
          <div className="text-[15px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Satisfaction & Engagement
          </div>
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm space-y-3 text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            <div>
              <span className="text-slate-500 font-semibold">NPS:</span>{' '}
              <span className="text-slate-900">{data.satisfaction.nps}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">"Would recommend":</span>{' '}
              <span className="text-slate-900">{data.satisfaction.wouldRecommend}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Feature adoption:</span>{' '}
              <span className="text-slate-900">{data.satisfaction.featureAdoption}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Support frequency:</span>{' '}
              <span className="text-slate-900">{data.satisfaction.supportFrequency}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Last interaction:</span>{' '}
              <span className="text-slate-900">{data.satisfaction.lastInteraction}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expansion signals for Growth tier */}
      {data.expansionSignals && (
        <div className="mt-6">
          <div className="text-[15px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Expansion Signals
          </div>
          <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-200">
            <div className="grid grid-cols-2 gap-4 text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              <div>
                <span className="text-emerald-700 font-semibold">Asking for premium features:</span>{' '}
                <span className="text-emerald-900 font-bold">{data.expansionSignals.askingForPremium}</span>
              </div>
              <div>
                <span className="text-emerald-700 font-semibold">"Would pay more for X":</span>{' '}
                <span className="text-emerald-900 font-bold">{data.expansionSignals.wouldPayMore}</span>
              </div>
              <div>
                <span className="text-emerald-700 font-semibold">Using product daily:</span>{' '}
                <span className="text-emerald-900 font-bold">{data.expansionSignals.dailyUsage}</span>
              </div>
              <div>
                <span className="text-emerald-700 font-semibold">Integrated with other tools:</span>{' '}
                <span className="text-emerald-900 font-bold">{data.expansionSignals.integrations}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HealthDashboard({ metrics }: { metrics: HealthMetric[] }) {
  const totalMRR = metrics.reduce((sum, m) => sum + m.mrr, 0);
  const totalCustomers = metrics.reduce((sum, m) => sum + m.customers, 0);

  return (
    <div className="bg-slate-900 text-white px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-1 bg-emerald-400" />
        <h3 className="font-serif text-base font-black uppercase tracking-[0.15em]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          At-A-Glance Health Metrics
        </h3>
      </div>

      {/* Individual tier health */}
      <div className="space-y-6 mb-8">
        {metrics.map((metric, idx) => {
          const statusConfig = {
            green: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-300', icon: CheckCircle2, label: 'Green — Healthy' },
            yellow: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-300', icon: AlertCircle, label: 'Yellow — Watch' },
            red: { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-300', icon: TrendingDown, label: 'Red — Action Needed' }
          };

          const config = statusConfig[metric.status];
          const Icon = config.icon;

          return (
            <div key={idx} className={`${config.bg} border-2 ${config.border} rounded-lg p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-2xl font-black uppercase tracking-wide" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  {metric.tier} Tier
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border ${config.border}`}>
                  <Icon className={`w-4 h-4 ${config.text}`} />
                  <span className={`text-[15px] font-bold ${config.text}`} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                    {config.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                <div>
                  <div className="text-slate-400 mb-1">MRR</div>
                  <div className="text-2xl font-black tabular-nums">${metric.mrr}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">Customers</div>
                  <div className="text-2xl font-black tabular-nums">{metric.customers}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">Churn</div>
                  <div className="text-2xl font-black">{metric.churn}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">Growth</div>
                  <div className="text-2xl font-black text-emerald-300">{metric.growth}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Portfolio level */}
      <div className="border-t-2 border-white/20 pt-8">
        <div className="text-[15px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Portfolio Level
        </div>
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-white/5 rounded-lg p-5 border border-white/10">
            <div className="text-[15px] text-slate-400 mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Total MRR</div>
            <div className="text-3xl font-black tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>${totalMRR}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-5 border border-white/10">
            <div className="text-[15px] text-slate-400 mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Total Customers</div>
            <div className="text-3xl font-black tabular-nums" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>{totalCustomers}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-5 border border-white/10">
            <div className="text-[15px] text-slate-400 mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Avg Churn</div>
            <div className="text-3xl font-black" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>0.25%</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-5 border-2 border-emerald-500/30">
            <div className="text-[15px] text-emerald-300 mb-2 font-bold" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Status</div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div className="text-3xl font-black text-emerald-300" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>Green</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResearchTemplatesSection({ templates }: { templates: typeof researchTemplates }) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-8 py-10 border-t-4 border-amber-400">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-1 bg-amber-500" />
        <h3 className="font-serif text-base font-black text-slate-900 uppercase tracking-[0.15em]" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Download Research Templates — Stay Current
        </h3>
      </div>

      <div className="bg-white rounded-lg p-6 border-2 border-amber-200 mb-6 shadow-lg">
        <div className="text-[15px] font-bold text-amber-700 uppercase tracking-wider mb-3" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Do these again when:
        </div>
        <ul className="space-y-2 text-base text-slate-700" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            <span>You add a new feature and want to know if you can charge more</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            <span>You haven't talked to customers in 3 months</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            <span>You're considering a price change</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500">•</span>
            <span>Churn suddenly spikes</span>
          </li>
        </ul>
      </div>

      <div className="space-y-4 mb-8">
        {templates.map((template, idx) => (
          <div key={idx} className="bg-white rounded-lg p-6 border-l-4 border-amber-400 shadow-md hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-lg font-black text-slate-900 mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  📥 {template.name}
                </div>
                <div className="text-base text-slate-600 mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  └─ {template.description}
                </div>
                <div className="text-base text-slate-600" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
                  └─ {template.format}
                </div>
              </div>
              <button className="ml-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-base transition-colors flex items-center gap-2 shadow-md">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            <div className="text-[15px] text-slate-500" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Last version: {template.lastVersion}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 text-white rounded-lg p-8 shadow-2xl">
        <div className="text-[15px] font-bold text-amber-300 uppercase tracking-[0.15em] mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
          Quick Actions
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md border-2 border-white/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-3 h-3 bg-white/20 rounded-sm" />
            </div>
            <div className="flex-1 text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              <div className="font-bold mb-1">Next step: Call 5 Starter customers (next 2 weeks)</div>
              <div className="text-slate-300 space-y-1 ml-4">
                <div>└─ Use script above</div>
                <div>└─ Record notes</div>
                <div>└─ Update "Extracted Data" section with findings</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md border-2 border-white/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-3 h-3 bg-white/20 rounded-sm" />
            </div>
            <div className="flex-1 text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              <div className="font-bold mb-1">Test price change (this month or next)</div>
              <div className="text-slate-300 space-y-1 ml-4">
                <div>└─ If testing $49 Starter: Announce to new signups</div>
                <div>└─ Track cohort separately in metrics tracker</div>
                <div>└─ Review churn in 60 days</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md border-2 border-white/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="w-3 h-3 bg-white/20 rounded-sm" />
            </div>
            <div className="flex-1 text-base" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              <div className="font-bold mb-1">Update dashboard monthly (every month end)</div>
              <div className="text-slate-300 space-y-1 ml-4">
                <div>└─ New customers, MRR, churn numbers</div>
                <div>└─ Any customer feedback to note?</div>
                <div>└─ Should anything change?</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PricingStrategyRedesign() {
  const [expandedTier, setExpandedTier] = useState<'starter' | 'growth' | null>('starter');

  return (
    <div className="min-h-screen bg-white">
      {/* Add Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700;900&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-8 py-16 border-b-8 border-amber-500">
        <div className="max-w-5xl">
          <div className="text-[15px] font-bold text-amber-300 uppercase tracking-[0.3em] mb-4" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            Pricing Intelligence Framework
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Crimson Pro, serif' }}>
            Pricing Strategy: Why These Numbers?
          </h1>
          <p className="text-2xl text-slate-300 leading-relaxed max-w-3xl" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
            A systematic approach to pricing decisions. From value quantification to customer validation,
            see the evidence behind each price point and the strategic decisions that follow.
          </p>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="sticky top-0 z-10 bg-white border-b-2 border-slate-200 shadow-sm">
        <div className="flex">
          <button
            onClick={() => setExpandedTier(expandedTier === 'starter' ? null : 'starter')}
            className={`flex-1 px-8 py-5 font-black text-2xl tracking-wide transition-all border-b-4 ${
              expandedTier === 'starter'
                ? 'bg-amber-50 border-amber-500 text-slate-900'
                : 'bg-white border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-700'
            }`}
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <div className="flex items-center justify-center gap-3">
              <span>STARTER TIER — $25/month</span>
              {expandedTier === 'starter' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
          <button
            onClick={() => setExpandedTier(expandedTier === 'growth' ? null : 'growth')}
            className={`flex-1 px-8 py-5 font-black text-2xl tracking-wide transition-all border-b-4 ${
              expandedTier === 'growth'
                ? 'bg-emerald-50 border-emerald-500 text-slate-900'
                : 'bg-white border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-700'
            }`}
            style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}
          >
            <div className="flex items-center justify-center gap-3">
              <span>GROWTH TIER — $99/month</span>
              {expandedTier === 'growth' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>
        </div>
      </div>

      {/* Starter Tier Content */}
      {expandedTier === 'starter' && (
        <div className="border-l-8 border-amber-500">
          <TierHeader tier={starterTier} valueQuantification={starterValueQuantification} valueCapture={starterValueCapture} />
          <ValueQuantificationSection data={starterValueQuantification} tier={starterTier} />
          <CustomerValidationSection interviews={starterInterviews} tier={starterTier} />
          <ValueCaptureSection data={starterValueCapture} tier={starterTier} />
          <DecisionSection decision={starterDecision} tier={starterTier} />
          <ActualDataSection data={starterActualData} tier={starterTier} />
        </div>
      )}

      {/* Growth Tier Content */}
      {expandedTier === 'growth' && (
        <div className="border-l-8 border-emerald-500">
          <TierHeader tier={growthTier} valueQuantification={growthValueQuantification} valueCapture={growthValueCapture} />
          <ValueQuantificationSection data={growthValueQuantification} tier={growthTier} />
          <CustomerValidationSection interviews={growthInterviews} tier={growthTier} />
          <ValueCaptureSection data={growthValueCapture} tier={growthTier} />
          <DecisionSection decision={growthDecision} tier={growthTier} />
          <ActualDataSection data={growthActualData} tier={growthTier} />
        </div>
      )}

      {/* Health Dashboard */}
      <HealthDashboard metrics={healthMetrics} />

      {/* Research Templates */}
      <ResearchTemplatesSection templates={researchTemplates} />
    </div>
  );
}
