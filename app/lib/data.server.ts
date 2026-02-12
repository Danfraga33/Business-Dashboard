import { neon } from "@neondatabase/serverless";
import type {
  SaasMetrics,
  Customer,
  CustomerStats,
  CohortData,
} from "../types/dashboard";

const sql = neon(process.env.DATABASE_URL!);

// SaaS Metrics Functions
export async function getSaasMetrics(days: number = 30): Promise<SaasMetrics[]> {
  const results = await sql`
    SELECT *
    FROM saas_metrics
    WHERE date >= CURRENT_DATE - ${days}
    ORDER BY date DESC
  `;

  return results.map((row) => ({
    ...row,
    date: new Date(row.date),
    created_at: new Date(row.created_at),
  }));
}

export async function getLatestSaasMetrics(): Promise<SaasMetrics | null> {
  const results = await sql`
    SELECT *
    FROM saas_metrics
    ORDER BY date DESC
    LIMIT 1
  `;

  if (results.length === 0) return null;

  const row = results[0];
  return {
    ...row,
    date: new Date(row.date),
    created_at: new Date(row.created_at),
  };
}

// Customer Functions
export async function getAllCustomers(): Promise<Customer[]> {
  const results = await sql`
    SELECT *
    FROM customers
    ORDER BY created_at DESC
  `;

  return results.map((row) => ({
    ...row,
    signup_date: row.signup_date ? new Date(row.signup_date) : null,
    activation_date: row.activation_date ? new Date(row.activation_date) : null,
    churned_date: row.churned_date ? new Date(row.churned_date) : null,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }));
}

export async function getCustomerStats(): Promise<CustomerStats> {
  const results = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE churned_date IS NULL) as active,
      COUNT(*) FILTER (WHERE churned_date IS NOT NULL) as churned,
      COUNT(*) FILTER (WHERE DATE_TRUNC('month', signup_date) = DATE_TRUNC('month', CURRENT_DATE)) as new_this_month,
      ROUND(AVG(health_score)::numeric, 2) as avg_health_score,
      ROUND(
        (COUNT(*) FILTER (WHERE activation_date IS NOT NULL)::decimal / NULLIF(COUNT(*), 0) * 100)::numeric,
        2
      ) as activation_rate
    FROM customers
  `;

  const row = results[0];
  return {
    total: Number(row.total),
    active: Number(row.active),
    churned: Number(row.churned),
    new_this_month: Number(row.new_this_month),
    avg_health_score: Number(row.avg_health_score || 0),
    activation_rate: Number(row.activation_rate || 0),
  };
}

export async function getCohortAnalysis(): Promise<CohortData[]> {
  const results = await sql`
    SELECT
      cohort,
      COUNT(*) as customers,
      SUM(mrr) as mrr,
      ROUND(
        (COUNT(*) FILTER (WHERE churned_date IS NULL)::decimal / COUNT(*) * 100)::numeric,
        2
      ) as retention_rate,
      ROUND(
        (COUNT(*) FILTER (WHERE churned_date IS NOT NULL)::decimal / COUNT(*) * 100)::numeric,
        2
      ) as churn_rate
    FROM customers
    WHERE cohort IS NOT NULL
    GROUP BY cohort
    ORDER BY cohort DESC
    LIMIT 12
  `;

  return results.map((row) => ({
    cohort: row.cohort,
    customers: Number(row.customers),
    mrr: Number(row.mrr || 0),
    retention_rate: Number(row.retention_rate || 0),
    churn_rate: Number(row.churn_rate || 0),
  }));
}

export async function searchCustomers(
  query?: string,
  filters?: {
    plan?: string;
    segment?: string;
    health_status?: 'critical' | 'at-risk' | 'healthy' | 'excellent';
  }
): Promise<Customer[]> {
  // Build dynamic query based on filters
  let conditions = [];
  let params: any[] = [];

  if (query) {
    conditions.push(`(name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 2})`);
    params.push(`%${query}%`, `%${query}%`);
  }

  if (filters?.plan) {
    conditions.push(`plan = $${params.length + 1}`);
    params.push(filters.plan);
  }

  if (filters?.segment) {
    conditions.push(`segment = $${params.length + 1}`);
    params.push(filters.segment);
  }

  if (filters?.health_status) {
    const ranges = {
      critical: [0, 25],
      'at-risk': [26, 50],
      healthy: [51, 75],
      excellent: [76, 100],
    };
    const [min, max] = ranges[filters.health_status];
    conditions.push(`health_score BETWEEN $${params.length + 1} AND $${params.length + 2}`);
    params.push(min, max);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const queryText = `
    SELECT *
    FROM customers
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT 100
  `;

  const results = await sql(queryText, params);

  return results.map((row) => ({
    ...row,
    signup_date: row.signup_date ? new Date(row.signup_date) : null,
    activation_date: row.activation_date ? new Date(row.activation_date) : null,
    churned_date: row.churned_date ? new Date(row.churned_date) : null,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }));
}
