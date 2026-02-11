-- Create journal_entries table
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
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at DESC);

-- Create index on business for filtering
CREATE INDEX IF NOT EXISTS idx_journal_entries_business ON journal_entries(business);
