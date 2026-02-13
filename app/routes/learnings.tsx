import { useState } from "react";
import { Form, useLoaderData, useActionData, useNavigation } from "react-router";
import {
  Plus,
  Search,
  ChevronDown,
  X,
  Edit3,
  Trash2,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { ActionButton } from "../components/ActionButton";
import { Tabs, Tab } from "../components/Tabs";
import { StatCard } from "../components/StatCard";
import { businesses } from "../data/portfolio";
import {
  getAllJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
  type JournalEntry,
  type CreateJournalEntryData,
} from "../lib/journal.server";
import { getPricingExperiments } from "../lib/operations.server";
import type { PricingExperiment } from "../types/dashboard";
import type { Route } from "./+types/learnings";

export async function loader() {
  const [entries, experiments] = await Promise.all([
    getAllJournalEntries(),
    getPricingExperiments(),
  ]);
  return { entries, experiments };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const data: CreateJournalEntryData = {
      business: formData.get("business") as string || undefined,
      hypothesis: formData.get("hypothesis") as string,
      shipped: formData.get("shipped") as string,
      learned: formData.get("learned") as string,
      blockers: formData.get("blockers") as string || undefined,
      tomorrow: formData.get("tomorrow") as string,
      tags: [],
    };

    try {
      await createJournalEntry(data);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Failed to create entry" };
    }
  }

  if (intent === "delete") {
    const id = parseInt(formData.get("id") as string);
    try {
      await deleteJournalEntry(id);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Failed to delete entry" };
    }
  }

  return { success: false, error: "Invalid action" };
}

// --- Journal Components ---

function EntryCard({
  entry,
  defaultExpanded = false,
}: {
  entry: JournalEntry;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const navigation = useNavigation();
  const isDeleting = navigation.formData?.get("id") === String(entry.id);

  return (
    <div className={`card ${isDeleting ? "opacity-50" : ""}`}>
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-mono text-ink-muted">
              {new Date(entry.created_at).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            {entry.business && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-medium bg-accent/10 text-accent">
                {entry.business}
              </span>
            )}
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-2xs text-ink-muted bg-base/50"
              >
                #{tag}
              </span>
            ))}
          </div>
          <p className="text-sm font-medium text-ink leading-snug">
            {entry.hypothesis}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Form method="post" onClick={(e) => e.stopPropagation()}>
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={entry.id} />
            <button
              type="submit"
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-ink-muted hover:text-danger hover:bg-danger/10 transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Form>
          <ChevronDown
            className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[800px] opacity-100 mt-5" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4 pt-4 border-t border-edge">
          <Section title="What shipped" content={entry.shipped} />
          <Section title="What learned" content={entry.learned} />
          {entry.blockers && (
            <Section title="Blockers" content={entry.blockers} />
          )}
          <Section title="Tomorrow's priorities" content={entry.tomorrow} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h4 className="text-2xs font-semibold text-ink-muted uppercase tracking-wider mb-1.5">
        {title}
      </h4>
      <div className="text-sm text-ink-secondary leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}

function TextArea({
  name,
  label,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-2xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        required={required}
        className="w-full bg-base border border-edge rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent/50 transition-colors resize-y"
      />
    </div>
  );
}

// --- Experiment Components ---

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-accent/10 text-accent",
    completed: "bg-success/10 text-success",
    cancelled: "bg-danger/10 text-danger",
  };
  const icons: Record<string, React.ReactNode> = {
    active: <Clock className="w-3 h-3" />,
    completed: <CheckCircle2 className="w-3 h-3" />,
    cancelled: <XCircle className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold uppercase tracking-wider ${
      styles[status] || "bg-surface text-ink-muted"
    }`}>
      {icons[status]}
      {status}
    </span>
  );
}

function WinnerBadge({ winner }: { winner: string | null }) {
  if (!winner) return <span className="text-xs text-ink-muted">Pending</span>;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-success/10 text-success">
      <CheckCircle2 className="w-3 h-3" />
      Variant {winner}
    </span>
  );
}

// --- Main Page ---

export default function Learnings() {
  const { entries, experiments } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBusiness, setFilterBusiness] = useState<string>("");

  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("intent") === "create";

  const filtered = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.hypothesis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.shipped.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.learned.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((t) =>
        t.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesBusiness =
      !filterBusiness || entry.business === filterBusiness;
    return matchesSearch && matchesBusiness;
  });

  if (actionData?.success && showNewEntry) {
    setShowNewEntry(false);
  }

  // Experiment stats
  const active = experiments.filter((e) => e.status === "active");
  const completed = experiments.filter((e) => e.status === "completed");
  const totalRevenueImpact = completed.reduce(
    (sum, e) => sum + (e.revenue_impact || 0),
    0
  );
  const avgSignificance = completed.length > 0
    ? completed.reduce((sum, e) => sum + (e.statistical_significance || 0), 0) / completed.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Learnings
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Journal entries and experiment results
        </p>
      </div>

      <Tabs>
        {/* ====== Journal Tab ====== */}
        <Tab label="Journal">
          <div className="space-y-6">
            {/* Journal Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-muted">{entries.length} entries</p>
              <ActionButton
                onClick={() => setShowNewEntry(!showNewEntry)}
                icon={showNewEntry ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              >
                {showNewEntry ? "Cancel" : "New Entry"}
              </ActionButton>
            </div>

            {/* New Entry Form */}
            {showNewEntry && (
              <Form
                method="post"
                className="card space-y-5 border-accent/30"
              >
                <input type="hidden" name="intent" value="create" />
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 className="w-4 h-4 text-accent" />
                  <h3 className="text-base font-semibold text-ink">
                    New Entry &mdash;{" "}
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-2xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                      Business
                    </label>
                    <select
                      name="business"
                      className="w-full bg-base border border-edge rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-accent/50 transition-colors"
                    >
                      <option value="">Portfolio-wide</option>
                      {businesses.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-2xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                      Hypothesis tested
                    </label>
                    <input
                      name="hypothesis"
                      required
                      placeholder="What are you testing or exploring today?"
                      className="w-full bg-base border border-edge rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                </div>

                <TextArea
                  name="shipped"
                  label="What shipped"
                  placeholder="What did you deploy, publish, or complete?"
                  required
                />
                <TextArea
                  name="learned"
                  label="What learned"
                  placeholder="Key insights, surprises, data points..."
                  required
                />
                <TextArea
                  name="blockers"
                  label="Blockers"
                  placeholder="What's preventing progress? (optional)"
                />
                <TextArea
                  name="tomorrow"
                  label="Tomorrow's priorities"
                  placeholder="Top 3 things for tomorrow..."
                  required
                />

                {actionData?.error && (
                  <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                    {actionData.error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <ActionButton
                    type="button"
                    variant="ghost"
                    onClick={() => setShowNewEntry(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </ActionButton>
                  <ActionButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Entry"}
                  </ActionButton>
                </div>
              </Form>
            )}

            {/* Search & Filter */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-edge rounded-lg pl-9 pr-3 py-2 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <select
                value={filterBusiness}
                onChange={(e) => setFilterBusiness(e.target.value)}
                className="bg-surface border border-edge rounded-lg px-3 py-2 text-sm text-ink-secondary outline-none focus:border-accent/50 transition-colors"
              >
                <option value="">All businesses</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Entries */}
            <div className="space-y-4">
              {filtered.map((entry, i) => (
                <div key={entry.id}>
                  <EntryCard entry={entry} defaultExpanded={i === 0} />
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-12 text-ink-muted text-sm">
                  No entries match your search.
                </div>
              )}
            </div>
          </div>
        </Tab>

        {/* ====== Experiments Tab ====== */}
        <Tab label="Experiments">
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                label="Active Experiments"
                value={active.length.toString()}
              />
              <StatCard
                label="Completed"
                value={completed.length.toString()}
              />
              <StatCard
                label="Total Revenue Impact"
                value={formatCurrency(totalRevenueImpact)}
              />
              <StatCard
                label="Avg Significance"
                value={avgSignificance.toFixed(1) + "%"}
              />
            </div>

            {/* Experiment Cards */}
            <div className="space-y-5">
              {experiments.map((experiment) => (
                <div key={experiment.id} className="card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <FlaskConical className="w-4 h-4 text-accent shrink-0" />
                        <h3 className="text-base font-semibold text-ink truncate">
                          {experiment.name}
                        </h3>
                        <StatusBadge status={experiment.status} />
                      </div>
                      {experiment.hypothesis && (
                        <p className="text-sm text-ink-secondary leading-relaxed">
                          {experiment.hypothesis}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className={`p-4 rounded-lg border ${
                      experiment.winner === "A" ? "border-success/30 bg-success/5" : "border-edge bg-surface"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider">Variant A</span>
                        {experiment.winner === "A" && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                      </div>
                      <p className="text-sm font-medium text-ink">{experiment.variant_a.plan}</p>
                      <p className="text-lg font-mono font-semibold text-ink mt-1">
                        ${experiment.variant_a.price}
                        <span className="text-xs text-ink-muted font-normal">/{experiment.variant_a.billing}</span>
                      </p>
                    </div>

                    <div className={`p-4 rounded-lg border ${
                      experiment.winner === "B" ? "border-success/30 bg-success/5" : "border-edge bg-surface"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider">Variant B</span>
                        {experiment.winner === "B" && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                      </div>
                      <p className="text-sm font-medium text-ink">{experiment.variant_b.plan}</p>
                      <p className="text-lg font-mono font-semibold text-ink mt-1">
                        ${experiment.variant_b.price}
                        <span className="text-xs text-ink-muted font-normal">/{experiment.variant_b.billing}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-edge">
                    {experiment.start_date && (
                      <div>
                        <p className="text-2xs text-ink-muted uppercase tracking-wider">Started</p>
                        <p className="text-sm font-mono text-ink-secondary">
                          {new Date(experiment.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    )}
                    {experiment.end_date && (
                      <div>
                        <p className="text-2xs text-ink-muted uppercase tracking-wider">Ended</p>
                        <p className="text-sm font-mono text-ink-secondary">
                          {new Date(experiment.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    )}
                    {experiment.revenue_impact != null && (
                      <div>
                        <p className="text-2xs text-ink-muted uppercase tracking-wider">Revenue Impact</p>
                        <p className={`text-sm font-mono font-semibold ${experiment.revenue_impact >= 0 ? "text-success" : "text-danger"}`}>
                          {experiment.revenue_impact >= 0 ? "+" : ""}{formatCurrency(experiment.revenue_impact)}
                        </p>
                      </div>
                    )}
                    {experiment.statistical_significance != null && (
                      <div>
                        <p className="text-2xs text-ink-muted uppercase tracking-wider">Significance</p>
                        <p className={`text-sm font-mono font-semibold ${experiment.statistical_significance >= 95 ? "text-success" : "text-warning"}`}>
                          {Number(experiment.statistical_significance).toFixed(1)}%
                        </p>
                      </div>
                    )}
                    <div className="ml-auto">
                      <WinnerBadge winner={experiment.winner} />
                    </div>
                  </div>
                </div>
              ))}

              {experiments.length === 0 && (
                <div className="text-center py-12 text-ink-muted text-sm">
                  No experiments yet. Create one to start testing pricing hypotheses.
                </div>
              )}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
