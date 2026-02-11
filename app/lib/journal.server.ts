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
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.business !== undefined) {
    updates.push(`business = $${paramIndex++}`);
    values.push(data.business || null);
  }
  if (data.hypothesis !== undefined) {
    updates.push(`hypothesis = $${paramIndex++}`);
    values.push(data.hypothesis);
  }
  if (data.shipped !== undefined) {
    updates.push(`shipped = $${paramIndex++}`);
    values.push(data.shipped);
  }
  if (data.learned !== undefined) {
    updates.push(`learned = $${paramIndex++}`);
    values.push(data.learned);
  }
  if (data.blockers !== undefined) {
    updates.push(`blockers = $${paramIndex++}`);
    values.push(data.blockers || null);
  }
  if (data.tomorrow !== undefined) {
    updates.push(`tomorrow = $${paramIndex++}`);
    values.push(data.tomorrow);
  }
  if (data.tags !== undefined) {
    updates.push(`tags = $${paramIndex++}`);
    values.push(data.tags);
  }

  if (updates.length === 0) {
    return getJournalEntryById(id);
  }

  updates.push(`updated_at = NOW()`);

  const query = `
    UPDATE journal_entries
    SET ${updates.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;
  values.push(id);

  const entries = await sql(query, values);
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
