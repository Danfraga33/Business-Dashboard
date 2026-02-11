import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log("Running migrations...");

  try {
    // Create journal_entries table
    await sql`
      CREATE TABLE IF NOT EXISTS journal_entries (
        id SERIAL PRIMARY KEY,
        business VARCHAR(255),
        hypothesis TEXT NOT NULL,
        shipped TEXT NOT NULL,
        learned TEXT NOT NULL,
        blockers TEXT,
        tomorrow TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create indexes
    await sql`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at
      ON journal_entries(created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_business
      ON journal_entries(business)
    `;

    console.log("✓ Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
