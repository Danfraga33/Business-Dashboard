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

  return results.map((row: any) => ({
    id: row.id,
    date: new Date(row.date),
    mrr: row.mrr,
    arr: row.arr,
    cac: row.cac,
    ltv: row.ltv,
    ltv_cac_ratio: row.ltv_cac_ratio,
    payback_period_months: row.payback_period_months,
    gross_margin: row.gross_margin,
    nrr: row.nrr,
    active_customers: row.active_customers,
    new_customers: row.new_customers,
    churned_customers: row.churned_customers,
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

  const row: any = results[0];
  return {
    id: row.id,
    date: new Date(row.date),
    mrr: row.mrr,
    arr: row.arr,
    cac: row.cac,
    ltv: row.ltv,
    ltv_cac_ratio: row.ltv_cac_ratio,
    payback_period_months: row.payback_period_months,
    gross_margin: row.gross_margin,
    nrr: row.nrr,
    active_customers: row.active_customers,
    new_customers: row.new_customers,
    churned_customers: row.churned_customers,
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

  return results.map((row: any) => ({
    id: row.id,
    email: row.email,
    name: row.name,
    plan: row.plan,
    mrr: row.mrr,
    health_score: row.health_score,
    segment: row.segment,
    signup_date: row.signup_date ? new Date(row.signup_date) : null,
    activation_date: row.activation_date ? new Date(row.activation_date) : null,
    churned_date: row.churned_date ? new Date(row.churned_date) : null,
    churn_reason: row.churn_reason,
    cohort: row.cohort,
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
  // For now, return all customers - full search implementation would require
  // more complex query building with Neon's template literal approach
  // This is a placeholder for future enhancement
  const allCustomers = await getAllCustomers();

  let filtered = allCustomers;

  // Client-side filtering for MVP
  if (query) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter(c =>
      c.email.toLowerCase().includes(lowerQuery) ||
      c.name?.toLowerCase().includes(lowerQuery)
    );
  }

  if (filters?.plan) {
    filtered = filtered.filter(c => c.plan === filters.plan);
  }

  if (filters?.segment) {
    filtered = filtered.filter(c => c.segment === filters.segment);
  }

  if (filters?.health_status) {
    const ranges = {
      critical: [0, 25],
      'at-risk': [26, 50],
      healthy: [51, 75],
      excellent: [76, 100],
    };
    const [min, max] = ranges[filters.health_status];
    filtered = filtered.filter(c =>
      c.health_score !== null && c.health_score >= min && c.health_score <= max
    );
  }

  return filtered.slice(0, 100);
}
