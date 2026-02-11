import { useState } from "react";
import {
  Bell,
  BrainCircuit,
  Database,
  Download,
} from "lucide-react";
import { ActionButton } from "../components/ActionButton";

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
        enabled ? "bg-accent" : "bg-edge"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
          enabled ? "translate-x-[18px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-ink">{title}</h3>
          <p className="text-xs text-ink-muted mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm text-ink">{label}</p>
        {description && (
          <p className="text-xs text-ink-muted mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const [briefingEnabled, setBriefingEnabled] = useState(true);
  const [redFlagAlerts, setRedFlagAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [experimentReminders, setExperimentReminders] = useState(true);
  const [patternDetection, setPatternDetection] = useState(true);
  const [crossBizInsights, setCrossBizInsights] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Settings
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Configure your dashboard preferences
        </p>
      </div>

      {/* AI Briefing */}
      <div className="animate-in stagger-1">
        <SettingsSection
          icon={BrainCircuit}
          title="AI Briefing"
          description="Control what the morning brief surfaces"
        >
          <SettingsRow
            label="Morning briefing"
            description="Generate daily intelligence summary"
          >
            <ToggleSwitch
              enabled={briefingEnabled}
              onToggle={() => setBriefingEnabled(!briefingEnabled)}
            />
          </SettingsRow>
          <SettingsRow
            label="Pattern detection"
            description="AI identifies cross-business patterns"
          >
            <ToggleSwitch
              enabled={patternDetection}
              onToggle={() => setPatternDetection(!patternDetection)}
            />
          </SettingsRow>
          <SettingsRow
            label="Cross-business insights"
            description="Surface connections between portfolio companies"
          >
            <ToggleSwitch
              enabled={crossBizInsights}
              onToggle={() => setCrossBizInsights(!crossBizInsights)}
            />
          </SettingsRow>
        </SettingsSection>
      </div>

      {/* Notifications */}
      <div className="animate-in stagger-2">
        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Choose what triggers alerts"
        >
          <SettingsRow
            label="Red flag alerts"
            description="Immediate notification for critical issues"
          >
            <ToggleSwitch
              enabled={redFlagAlerts}
              onToggle={() => setRedFlagAlerts(!redFlagAlerts)}
            />
          </SettingsRow>
          <SettingsRow
            label="Budget alerts"
            description="Notify when categories exceed budget"
          >
            <ToggleSwitch
              enabled={budgetAlerts}
              onToggle={() => setBudgetAlerts(!budgetAlerts)}
            />
          </SettingsRow>
          <SettingsRow
            label="Experiment reminders"
            description="Remind when experiments approach decision date"
          >
            <ToggleSwitch
              enabled={experimentReminders}
              onToggle={() =>
                setExperimentReminders(!experimentReminders)
              }
            />
          </SettingsRow>
          <SettingsRow
            label="Weekly digest"
            description="Summary email every Monday morning"
          >
            <ToggleSwitch
              enabled={weeklyDigest}
              onToggle={() => setWeeklyDigest(!weeklyDigest)}
            />
          </SettingsRow>
        </SettingsSection>
      </div>

      {/* Data Connections */}
      <div className="animate-in stagger-3">
        <SettingsSection
          icon={Database}
          title="Data Connections"
          description="Connect your business tools"
        >
          <ConnectionRow name="Stripe" status="connected" />
          <ConnectionRow name="Google Analytics" status="connected" />
          <ConnectionRow name="Intercom" status="disconnected" />
          <ConnectionRow name="Slack" status="disconnected" />
        </SettingsSection>
      </div>

      {/* Export */}
      <div className="animate-in stagger-4">
        <SettingsSection
          icon={Download}
          title="Export & Backup"
          description="Download your data"
        >
          <div className="flex items-center gap-3">
            <ActionButton variant="secondary" size="sm">
              Export Journal (CSV)
            </ActionButton>
            <ActionButton variant="secondary" size="sm">
              Export Financials (CSV)
            </ActionButton>
            <ActionButton variant="secondary" size="sm">
              Full Backup (JSON)
            </ActionButton>
          </div>
        </SettingsSection>
      </div>
    </div>
  );
}

function ConnectionRow({
  name,
  status,
}: {
  name: string;
  status: "connected" | "disconnected";
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full ${
            status === "connected" ? "bg-success" : "bg-edge"
          }`}
        />
        <span className="text-sm text-ink">{name}</span>
      </div>
      {status === "connected" ? (
        <span className="text-xs text-success font-medium">Connected</span>
      ) : (
        <ActionButton variant="ghost" size="sm">
          Connect
        </ActionButton>
      )}
    </div>
  );
}
