import { useLoaderData } from "react-router";
import { getPricingExperiments, getFeatureRollouts } from "../lib/operations.server";
import { getCohortAnalysis } from "../lib/data.server";
import type { PricingExperiment, FeatureRollout, CohortData } from "../types/dashboard";
import {
  Target,
  Shield,
  Zap,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface LoaderData {
  experiments: PricingExperiment[];
  features: FeatureRollout[];
  cohorts: CohortData[];
}

export async function loader() {
  const [experiments, features, cohorts] = await Promise.all([
    getPricingExperiments(),
    getFeatureRollouts(),
    getCohortAnalysis(),
  ]);

  return { experiments, features, cohorts };
}

function MoatScore({ score, label }: { score: number; label: string }) {
  const color =
    score >= 80
      ? "text-success"
      : score >= 50
      ? "text-warning"
      : "text-danger";

  const bgColor =
    score >= 80
      ? "bg-success"
      : score >= 50
      ? "bg-warning"
      : "bg-danger";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className={`text-sm font-mono font-semibold ${color}`}>{score}/100</span>
      </div>
      <div className="w-full h-2 rounded-full bg-edge">
        <div
          className={`h-2 rounded-full ${bgColor} transition-all duration-500`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
    </div>
  );
}

function InsightCard({ icon: Icon, title, insights, color }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  insights: { label: string; value: string; status: "good" | "warning" | "danger" }[];
  color: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.label} className="flex items-center justify-between">
            <span className="text-sm text-ink-muted">{insight.label}</span>
            <span className={`text-sm font-mono font-semibold ${
              insight.status === "good" ? "text-success" : insight.status === "warning" ? "text-warning" : "text-danger"
            }`}>
              {insight.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Strategy() {
  const { experiments, features, cohorts } = useLoaderData<LoaderData>();

  const completedExperiments = experiments.filter((e) => e.status === "completed");
  const winningExperiments = completedExperiments.filter((e) => e.winner !== null);
  const experimentWinRate = completedExperiments.length > 0
    ? (winningExperiments.length / completedExperiments.length) * 100
    : 0;
  const totalRevenueImpact = completedExperiments.reduce(
    (sum, e) => sum + (e.revenue_impact || 0), 0
  );
  const pricingPowerScore = Math.min(100, Math.round(
    experimentWinRate * 0.4 +
    (totalRevenueImpact > 0 ? 30 : 0) +
    (completedExperiments.length >= 3 ? 20 : completedExperiments.length * 7) +
    (experiments.filter((e) => e.status === "active").length > 0 ? 10 : 0)
  ));

  const productionFeatures = features.filter((f) => f.status === "production");
  const avgEngagement = productionFeatures.length > 0
    ? productionFeatures.reduce((sum, f) => sum + (f.engagement_score || 0), 0) / productionFeatures.length
    : 0;
  const avgAdoption = productionFeatures.length > 0
    ? productionFeatures.reduce((sum, f) => sum + (f.adoption_rate || 0), 0) / productionFeatures.length
    : 0;
  const differentiationScore = Math.min(100, Math.round(
    avgEngagement * 0.4 +
    avgAdoption * 0.3 +
    (features.filter((f) => f.status === "beta").length >= 2 ? 20 : features.filter((f) => f.status === "beta").length * 10) +
    (productionFeatures.length >= 5 ? 10 : productionFeatures.length * 2)
  ));

  const avgRetention = cohorts.length > 0
    ? cohorts.reduce((sum, c) => sum + c.retention_rate, 0) / cohorts.length
    : 0;
  const avgChurn = cohorts.length > 0
    ? cohorts.reduce((sum, c) => sum + c.churn_rate, 0) / cohorts.length
    : 0;
  const positiveRetentionImpact = productionFeatures.filter(
    (f) => (f.retention_impact || 0) > 0
  ).length;
  const defensibilityScore = Math.min(100, Math.round(
    (avgRetention > 0 ? avgRetention * 0.5 : 0) +
    (avgChurn < 10 ? 20 : avgChurn < 20 ? 10 : 0) +
    positiveRetentionImpact * 5 +
    (cohorts.length >= 6 ? 10 : 0)
  ));

  const overallMoatScore = Math.round(
    pricingPowerScore * 0.3 + differentiationScore * 0.35 + defensibilityScore * 0.35
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Strategy & Moat
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Competitive positioning — pricing power, differentiation, and defensibility
        </p>
      </div>

      {/* Overall Moat Score */}
      <div className="card animate-in stagger-1">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted uppercase tracking-wider">
              Overall Moat Strength
            </p>
            <p className={`text-4xl font-mono font-bold ${
              overallMoatScore >= 70 ? "text-success" : overallMoatScore >= 40 ? "text-warning" : "text-danger"
            }`}>
              {overallMoatScore}
              <span className="text-lg text-ink-muted font-normal">/100</span>
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <MoatScore score={pricingPowerScore} label="Pricing Power" />
          <MoatScore score={differentiationScore} label="Differentiation" />
          <MoatScore score={defensibilityScore} label="Defensibility" />
        </div>
      </div>

      {/* Three Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="animate-in stagger-2">
          <InsightCard
            icon={DollarSign}
            title="Pricing Power"
            color="bg-warning/10 text-warning"
            insights={[
              {
                label: "Experiment Win Rate",
                value: `${experimentWinRate.toFixed(0)}%`,
                status: experimentWinRate >= 50 ? "good" : experimentWinRate >= 30 ? "warning" : "danger",
              },
              {
                label: "Revenue Impact",
                value: `$${totalRevenueImpact.toLocaleString()}`,
                status: totalRevenueImpact > 0 ? "good" : "warning",
              },
              {
                label: "Active Tests",
                value: experiments.filter((e) => e.status === "active").length.toString(),
                status: experiments.filter((e) => e.status === "active").length > 0 ? "good" : "warning",
              },
            ]}
          />
        </div>

        <div className="animate-in stagger-3">
          <InsightCard
            icon={Zap}
            title="Differentiation"
            color="bg-accent/10 text-accent"
            insights={[
              {
                label: "Avg Engagement",
                value: `${avgEngagement.toFixed(0)}/100`,
                status: avgEngagement >= 70 ? "good" : avgEngagement >= 40 ? "warning" : "danger",
              },
              {
                label: "Feature Adoption",
                value: `${avgAdoption.toFixed(0)}%`,
                status: avgAdoption >= 60 ? "good" : avgAdoption >= 30 ? "warning" : "danger",
              },
              {
                label: "Production Features",
                value: productionFeatures.length.toString(),
                status: productionFeatures.length >= 5 ? "good" : productionFeatures.length >= 2 ? "warning" : "danger",
              },
            ]}
          />
        </div>

        <div className="animate-in stagger-4">
          <InsightCard
            icon={Shield}
            title="Defensibility"
            color="bg-success/10 text-success"
            insights={[
              {
                label: "Avg Retention",
                value: `${avgRetention.toFixed(1)}%`,
                status: avgRetention >= 80 ? "good" : avgRetention >= 60 ? "warning" : "danger",
              },
              {
                label: "Avg Churn",
                value: `${avgChurn.toFixed(1)}%`,
                status: avgChurn <= 5 ? "good" : avgChurn <= 15 ? "warning" : "danger",
              },
              {
                label: "Retention-Boosting Features",
                value: positiveRetentionImpact.toString(),
                status: positiveRetentionImpact >= 3 ? "good" : positiveRetentionImpact >= 1 ? "warning" : "danger",
              },
            ]}
          />
        </div>
      </div>

      {/* Strategic Assessment */}
      <div className="card animate-in stagger-5">
        <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
          <Target className="w-4 h-4 text-accent" />
          Strategic Assessment
        </h3>
        <div className="space-y-3">
          <div className={`flex items-start gap-3 p-3 rounded-lg ${
            pricingPowerScore >= 60 ? "bg-success/5 border border-success/10" : "bg-warning/5 border border-warning/10"
          }`}>
            {pricingPowerScore >= 60 ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-ink">Pricing Power</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {pricingPowerScore >= 60
                  ? `Strong pricing power with ${experimentWinRate.toFixed(0)}% experiment win rate. Continue testing pricing tiers to maximize revenue.`
                  : pricingPowerScore >= 30
                  ? `Moderate pricing power. Run more pricing experiments to validate willingness to pay and find optimal price points.`
                  : `Limited pricing evidence. Prioritize running pricing experiments to understand customer price sensitivity.`
                }
              </p>
            </div>
          </div>

          <div className={`flex items-start gap-3 p-3 rounded-lg ${
            differentiationScore >= 60 ? "bg-success/5 border border-success/10" : "bg-warning/5 border border-warning/10"
          }`}>
            {differentiationScore >= 60 ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-ink">Differentiation</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {differentiationScore >= 60
                  ? `Good differentiation with ${productionFeatures.length} production features at ${avgEngagement.toFixed(0)}% avg engagement. Focus on features with highest retention impact.`
                  : differentiationScore >= 30
                  ? `Building differentiation. Invest in features that increase engagement scores and drive adoption.`
                  : `Weak differentiation. Identify unique value propositions and build features that competitors can't easily replicate.`
                }
              </p>
            </div>
          </div>

          <div className={`flex items-start gap-3 p-3 rounded-lg ${
            defensibilityScore >= 60 ? "bg-success/5 border border-success/10" : "bg-warning/5 border border-warning/10"
          }`}>
            {defensibilityScore >= 60 ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-ink">Defensibility</p>
              <p className="text-xs text-ink-muted mt-0.5">
                {defensibilityScore >= 60
                  ? `Strong retention at ${avgRetention.toFixed(1)}% with ${positiveRetentionImpact} retention-boosting features. Business has meaningful switching costs.`
                  : defensibilityScore >= 30
                  ? `Moderate defensibility. Focus on reducing churn from ${avgChurn.toFixed(1)}% and increasing feature stickiness.`
                  : `Low defensibility. Prioritize retention improvements — investigate churn reasons and build sticky features.`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Features by Retention Impact */}
      {features.filter((f) => f.retention_impact != null).length > 0 && (
        <div className="card animate-in stagger-6">
          <h3 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" />
            Features by Retention Impact
          </h3>
          <div className="space-y-3">
            {features
              .filter((f) => f.retention_impact != null)
              .sort((a, b) => (b.retention_impact || 0) - (a.retention_impact || 0))
              .slice(0, 8)
              .map((feature) => (
                <div key={feature.id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    (feature.retention_impact || 0) > 2 ? "bg-success" :
                    (feature.retention_impact || 0) > 0 ? "bg-accent" : "bg-danger"
                  }`} />
                  <span className="text-sm text-ink flex-1 truncate">{feature.feature_name}</span>
                  <span className={`text-sm font-mono font-semibold ${
                    (feature.retention_impact || 0) >= 0 ? "text-success" : "text-danger"
                  }`}>
                    {(feature.retention_impact || 0) >= 0 ? "+" : ""}
                    {feature.retention_impact?.toFixed(1)}%
                  </span>
                  <span className="text-xs text-ink-muted">
                    {feature.adoption_rate?.toFixed(0)}% adopted
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
