import { sql } from "./db";

export interface JournalEntry {
  id: number;
  business: string | null;
  hypothesis: string;
  shipped: string;
  learned: string;
  blockers: string | null;
  tomorrow: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateJournalEntryData {
  business?: string;
  hypothesis: string;
  shipped: string;
  learned: string;
  blockers?: string;
  tomorrow: string;
  tags?: string[];
}

export interface UpdateJournalEntryData {
  business?: string;
  hypothesis?: string;
  shipped?: string;
  learned?: string;
  blockers?: string;
  tomorrow?: string;
  tags?: string[];
}

export async function getAllJournalEntries(): Promise<JournalEntry[]> {
  const entries = await sql`
    SELECT * FROM journal_entries
    ORDER BY created_at DESC
  `;
  return entries as JournalEntry[];
}

export async function getJournalEntryById(id: number): Promise<JournalEntry | null> {
  const entries = await sql`
    SELECT * FROM journal_entries
    WHERE id = ${id}
  `;
  return entries[0] as JournalEntry || null;
}

export async function createJournalEntry(data: CreateJournalEntryData): Promise<JournalEntry> {
  const entries = await sql`
    INSERT INTO journal_entries (business, hypothesis, shipped, learned, blockers, tomorrow, tags)
    VALUES (
      ${data.business || null},
      ${data.hypothesis},
      ${data.shipped},
      ${data.learned},
      ${data.blockers || null},
      ${data.tomorrow},
      ${data.tags || []}
    )
    RETURNING *
  `;
  return entries[0] as JournalEntry;
}

export async function updateJournalEntry(
  id: number,
  data: UpdateJournalEntryData
): Promise<JournalEntry | null> {
  const entries = await sql`
    UPDATE journal_entries
    SET
      business = COALESCE(${data.business ?? null}, business),
      hypothesis = COALESCE(${data.hypothesis ?? null}, hypothesis),
      shipped = COALESCE(${data.shipped ?? null}, shipped),
      learned = COALESCE(${data.learned ?? null}, learned),
      blockers = COALESCE(${data.blockers ?? null}, blockers),
      tomorrow = COALESCE(${data.tomorrow ?? null}, tomorrow),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return entries[0] as JournalEntry || null;
}

export async function deleteJournalEntry(id: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM journal_entries
    WHERE id = ${id}
  `;
  return result.length > 0;
}

export async function searchJournalEntries(
  searchQuery: string,
  businessFilter?: string
): Promise<JournalEntry[]> {
  let entries;

  if (businessFilter) {
    entries = await sql`
      SELECT * FROM journal_entries
      WHERE business = ${businessFilter}
        AND (
          hypothesis ILIKE ${`%${searchQuery}%`}
          OR shipped ILIKE ${`%${searchQuery}%`}
          OR learned ILIKE ${`%${searchQuery}%`}
          OR ${searchQuery} = ANY(tags)
        )
      ORDER BY created_at DESC
    `;
  } else if (searchQuery) {
    entries = await sql`
      SELECT * FROM journal_entries
      WHERE hypothesis ILIKE ${`%${searchQuery}%`}
        OR shipped ILIKE ${`%${searchQuery}%`}
        OR learned ILIKE ${`%${searchQuery}%`}
        OR ${searchQuery} = ANY(tags)
      ORDER BY created_at DESC
    `;
  } else {
    entries = await getAllJournalEntries();
  }

  return entries as JournalEntry[];
}
