import { useState } from 'react';
import { Tabs, Tab } from "../../components/Tabs";
import {
  Share2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronRight, Download, Calendar, Users,
  DollarSign, Target, Clock, Award, FileText, BarChart3,
  LineChart, Zap, Shield, Activity, ChevronUp, AlertCircle
} from "lucide-react";

type TierStatus = 'optimized' | 'headroom' | 'underpriced';

interface TierOverview {
  id: string;
  name: string;
  price: string;
  status: TierStatus;
  mrr: number;
  customers: number;
  ltv: number;
  cacPayback: string;
  health: number;
}

interface ActionPlan {
  tier: string;
  decision: string;
  details: string;
  owner: string;
  timeline: string;
  investment?: string;
  successMetric: string;
  reviewDate: string;
  checklist: string[];
  contingency: string[];
}

interface EvidenceData {
  tier: string;
  wtpData?: string;
  sensitivity?: string;
  churnAnalysis?: string;
  winLoss?: string;
  expansion?: string;
  dealVariance?: string;
  valueCapture?: string;
  salesPatterns?: string;
  customerAcceptance?: string;
}

interface SegmentMetrics {
  tier: string;
  financial: {
    price: string;
    mrr: string;
    customers: number;
    cac: string;
    payback: string;
    margin: string;
  };
  churn: {
    annual: string;
    upgrade?: string;
    priceChurn: string;
  };
  expansion: {
    rate: string;
    avgValue: string;
    ltv: string;
  };
  profile: {
    size: string;
    revenue: string;
    useCase: string;
  };
  satisfaction: {
    nps: number;
    goodValue: string;
    adoption?: string;
    concerns?: string;
  };
  dealVariance?: {
    range: string;
    variance: string;
    bySize: { segment: string; avg: string }[];
  };
  sales?: {
    cycle: string;
    closeRate: string;
    negotiation: string;
  };
}

const tierOverviews: TierOverview[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$500/mo',
    status: 'underpriced',
    mrr: 285000,
    customers: 47,
    ltv: 8500,
    cacPayback: '8 months',
    health: 65
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$2,000/mo',
    status: 'optimized',
    mrr: 408000,
    customers: 170,
    ltv: 42600,
    cacPayback: '3 months',
    health: 92
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$8,000/mo',
    status: 'headroom',
    mrr: 256000,
    customers: 32,
    ltv: 96000,
    cacPayback: '2 months',
    health: 78
  }
];

const actionPlans: ActionPlan[] = [
  {
    tier: 'Starter',
    decision: 'Test price increase from $500 to $650/mo',
    details: 'WTP research shows headroom; churn is not price-driven',
    owner: 'Growth/Product Ops',
    timeline: 'A/B test launching Feb 20',
    successMetric: 'Churn stays ≤20%',
    reviewDate: 'May 20, 2026',
    checklist: [
      'Sales team briefing scheduled for Feb 15',
      'Update pricing page with A/B test variants',
      'Set up conversion tracking and churn monitoring',
      'Prepare customer satisfaction surveys',
      'Document test parameters and success criteria'
    ],
    contingency: [
      'If churn exceeds 22%: Pause test immediately',
      'If close rate drops >15%: Offer bridge pricing at $575/mo',
      'If NPS drops below 30: Revert to $500/mo and add value instead'
    ]
  },
  {
    tier: 'Growth',
    decision: 'Hold at $2,000/mo and invest in expansion features',
    details: 'Raising price kills Enterprise pipeline; expansion features have higher ROI',
    owner: 'Product Manager / Engineering',
    timeline: 'Q2–Q3 2026',
    investment: '$80,000 development',
    successMetric: 'Expansion rate grows from 28% to 32% by Q4',
    reviewDate: 'Oct 15, 2026',
    checklist: [
      'Ship advanced reporting module (Q2)',
      'Launch API access tier (Q2)',
      'Deploy custom integrations framework (Q3)',
      'Create marketing campaign for new features',
      'Set up feature adoption tracking dashboard'
    ],
    contingency: [
      'If expansion rate doesn\'t hit 30% by Q3: Accelerate Enterprise migration incentives',
      'If feature adoption <60%: Run user research on friction points',
      'If development runs over budget: De-scope custom integrations to Q4'
    ]
  },
  {
    tier: 'Enterprise',
    decision: 'Pilot value-based pricing (2% of incremental revenue)',
    details: 'Current deals vary 3.3x ($4.5k–$15k); capturing only 0.8% of customer value',
    owner: 'Sales / CFO / Revenue Operations',
    timeline: 'Pilot with 5 new deals March–April',
    successMetric: 'Close rate ≥80%, customer satisfaction ≥8/10',
    reviewDate: 'May 15, 2026 (Decision Gate)',
    checklist: [
      'Create value-based pricing calculator tool',
      'Train sales team on value articulation (March 1)',
      'Develop sample pitch decks with ROI models',
      'Set up monthly measurement dashboard',
      'Prepare contract templates for value-based terms'
    ],
    contingency: [
      'If close rate <70%: Offer hybrid model (base + % revenue)',
      'If customers reject concept: Revert to tiered custom pricing with tighter bands',
      'If pilot shows promise but needs refinement: Extend pilot to 10 deals through Q2'
    ]
  }
];

const evidenceData: EvidenceData[] = [
  {
    tier: 'Starter',
    wtpData: 'WTP band: $700–1,400/mo (current $500 is below band)',
    sensitivity: 'Price elasticity: -0.8 (moderately sensitive)',
    churnAnalysis: '18% annual churn: 12% upgrade to Growth, 6% feature gaps, 0% price-driven',
    winLoss: '62% of lost deals mention price, but threshold is "$500–600 is our limit"'
  },
  {
    tier: 'Growth',
    expansion: '28% upgrade to Enterprise in 18 months avg, +$6k/mo value',
    sensitivity: 'Test at $2,500/mo: close rate dropped 45% → 38% (elasticity -0.8)',
    wtpData: 'Top feature requests: Advanced reporting (40%), API access (33%), Custom integrations (30%)',
    churnAnalysis: 'LTV comparison: Hold at $2k = $44.2k LTV vs. raise to $2.5k = $48.1k LTV (loses volume)'
  },
  {
    tier: 'Enterprise',
    dealVariance: 'Range: $4.5k–$15k with median $8k (variance 3.3x)',
    valueCapture: 'Value capture: Smallest 18%, Median 0.8%, Largest 3.5% of customer value',
    salesPatterns: '50% of deals negotiate down 12% average; no pricing framework',
    customerAcceptance: '88% accept value-based pricing concept, 9% maybe, 3% no'
  }
];

const segmentMetrics: SegmentMetrics[] = [
  {
    tier: 'Starter',
    financial: {
      price: '$500/mo',
      mrr: '$285k',
      customers: 47,
      cac: '$1,000',
      payback: '8 months',
      margin: '70%'
    },
    churn: {
      annual: '18%',
      upgrade: '12% to Growth',
      priceChurn: '0% price-driven'
    },
    expansion: {
      rate: '12%',
      avgValue: '+$1,500/mo',
      ltv: '$8,500'
    },
    profile: {
      size: '5 employees',
      revenue: '$200k–500k ARR',
      useCase: 'Manual data entry reduction'
    },
    satisfaction: {
      nps: 38,
      goodValue: '91%',
      concerns: '9% say "bit pricey"'
    }
  },
  {
    tier: 'Growth',
    financial: {
      price: '$2,000/mo',
      mrr: '$408k',
      customers: 170,
      cac: '$800',
      payback: '3 months',
      margin: '75%'
    },
    churn: {
      annual: '7%',
      upgrade: '28% to Enterprise',
      priceChurn: '0% price-driven'
    },
    expansion: {
      rate: '28%',
      avgValue: '+$6,000/mo',
      ltv: '$42,600'
    },
    profile: {
      size: '25 employees',
      revenue: '$2M–10M ARR',
      useCase: 'Process automation + analytics'
    },
    satisfaction: {
      nps: 54,
      goodValue: '92%',
      adoption: '85% feature adoption',
      concerns: '7% say "expensive"'
    }
  },
  {
    tier: 'Enterprise',
    financial: {
      price: 'Custom (median $8k/mo)',
      mrr: '$256k',
      customers: 32,
      cac: '$8,000',
      payback: '2 months',
      margin: '80%'
    },
    churn: {
      annual: '3%',
      priceChurn: '0% price-driven'
    },
    expansion: {
      rate: '22% YoY',
      avgValue: 'Seats + features',
      ltv: '$96,000'
    },
    profile: {
      size: '150+ employees',
      revenue: '$5M–50M+ ARR',
      useCase: 'Operational transformation (2 FTE replacement + revenue cycle)'
    },
    satisfaction: {
      nps: 52,
      goodValue: '66%',
      concerns: '9% say they overpaid'
    },
    dealVariance: {
      range: '$4.5k–$15k/mo',
      variance: '3.3x',
      bySize: [
        { segment: '$5M–10M ARR', avg: '$6,000/mo' },
        { segment: '$10M–50M ARR', avg: '$9,500/mo' },
        { segment: '$50M+ ARR', avg: '$12,300/mo' }
      ]
    },
    sales: {
      cycle: '4.2 months',
      closeRate: '34%',
      negotiation: '50% negotiate down 12% avg'
    }
  }
];

const researchTemplates = [
  {
    name: 'Van Westendorp WTP Survey',
    description: 'Determine optimal pricing ranges using the Price Sensitivity Meter methodology',
    format: 'Excel / Typeform',
    size: '2MB',
    duration: '15-20 minutes',
    frequency: 'Quarterly',
    lastUpdated: 'Jan 2026',
    sampleSize: 'n=180'
  },
  {
    name: 'Value Discovery Interview Script',
    description: 'Quantify customer value through structured interviews',
    format: 'PDF',
    size: '2 pages',
    duration: '30 minutes',
    frequency: 'Ongoing',
    lastUpdated: 'Jan 2026',
    sampleSize: 'n=45'
  },
  {
    name: 'Price Sensitivity Survey',
    description: 'Measure elasticity and willingness to pay at different price points',
    format: 'Google Form / Typeform',
    size: '1MB',
    duration: '10 minutes',
    frequency: 'Bi-annual',
    lastUpdated: 'Dec 2025',
    sampleSize: 'n=203'
  },
  {
    name: 'Win/Loss Interview Script',
    description: 'Understand why prospects chose you or competitors',
    format: 'PDF',
    size: '2 pages',
    duration: '15 minutes',
    frequency: 'Ongoing',
    lastUpdated: 'Jan 2026',
    sampleSize: 'n=72'
  },
  {
    name: 'Churn Exit Interview',
    description: 'Identify real reasons for customer departure',
    format: 'PDF',
    size: '1 page',
    duration: '10 minutes',
    frequency: 'Ongoing',
    lastUpdated: 'Jan 2026',
    sampleSize: 'n=38'
  },
  {
    name: 'Competitive Pricing Tracker',
    description: 'Monitor competitor pricing and positioning changes',
    format: 'Excel',
    size: '3MB',
    duration: 'Monthly update',
    frequency: 'Monthly',
    lastUpdated: 'Feb 2026',
    sampleSize: '12 competitors'
  }
];

// ============================================================================
// PRICING STRATEGY DATA & COMPONENTS (New Redesign)
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

const researchTemplatesNew = [
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

// Component: Tier Header
function TierHeader({ tier, valueCapture }: { tier: PricingTier; valueCapture: ValueCapture }) {
  const accentColor = tier.color;

  return (
    <div className="relative overflow-hidden">
      <div className={`absolute -left-8 top-0 bottom-0 w-2 bg-${accentColor}-500 transform -skew-y-3`} />

      <div className="pl-8 pr-6 py-8 bg-gradient-to-br from-slate-50 to-white border-b-4 border-slate-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-2" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {tier.name} Tier
            </div>
            <div className="text-5xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Crimson Pro, serif' }}>
              {tier.price}
            </div>
            <div className="text-sm text-slate-600 font-medium" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Why this price?
            </div>
          </div>

          <div className={`px-6 py-3 rounded-full bg-${accentColor}-50 border-2 border-${accentColor}-200`}>
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1" style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              Value Capture
            </div>
            <div className={`text-3xl font-black text-${accentColor}-700 tabular-nums`} style={{ fontFamily: 'IBM Plex Sans, sans-serif' }}>
              {valueCapture.capturePercent}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Old status badge and health bar - keeping for backwards compatibility if needed elsewhere
function StatusBadge({ status }: { status: TierStatus }) {
  const config = {
    optimized: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30', label: 'Optimized', icon: CheckCircle2 },
    headroom: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30', label: 'Headroom', icon: TrendingUp },
    underpriced: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500/30', label: 'Underpriced', icon: AlertTriangle }
  };

  const { bg, text, border, label, icon: Icon } = config[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border ${bg} ${text} ${border} uppercase tracking-wider`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}

function HealthBar({ value, status }: { value: number; status: TierStatus }) {
  const colorClass = status === 'optimized' ? 'bg-emerald-500' : status === 'headroom' ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Health Score</span>
        <span className="text-sm font-bold text-slate-900 tabular-nums">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-1000 ease-out rounded-full`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function PricingStrategyTab() {
  const [expandedTier, setExpandedTier] = useState<'starter' | 'growth' | null>('starter');

  return (
    <div className="space-y-8">
      {/* Tier Selector */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setExpandedTier(expandedTier === 'starter' ? null : 'starter')}
          className={`px-6 py-4 rounded-lg border transition-all text-left ${
            expandedTier === 'starter'
              ? 'bg-surface border-accent'
              : 'bg-surface-hover border-edge hover:border-accent/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-ink-muted uppercase tracking-wide mb-1">Starter Tier</div>
              <div className="text-xl font-semibold text-ink">$25/month</div>
            </div>
            {expandedTier === 'starter' ? <ChevronUp className="w-5 h-5 text-ink-secondary" /> : <ChevronDown className="w-5 h-5 text-ink-secondary" />}
          </div>
        </button>
        <button
          onClick={() => setExpandedTier(expandedTier === 'growth' ? null : 'growth')}
          className={`px-6 py-4 rounded-lg border transition-all text-left ${
            expandedTier === 'growth'
              ? 'bg-surface border-accent'
              : 'bg-surface-hover border-edge hover:border-accent/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-ink-muted uppercase tracking-wide mb-1">Growth Tier</div>
              <div className="text-xl font-semibold text-ink">$99/month</div>
            </div>
            {expandedTier === 'growth' ? <ChevronUp className="w-5 h-5 text-ink-secondary" /> : <ChevronDown className="w-5 h-5 text-ink-secondary" />}
          </div>
        </button>
      </div>

      {/* Starter Tier Content */}
      {expandedTier === 'starter' && (
        <div className="space-y-6 animate-in">
          {/* Overview */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-ink mb-2">Starter — $25/month</h3>
                <p className="text-sm text-ink-secondary">Value capture: {starterValueCapture.capturePercent}%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Problem Solved</div>
                <p className="text-sm text-ink-secondary">{starterValueQuantification.problemSolved}</p>
              </div>

              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Estimated Value</div>
                <p className="text-sm text-ink-secondary">
                  {starterValueQuantification.timePerWeek} hrs/week × 4 weeks × ${starterValueQuantification.hourlyRate}/hr =
                  ${starterValueQuantification.totalValuePerYear.toLocaleString()}/year
                </p>
              </div>
            </div>
          </div>

          {/* Customer Validation */}
          <div className="card">
            <h4 className="text-sm font-semibold text-ink mb-4">Customer Validation (4 interviews)</h4>
            <div className="space-y-4">
              {starterInterviews.map((interview, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-base border border-edge">
                  <div className="text-sm font-semibold text-ink mb-2">Q: {interview.question}</div>
                  <div className="space-y-1 mb-2">
                    {interview.responses.map((response, ridx) => (
                      <div key={ridx} className="text-xs text-ink-secondary">{response}</div>
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-accent">{interview.insight}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision */}
          <div className="card">
            <h4 className="text-sm font-semibold text-ink mb-4">Strategic Decision</h4>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Assessment</div>
                <p className="text-sm text-ink-secondary">{starterDecision.currentAssessment}</p>
              </div>
              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Why Not Raise?</div>
                <p className="text-sm text-ink-secondary">{starterDecision.whyNotRaise}</p>
              </div>
              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Next Action</div>
                <p className="text-sm text-accent font-medium">{starterDecision.nextAction}</p>
              </div>
            </div>
          </div>

          {/* Actual Data */}
          <div className="card">
            <h4 className="text-sm font-semibold text-ink mb-4">Actual Segment Data</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-ink-muted mb-1">Customers</div>
                <div className="text-xl font-semibold text-ink">{starterActualData.financial.customers}</div>
              </div>
              <div>
                <div className="text-xs text-ink-muted mb-1">MRR</div>
                <div className="text-xl font-semibold text-ink">${starterActualData.financial.mrr}</div>
              </div>
              <div>
                <div className="text-xs text-ink-muted mb-1">Churn</div>
                <div className="text-xl font-semibold text-success">{starterActualData.churnRetention.monthlyChurn}</div>
              </div>
              <div>
                <div className="text-xs text-ink-muted mb-1">Retention</div>
                <div className="text-xl font-semibold text-success">{starterActualData.churnRetention.annualRetention}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Growth Tier Content */}
      {expandedTier === 'growth' && (
        <div className="space-y-6 animate-in">
          {/* Overview */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-ink mb-2">Growth — $99/month</h3>
                <p className="text-sm text-ink-secondary">Value capture: {growthValueCapture.capturePercent}%</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Problem Solved</div>
                <p className="text-sm text-ink-secondary">{growthValueQuantification.problemSolved}</p>
              </div>

              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Estimated Value</div>
                <p className="text-sm text-ink-secondary">
                  {growthValueQuantification.timePerWeek} hrs/week × ${growthValueQuantification.hourlyRate}/hr +
                  ${growthValueQuantification.revenueImpact}/mo revenue = ${growthValueQuantification.totalValuePerYear.toLocaleString()}/year
                </p>
              </div>
            </div>
          </div>

          {/* Customer Validation */}
          <div className="card">
            <h4 className="text-sm font-semibold text-ink mb-4">Customer Validation (5 interviews)</h4>
            <div className="space-y-4">
              {growthInterviews.map((interview, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-base border border-edge">
                  <div className="text-sm font-semibold text-ink mb-2">Q: {interview.question}</div>
                  <div className="space-y-1 mb-2">
                    {interview.responses.map((response, ridx) => (
                      <div key={ridx} className="text-xs text-ink-secondary">{response}</div>
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-accent">{interview.insight}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision */}
          <div className="card">
            <h4 className="text-sm font-semibold text-ink mb-4">Strategic Decision</h4>
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Assessment</div>
                <p className="text-sm text-ink-secondary">{growthDecision.currentAssessment}</p>
              </div>
              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Why Not Raise?</div>
                <p className="text-sm text-ink-secondary">{growthDecision.whyNotRaise}</p>
              </div>
              <div>
                <div className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Next Action</div>
                <p className="text-sm text-accent font-medium">{growthDecision.nextAction}</p>
              </div>
            </div>
          </div>

          {/* Actual Data */}
          <div className="card">
            <h4 className="text-sm font-semibold text-ink mb-4">Actual Segment Data</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-ink-muted mb-1">Customers</div>
                <div className="text-xl font-semibold text-ink">{growthActualData.financial.customers}</div>
              </div>
              <div>
                <div className="text-xs text-ink-muted mb-1">MRR</div>
                <div className="text-xl font-semibold text-ink">${growthActualData.financial.mrr}</div>
              </div>
              <div>
                <div className="text-xs text-ink-muted mb-1">Churn</div>
                <div className="text-xl font-semibold text-success">{growthActualData.churnRetention.monthlyChurn}</div>
              </div>
              <div>
                <div className="text-xs text-ink-muted mb-1">Growth</div>
                <div className="text-xl font-semibold text-success">+50% YoY</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Health - Always visible */}
      <div className="card">
        <h3 className="text-lg font-semibold text-ink mb-6">Portfolio Health</h3>
        <div className="grid grid-cols-2 gap-6">
          {healthMetrics.map((metric, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-base border border-edge">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-ink">{metric.tier} Tier</h4>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-xs text-success font-semibold">Healthy</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-xs text-ink-muted mb-1">MRR</div>
                  <div className="font-semibold text-ink">${metric.mrr}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-muted mb-1">Customers</div>
                  <div className="font-semibold text-ink">{metric.customers}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-muted mb-1">Churn</div>
                  <div className="font-semibold text-success">{metric.churn}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-muted mb-1">Growth</div>
                  <div className="font-semibold text-success">{metric.growth}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default function GoToMarket() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Go-to-Market Strategy
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Pricing strategy, messaging, and market positioning
        </p>
      </div>

      <Tabs defaultTab={0}>
        {/* Pricing Strategy Tab */}
        <Tab label="Pricing Strategy">
          <PricingStrategyTab />
        </Tab>

        {/* Distribution Tab */}
        <Tab label="Distribution">
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-ink mb-4">Distribution Channels</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold text-ink mb-2">Organic Traffic</div>
                  <p className="text-sm text-ink-secondary">Coming soon...</p>
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink mb-2">Paid Traffic</div>
                  <p className="text-sm text-ink-secondary">Coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        </Tab>

      </Tabs>
    </div>
  );
}
