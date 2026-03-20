import {
  AlertTriangle,
  Lightbulb,
  BrainCircuit,
  ArrowRight,
  AlertCircle,
  Zap,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { briefing } from "../data/briefing";

function SeverityBadge({ severity }: { severity: "critical" | "warning" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
        severity === "critical"
          ? "bg-danger/10 text-danger"
          : "bg-warning/10 text-warning"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          severity === "critical" ? "bg-danger" : "bg-warning"
        }`}
      />
      {severity}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const colors = {
    high: "bg-danger/10 text-danger",
    medium: "bg-warning/10 text-warning",
    low: "bg-primary/10 text-primary",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${colors[priority]}`}
    >
      {priority}
    </span>
  );
}

function ExpandableItem({
  children,
  detail,
}: {
  children: React.ReactNode;
  detail: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div
        className="cursor-pointer flex items-start justify-between gap-3"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-1">{children}</div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 mt-1 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed pl-7">
          {detail}
        </p>
      </div>
    </div>
  );
}

export default function MorningBrief() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-foreground leading-tight font-serif">
          {briefing.greeting}
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          {briefing.dayOfWeek}, {new Date(briefing.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Executive Summary */}
      <div className="card animate-in stagger-1">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-base font-semibold text-foreground font-serif">
            Executive Summary
          </h3>
        </div>
        <p className="text-sm text-secondary-foreground leading-relaxed">
          {briefing.executiveSummary}
        </p>
      </div>

      {/* Red Flags + Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Red Flags */}
        <div className="card animate-in stagger-2">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-danger" />
            </div>
            <h3 className="text-base font-semibold text-foreground font-serif">
              Red Flags
            </h3>
            <span className="ml-auto text-[13px] font-mono text-danger bg-danger/10 px-2 py-0.5 rounded-full">
              {briefing.redFlags.length}
            </span>
          </div>
          <div className="space-y-5">
            {briefing.redFlags.map((flag, i) => (
              <ExpandableItem key={i} detail={flag.detail}>
                <div className="flex items-start gap-2.5">
                  <AlertCircle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      flag.severity === "critical"
                        ? "text-danger"
                        : "text-warning"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge severity={flag.severity} />
                      <span className="text-[13px] text-muted-foreground">
                        {flag.business}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {flag.title}
                    </p>
                    <p className="text-[13px] font-mono text-muted-foreground mt-1">
                      {flag.metric}
                    </p>
                  </div>
                </div>
              </ExpandableItem>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="card animate-in stagger-3">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-success" />
            </div>
            <h3 className="text-base font-semibold text-foreground font-serif">
              Opportunities
            </h3>
          </div>
          <div className="space-y-5">
            {briefing.opportunities.map((opp, i) => (
              <ExpandableItem key={i} detail={opp.detail}>
                <div className="flex items-start gap-2.5">
                  <ArrowRight className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[13px] text-muted-foreground">
                      {opp.business}
                    </span>
                    <p className="text-sm font-medium text-foreground">
                      {opp.title}
                    </p>
                    <p className="text-[13px] font-mono text-success/80 mt-1">
                      {opp.impact}
                    </p>
                  </div>
                </div>
              </ExpandableItem>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Recognition */}
      <div className="card animate-in stagger-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-chart-4" />
          </div>
          <h3 className="text-base font-semibold text-foreground font-serif">
            Pattern Recognition
          </h3>
          <span className="text-[13px] text-muted-foreground ml-2">
            AI-detected cross-business insights
          </span>
        </div>
        <div className="space-y-4">
          {briefing.patterns.map((pattern, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-muted/50 border border-border/50"
            >
              <p className="text-sm font-medium text-foreground mb-1.5">
                {pattern.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pattern.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="card animate-in stagger-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary font-mono">!</span>
          </div>
          <h3 className="text-base font-semibold text-foreground font-serif">
            Recommended Actions
          </h3>
        </div>
        <div className="space-y-4">
          {briefing.recommendedActions.map((action, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold font-mono shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <PriorityBadge priority={action.priority} />
                  <span className="text-[13px] text-muted-foreground">
                    {action.business}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {action.action}
                </p>
                <p className="text-[13px] text-muted-foreground mt-1 leading-relaxed">
                  {action.context}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
