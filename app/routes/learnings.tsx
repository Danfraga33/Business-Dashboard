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
  updateJournalEntry,
  deleteJournalEntry,
  type JournalEntry,
  type CreateJournalEntryData,
  type UpdateJournalEntryData,
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
      shipped: (formData.get("today") as string) || "N/A",
      learned: (formData.get("tomorrow") as string) || "N/A",
      tomorrow: "",
      tags: [],
    };

    try {
      await createJournalEntry(data);
      return { success: true, error: null, intent: "create" };
    } catch (error) {
      return { success: false, error: "Failed to save entry", intent: "create" };
    }
  }

  if (intent === "update") {
    const id = parseInt(formData.get("id") as string);
    const data: UpdateJournalEntryData = {
      business: formData.get("title") as string,
      hypothesis: formData.get("thoughts") as string,
      shipped: (formData.get("today") as string) || "N/A",
      learned: (formData.get("tomorrow") as string) || "N/A",
    };

    try {
      await updateJournalEntry(id, data);
      return { success: true, error: null, intent: "update" };
    } catch (error) {
      return { success: false, error: "Failed to update entry", intent: "update" };
    }
  }

  if (intent === "delete") {
    const id = parseInt(formData.get("id") as string);
    try {
      await deleteJournalEntry(id);
      return { success: true, error: null, intent: "delete" };
    } catch (error) {
      return { success: false, error: "Failed to delete entry", intent: "delete" };
    }
  }

  return { success: false, error: "Invalid action", intent: null };
}

function EntryCard({
  entry,
  defaultExpanded = false,
}: {
  entry: JournalEntry;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [editing, setEditing] = useState(false);
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const isDeleting = navigation.formData?.get("id") === String(entry.id) && navigation.formData?.get("intent") === "delete";
  const isUpdating = navigation.formData?.get("id") === String(entry.id) && navigation.formData?.get("intent") === "update";

  useEffect(() => {
    if (actionData?.success && editing) {
      setEditing(false);
    }
  }, [actionData]);

  if (editing) {
    return (
      <Form method="post" className="card space-y-5 border-primary/30">
        <input type="hidden" name="intent" value="update" />
        <input type="hidden" name="id" value={entry.id} />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-primary" />
            <h3 className="font-serif font-semibold text-foreground">Edit Entry</h3>
          </div>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Main Focus
          </label>
          <input
            name="title"
            type="text"
            defaultValue={entry.business || ""}
            placeholder="What's the main focus today?"
            required
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <TextArea
          name="thoughts"
          label="My Thoughts"
          placeholder="What's on your mind today?"
          defaultValue={entry.hypothesis}
          required
        />

        <TextArea
          name="today"
          label="What I Did Today"
          placeholder="What did you accomplish?"
          defaultValue={entry.shipped === "N/A" ? "" : entry.shipped}
        />

        <TextArea
          name="tomorrow"
          label="Tomorrow's Plan"
          placeholder="What's the priority for tomorrow?"
          defaultValue={entry.learned === "N/A" ? "" : entry.learned}
        />

        {actionData?.error && actionData.intent === "update" && (
          <div className="text-base text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {actionData.error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <ActionButton
            type="button"
            variant="ghost"
            onClick={() => setEditing(false)}
            disabled={isUpdating}
          >
            Cancel
          </ActionButton>
          <ActionButton type="submit" disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </ActionButton>
        </div>
      </Form>
    );
  }

  return (
    <div className={`card ${isDeleting ? "opacity-50" : ""}`}>
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">
          <span className="text-[15px] font-mono text-muted-foreground">
            {new Date(entry.created_at).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <p className="text-base font-semibold text-foreground leading-snug mt-1">
            {entry.business || "Untitled"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
              setExpanded(false);
            }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Edit entry"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <Form method="post" onClick={(e) => e.stopPropagation()}>
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={entry.id} />
            <button
              type="submit"
              disabled={isDeleting}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
              title="Delete entry"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Form>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
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
        <div className="space-y-4 pt-4 border-t border-border">
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
      <h4 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {title}
      </h4>
      <div className="text-base text-secondary-foreground leading-relaxed whitespace-pre-line">
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
  defaultValue,
}: {
  name: string;
  label: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={4}
        required={required}
        defaultValue={defaultValue}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors resize-y"
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
    if (actionData?.success && navigation.state === "idle") {
      setShowNewEntry(false);
    }
  }, [actionData, navigation.state]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-in">
        <h2 className="font-serif text-3xl font-semibold text-foreground leading-tight">
          Journal
        </h2>
        <p className="text-base text-muted-foreground mt-1">
          Daily reflections and planning
        </p>
      </div>

      {/* New Entry Form */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-base text-muted-foreground">{entries.length} entries</p>
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
            className="card space-y-5 border-primary/30 mb-6"
          >
            <input type="hidden" name="intent" value="create" />
            <div className="flex items-center gap-2 mb-2">
              <Edit3 className="w-4 h-4 text-primary" />
              <h3 className="font-serif font-semibold text-foreground">
                New Entry &mdash;{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>
            </div>

            <div>
              <label className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Main Focus
              </label>
              <input
                name="title"
                type="text"
                placeholder="What's the main focus today?"
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-base text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
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
            />

            <TextArea
              name="tomorrow"
              label="Tomorrow's Plan"
              placeholder="What's the priority for tomorrow? Top 3 things to focus on..."
            />

            {actionData?.error && actionData.intent === "create" && (
              <div className="text-base text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
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
          <div className="text-center py-12 text-muted-foreground text-base">
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
