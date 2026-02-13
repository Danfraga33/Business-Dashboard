import { useState, useEffect } from "react";
import { Form, useLoaderData, useActionData, useNavigation } from "react-router";
import {
  Plus,
  ChevronDown,
  X,
  Edit3,
  Trash2,
} from "lucide-react";
import { ActionButton } from "../components/ActionButton";
import {
  getAllJournalEntries,
  createJournalEntry,
  deleteJournalEntry,
  type JournalEntry,
  type CreateJournalEntryData,
} from "../lib/journal.server";
import type { Route } from "./+types/learnings";

export async function loader() {
  const entries = await getAllJournalEntries();
  return { entries };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const data: CreateJournalEntryData = {
      business: formData.get("title") as string,
      hypothesis: formData.get("thoughts") as string,
      shipped: formData.get("today") as string,
      learned: formData.get("tomorrow") as string,
      tomorrow: "", // Keep this for DB compatibility
      tags: [],
    };

    try {
      await createJournalEntry(data);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: "Failed to save entry" };
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
          <span className="text-xs font-mono text-ink-muted">
            {new Date(entry.created_at).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <p className="text-sm font-semibold text-ink leading-snug mt-1">
            {entry.business || "Untitled"}
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
          <Section title="My Thoughts" content={entry.hypothesis} />
          <Section title="What I Did Today" content={entry.shipped} />
          <Section title="Tomorrow's Plan" content={entry.learned} />
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
        rows={4}
        required={required}
        className="w-full bg-base border border-edge rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent/50 transition-colors resize-y"
      />
    </div>
  );
}

export default function Learnings() {
  const { entries } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showNewEntry, setShowNewEntry] = useState(false);

  const isSubmitting = navigation.state === "submitting" && navigation.formData?.get("intent") === "create";

  useEffect(() => {
    if (actionData?.success) {
      setShowNewEntry(false);
    }
  }, [actionData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="text-2xl font-semibold text-ink leading-tight">
          Journal
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Daily reflections and planning
        </p>
      </div>

      {/* New Entry Form */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-ink-muted">{entries.length} entries</p>
          <ActionButton
            onClick={() => setShowNewEntry(!showNewEntry)}
            icon={showNewEntry ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          >
            {showNewEntry ? "Cancel" : "New Entry"}
          </ActionButton>
        </div>

        {showNewEntry && (
          <Form
            method="post"
            className="card space-y-5 border-accent/30 mb-6"
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

            <div>
              <label className="text-2xs font-semibold text-ink-muted uppercase tracking-wider block mb-1.5">
                Main Focus
              </label>
              <input
                name="title"
                type="text"
                placeholder="What's the main focus today?"
                required
                className="w-full bg-base border border-edge rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            <TextArea
              name="thoughts"
              label="My Thoughts"
              placeholder="What's on your mind today? Any ideas, concerns, or observations..."
              required
            />

            <TextArea
              name="today"
              label="What I Did Today"
              placeholder="What did you accomplish? Key wins, progress, or work completed..."
              required
            />

            <TextArea
              name="tomorrow"
              label="Tomorrow's Plan"
              placeholder="What's the priority for tomorrow? Top 3 things to focus on..."
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
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.length === 0 && !showNewEntry && (
          <div className="text-center py-12 text-ink-muted text-sm">
            No entries yet. Start journaling to track your daily progress.
          </div>
        )}
        {entries.map((entry, i) => (
          <div key={entry.id}>
            <EntryCard entry={entry} defaultExpanded={i === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
