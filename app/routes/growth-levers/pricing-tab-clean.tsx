// Clean pricing strategy tab matching the design system
import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

// Import data from gtm.tsx
import type {
  PricingTier,
  ValueQuantification,
  CustomerInterview,
  ValueCapture,
  Decision,
  ActualData,
  HealthMetric
} from './gtm';

interface Props {
  starterTier: PricingTier;
  growthTier: PricingTier;
  starterValueQuantification: ValueQuantification;
  growthValueQuantification: ValueQuantification;
  starterInterviews: CustomerInterview[];
  growthInterviews: CustomerInterview[];
  starterValueCapture: ValueCapture;
  growthValueCapture: ValueCapture;
  starterDecision: Decision;
  growthDecision: Decision;
  starterActualData: ActualData;
  growthActualData: ActualData;
  healthMetrics: HealthMetric[];
}

export function PricingStrategyTabClean({
  starterValueQuantification,
  growthValueQuantification,
  starterInterviews,
  growthInterviews,
  starterValueCapture,
  growthValueCapture,
  starterDecision,
  growthDecision,
  starterActualData,
  growthActualData,
  healthMetrics
}: Props) {
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
