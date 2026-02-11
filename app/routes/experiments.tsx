import { useState } from "react";
import {
  FlaskConical,
  Clock,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Plus,
} from "lucide-react";
import { ProgressBar } from "../components/ProgressBar";
import { ActionButton } from "../components/ActionButton";
import { experiments, type Experiment } from "../data/experiments";

function daysBetween(a: string, b: string) {
  return Math.ceil(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const [expanded, setExpanded] = useState(true);

  const totalDays = daysBetween(experiment.startDate, experiment.decisionDate);
  const elapsed = daysBetween(experiment.startDate, "2026-02-11");
  const progress = Math.min(Math.max((elapsed / totalDays) * 100, 0), 100);
  const daysLeft = Math.max(totalDays - elapsed, 0);

  const statusColors = {
    running: "border-accent/20",
    needs_decision: "border-warning/40",
    concluded: "border-edge opacity-60",
  };

  const statusBadge = {
    running: (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-semibold bg-accent/10 text-accent uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        Running
      </span>
    ),
    needs_decision: (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-semibold bg-warning/10 text-warning uppercase tracking-wider">
        <AlertCircle className="w-3 h-3" />
        Needs Decision
      </span>
    ),
    concluded: (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-2xs font-semibold bg-edge/50 text-ink-muted uppercase tracking-wider">
        Concluded
      </span>
    ),
  };

  return (
    <div className={`card ${statusColors[experiment.status]}`}>
      {/* Header */}
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            {statusBadge[experiment.status]}
            <span className="text-xs text-ink-muted">
              {experiment.business}
            </span>
          </div>
          <h3 className="text-base font-semibold text-ink">
            {experiment.title}
          </h3>
        </div>
        <ChevronRight
          className={`w-4 h-4 text-ink-muted shrink-0 ml-3 transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </div>

      {/* Expandable content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[600px] opacity-100 mt-5" : "max-h-0 opacity-0"
        }`}
      >
        {/* Hypothesis */}
        <div className="mb-5">
          <p className="text-2xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
            Hypothesis
          </p>
          <p className="text-sm text-ink-secondary leading-relaxed">
            {experiment.hypothesis}
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
            <span className="font-mono">
              Started{" "}
              {new Date(experiment.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysLeft}d to decision
            </span>
            <span className="font-mono">
              Decision{" "}
              {new Date(experiment.decisionDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <ProgressBar
            progress={progress}
            color={daysLeft <= 5 ? "warning" : "accent"}
            height={4}
          />
        </div>

        {/* Success Metrics */}
        <div className="mb-5">
          <p className="text-2xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            Success Metrics
          </p>
          <div className="space-y-2.5">
            {experiment.successMetrics.map((metric, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-base/50 border border-edge/50"
              >
                <MetricStatus met={metric.met} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-ink">
                      {metric.name}
                    </span>
                    <span className="text-xs font-mono text-ink-muted">
                      Target: {metric.target}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-ink-secondary mt-0.5">
                    Current: {metric.current}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {experiment.notes && (
          <div className="mb-5">
            <p className="text-2xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
              Notes
            </p>
            <p className="text-sm text-ink-muted leading-relaxed">
              {experiment.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        {experiment.status !== "concluded" && (
          <div className="flex items-center gap-2 pt-3 border-t border-edge">
            <ActionButton size="sm" variant="primary">
              Ship
            </ActionButton>
            <ActionButton size="sm" variant="danger">
              Kill
            </ActionButton>
            <ActionButton size="sm" variant="secondary">
              Extend
            </ActionButton>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricStatus({ met }: { met: boolean | null }) {
  if (met === true)
    return (
      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
        <Check className="w-3 h-3 text-success" />
      </div>
    );
  if (met === false)
    return (
      <div className="w-5 h-5 rounded-full bg-danger/10 flex items-center justify-center shrink-0">
        <X className="w-3 h-3 text-danger" />
      </div>
    );
  return (
    <div className="w-5 h-5 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
      <Clock className="w-3 h-3 text-warning" />
    </div>
  );
}

export default function Experiments() {
  const running = experiments.filter((e) => e.status === "running");
  const needsDecision = experiments.filter((e) => e.status === "needs_decision");
  const concluded = experiments.filter((e) => e.status === "concluded");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between animate-in">
        <div>
          <h2 className="text-2xl font-semibold text-ink leading-tight">
            Active Experiments
          </h2>
          <p className="text-sm text-ink-muted mt-1">
            {running.length} running &middot; {needsDecision.length} need
            decision
          </p>
        </div>
        <ActionButton icon={<Plus className="w-4 h-4" />}>
          New Experiment
        </ActionButton>
      </div>

      {/* Needs Decision */}
      {needsDecision.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-warning uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            Needs Decision
          </h3>
          {needsDecision.map((exp) => (
            <ExperimentCard key={exp.id} experiment={exp} />
          ))}
        </div>
      )}

      {/* Running */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-2 animate-in stagger-1">
          <FlaskConical className="w-3.5 h-3.5" />
          Running ({running.length})
        </h3>
        {running.map((exp, i) => (
          <div key={exp.id} className={`animate-in stagger-${Math.min(i + 2, 6)}`}>
            <ExperimentCard experiment={exp} />
          </div>
        ))}
      </div>

      {/* Concluded */}
      {concluded.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
            Concluded ({concluded.length})
          </h3>
          {concluded.map((exp) => (
            <ExperimentCard key={exp.id} experiment={exp} />
          ))}
        </div>
      )}
    </div>
  );
}
