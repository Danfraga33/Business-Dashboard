import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(DATABASE_URL);

async function migrate() {
  console.log("Running migrations...");

  try {
    // Create journal_entries table (existing)
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

    await sql`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at
      ON journal_entries(created_at DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_business
      ON journal_entries(business)
    `;

    // Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        plan VARCHAR(50),
        mrr DECIMAL(10,2),
        health_score INT CHECK (health_score >= 0 AND health_score <= 100),
        segment VARCHAR(50),
        signup_date TIMESTAMP WITH TIME ZONE,
        activation_date TIMESTAMP WITH TIME ZONE,
        churned_date TIMESTAMP WITH TIME ZONE,
        churn_reason TEXT,
        cohort VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_customers_cohort
      ON customers(cohort)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_customers_health_score
      ON customers(health_score)
    `;

    // Create saas_metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS saas_metrics (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        mrr DECIMAL(10,2),
        arr DECIMAL(10,2),
        cac DECIMAL(10,2),
        ltv DECIMAL(10,2),
        ltv_cac_ratio DECIMAL(5,2),
        payback_period_months DECIMAL(5,2),
        gross_margin DECIMAL(5,2),
        nrr DECIMAL(5,2),
        active_customers INT,
        new_customers INT,
        churned_customers INT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_saas_metrics_date
      ON saas_metrics(date DESC)
    `;

    // Create marketing_channels table
    await sql`
      CREATE TABLE IF NOT EXISTS marketing_channels (
        id SERIAL PRIMARY KEY,
        channel_name VARCHAR(100) NOT NULL,
        channel_type VARCHAR(20) NOT NULL,
        date DATE NOT NULL,
        spend DECIMAL(10,2),
        impressions INT,
        clicks INT,
        leads INT,
        signups INT,
        paid_conversions INT,
        revenue DECIMAL(10,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(channel_name, date)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_marketing_date
      ON marketing_channels(date DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_marketing_channel
      ON marketing_channels(channel_name)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_marketing_type
      ON marketing_channels(channel_type)
    `;

    // Create pricing_experiments table
    await sql`
      CREATE TABLE IF NOT EXISTS pricing_experiments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        hypothesis TEXT,
        variant_a JSONB,
        variant_b JSONB,
        start_date DATE,
        end_date DATE,
        status VARCHAR(20),
        winner VARCHAR(10),
        revenue_impact DECIMAL(10,2),
        statistical_significance DECIMAL(5,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_pricing_experiments_status
      ON pricing_experiments(status)
    `;

    // Create feature_rollouts table
    await sql`
      CREATE TABLE IF NOT EXISTS feature_rollouts (
        id SERIAL PRIMARY KEY,
        feature_name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20),
        release_date DATE,
        adoption_rate DECIMAL(5,2),
        engagement_score INT CHECK (engagement_score >= 0 AND engagement_score <= 100),
        retention_impact DECIMAL(5,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_feature_rollouts_status
      ON feature_rollouts(status)
    `;

    // Create infrastructure_metrics table
    await sql`
      CREATE TABLE IF NOT EXISTS infrastructure_metrics (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        service_name VARCHAR(100),
        cost DECIMAL(10,2),
        uptime_percentage DECIMAL(5,2) CHECK (uptime_percentage >= 0 AND uptime_percentage <= 100),
        api_response_time_p50 INT,
        api_response_time_p95 INT,
        api_response_time_p99 INT,
        total_requests INT,
        error_rate DECIMAL(5,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(service_name, date)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_infra_date
      ON infrastructure_metrics(date DESC)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_infra_service
      ON infrastructure_metrics(service_name)
    `;

    // Create support_tickets table
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
        subject VARCHAR(255),
        description TEXT,
        priority VARCHAR(20),
        category VARCHAR(50),
        status VARCHAR(20),
        first_response_time INT,
        resolution_time INT,
        assigned_to VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        resolved_at TIMESTAMP WITH TIME ZONE
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_tickets_status
      ON support_tickets(status)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_tickets_priority
      ON support_tickets(priority)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_tickets_customer
      ON support_tickets(customer_id)
    `;

    // Add constraints to existing tables (idempotent)
    console.log("Adding data integrity constraints...");

    // Add CHECK constraint for customers.health_score
    try {
      await sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'customers_health_score_check'
          ) THEN
            ALTER TABLE customers
            ADD CONSTRAINT customers_health_score_check
            CHECK (health_score >= 0 AND health_score <= 100);
          END IF;
        END $$;
      `;
      console.log("✓ Added CHECK constraint on customers.health_score");
    } catch (error) {
      console.log("  customers.health_score constraint already exists or error:", error.message);
    }

    // Add CHECK constraint for infrastructure_metrics.uptime_percentage
    try {
      await sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'infrastructure_metrics_uptime_percentage_check'
          ) THEN
            ALTER TABLE infrastructure_metrics
            ADD CONSTRAINT infrastructure_metrics_uptime_percentage_check
            CHECK (uptime_percentage >= 0 AND uptime_percentage <= 100);
          END IF;
        END $$;
      `;
      console.log("✓ Added CHECK constraint on infrastructure_metrics.uptime_percentage");
    } catch (error) {
      console.log("  infrastructure_metrics.uptime_percentage constraint already exists or error:", error.message);
    }

    // Add CHECK constraint for feature_rollouts.engagement_score
    try {
      await sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'feature_rollouts_engagement_score_check'
          ) THEN
            ALTER TABLE feature_rollouts
            ADD CONSTRAINT feature_rollouts_engagement_score_check
            CHECK (engagement_score >= 0 AND engagement_score <= 100);
          END IF;
        END $$;
      `;
      console.log("✓ Added CHECK constraint on feature_rollouts.engagement_score");
    } catch (error) {
      console.log("  feature_rollouts.engagement_score constraint already exists or error:", error.message);
    }

    // Add UNIQUE constraint for marketing_channels(channel_name, date)
    try {
      await sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'marketing_channels_channel_name_date_key'
          ) THEN
            ALTER TABLE marketing_channels
            ADD CONSTRAINT marketing_channels_channel_name_date_key
            UNIQUE (channel_name, date);
          END IF;
        END $$;
      `;
      console.log("✓ Added UNIQUE constraint on marketing_channels(channel_name, date)");
    } catch (error) {
      console.log("  marketing_channels unique constraint already exists or error:", error.message);
    }

    // Add UNIQUE constraint for infrastructure_metrics(service_name, date)
    try {
      await sql`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'infrastructure_metrics_service_name_date_key'
          ) THEN
            ALTER TABLE infrastructure_metrics
            ADD CONSTRAINT infrastructure_metrics_service_name_date_key
            UNIQUE (service_name, date);
          END IF;
        END $$;
      `;
      console.log("✓ Added UNIQUE constraint on infrastructure_metrics(service_name, date)");
    } catch (error) {
      console.log("  infrastructure_metrics unique constraint already exists or error:", error.message);
    }

    // Drop and recreate support_tickets foreign key with ON DELETE CASCADE
    try {
      await sql`
        DO $$
        BEGIN
          -- Check if the constraint exists and doesn't have CASCADE
          IF EXISTS (
            SELECT 1 FROM pg_constraint
            WHERE conname = 'support_tickets_customer_id_fkey'
            AND confdeltype != 'c'  -- 'c' means CASCADE
          ) THEN
            -- Drop the old constraint
            ALTER TABLE support_tickets
            DROP CONSTRAINT support_tickets_customer_id_fkey;

            -- Add the new constraint with CASCADE
            ALTER TABLE support_tickets
            ADD CONSTRAINT support_tickets_customer_id_fkey
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
          END IF;
        END $$;
      `;
      console.log("✓ Updated foreign key constraint on support_tickets.customer_id with ON DELETE CASCADE");
    } catch (error) {
      console.log("  support_tickets foreign key constraint already correct or error:", error.message);
    }

    // Drop redundant index on customers.email (UNIQUE constraint already creates an index)
    try {
      await sql`
        DROP INDEX IF EXISTS idx_customers_email;
      `;
      console.log("✓ Removed redundant index idx_customers_email");
    } catch (error) {
      console.log("  idx_customers_email index doesn't exist or error:", error.message);
    }

    console.log("✓ Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
