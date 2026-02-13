import { neon } from '@neondatabase/serverless';
import type {
  PricingExperiment,
  FeatureRollout,
  InfrastructureMetrics,
  SupportTicket,
  SupportMetrics,
} from '../types/dashboard';

const sql = neon(process.env.DATABASE_URL!);

// --- Pricing Experiments ---

export async function getPricingExperiments(
  status?: 'active' | 'completed' | 'cancelled'
): Promise<PricingExperiment[]> {
  const results = status
    ? await sql`SELECT * FROM pricing_experiments WHERE status = ${status} ORDER BY created_at DESC`
    : await sql`SELECT * FROM pricing_experiments ORDER BY created_at DESC`;

  return results.map((row: any) => ({
    id: row.id,
    name: row.name,
    hypothesis: row.hypothesis,
    variant_a: typeof row.variant_a === 'string' ? JSON.parse(row.variant_a) : row.variant_a,
    variant_b: typeof row.variant_b === 'string' ? JSON.parse(row.variant_b) : row.variant_b,
    start_date: row.start_date ? new Date(row.start_date) : null,
    end_date: row.end_date ? new Date(row.end_date) : null,
    status: row.status,
    winner: row.winner,
    revenue_impact: row.revenue_impact ? Number(row.revenue_impact) : null,
    statistical_significance: row.statistical_significance ? Number(row.statistical_significance) : null,
    created_at: new Date(row.created_at),
  }));
}

// --- Feature Rollouts ---

export async function getFeatureRollouts(
  status?: 'dev' | 'beta' | 'production'
): Promise<FeatureRollout[]> {
  const results = status
    ? await sql`SELECT * FROM feature_rollouts WHERE status = ${status} ORDER BY updated_at DESC`
    : await sql`SELECT * FROM feature_rollouts ORDER BY updated_at DESC`;

  return results.map((row: any) => ({
    id: row.id,
    feature_name: row.feature_name,
    description: row.description,
    status: row.status,
    release_date: row.release_date ? new Date(row.release_date) : null,
    adoption_rate: row.adoption_rate ? Number(row.adoption_rate) : null,
    engagement_score: row.engagement_score ? Number(row.engagement_score) : null,
    retention_impact: row.retention_impact ? Number(row.retention_impact) : null,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  }));
}

// --- Infrastructure Metrics ---

export interface ServiceCostSummary {
  service_name: string;
  total_cost: number;
  avg_uptime: number;
  avg_p50: number;
  avg_p95: number;
  avg_error_rate: number;
  total_requests: number;
}
export async function getInfrastructureMetrics(
  days: number = 30
): Promise<InfrastructureMetrics[]> {
  const results = await sql`
    SELECT * FROM infrastructure_metrics
    WHERE date >= CURRENT_DATE - (${days} || ' days')::interval
    ORDER BY date DESC, service_name ASC
  `;

  return results.map((row: any) => ({
    id: row.id,
    date: new Date(row.date),
    service_name: row.service_name,
    cost: row.cost ? Number(row.cost) : null,
    uptime_percentage: row.uptime_percentage ? Number(row.uptime_percentage) : null,
    api_response_time_p50: row.api_response_time_p50 ? Number(row.api_response_time_p50) : null,
    api_response_time_p95: row.api_response_time_p95 ? Number(row.api_response_time_p95) : null,
    api_response_time_p99: row.api_response_time_p99 ? Number(row.api_response_time_p99) : null,
    total_requests: row.total_requests ? Number(row.total_requests) : null,
    error_rate: row.error_rate ? Number(row.error_rate) : null,
    created_at: new Date(row.created_at),
  }));
}


export async function getServiceCostSummary(
  days: number = 30
): Promise<ServiceCostSummary[]> {
  const results = await sql`
    SELECT
      service_name,
      COALESCE(SUM(cost), 0) as total_cost,
      COALESCE(AVG(uptime_percentage), 0) as avg_uptime,
      COALESCE(AVG(api_response_time_p50), 0) as avg_p50,
      COALESCE(AVG(api_response_time_p95), 0) as avg_p95,
      COALESCE(AVG(error_rate), 0) as avg_error_rate,
      COALESCE(SUM(total_requests), 0) as total_requests
    FROM infrastructure_metrics
    WHERE date >= CURRENT_DATE - (${days} || ' days')::interval
    GROUP BY service_name
    ORDER BY total_cost DESC
  `;

  return results.map((row: any) => ({
    service_name: row.service_name,
    total_cost: Number(row.total_cost),
    avg_uptime: Number(row.avg_uptime),
    avg_p50: Number(row.avg_p50),
    avg_p95: Number(row.avg_p95),
    avg_error_rate: Number(row.avg_error_rate),
    total_requests: Number(row.total_requests),
  }));
}

// --- Support Tickets ---

export async function getSupportTickets(
  status?: string
): Promise<SupportTicket[]> {
  const results = status
    ? await sql`SELECT * FROM support_tickets WHERE status = ${status} ORDER BY created_at DESC`
    : await sql`SELECT * FROM support_tickets ORDER BY created_at DESC`;

  return results.map((row: any) => ({
    id: row.id,
    customer_id: row.customer_id,
    subject: row.subject,
    description: row.description,
    priority: row.priority,
    category: row.category,
    status: row.status,
    first_response_time: row.first_response_time ? Number(row.first_response_time) : null,
    resolution_time: row.resolution_time ? Number(row.resolution_time) : null,
    assigned_to: row.assigned_to,
    created_at: new Date(row.created_at),
    resolved_at: row.resolved_at ? new Date(row.resolved_at) : null,
  }));
}

export async function getSupportMetrics(): Promise<SupportMetrics> {
  const results = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status IN ('open', 'in_progress')) as open_tickets,
      COALESCE(AVG(first_response_time), 0) as avg_first_response_time,
      COALESCE(AVG(resolution_time) FILTER (WHERE resolution_time IS NOT NULL), 0) as avg_resolution_time,
      COUNT(*) FILTER (WHERE status IN ('resolved', 'closed') AND resolved_at >= CURRENT_DATE - 7) as tickets_closed_this_week,
      COUNT(*) FILTER (WHERE status IN ('resolved', 'closed') AND resolved_at >= CURRENT_DATE - 30) as tickets_closed_this_month
    FROM support_tickets
  `;

  const row: any = results[0];
  return {
    open_tickets: Number(row.open_tickets),
    avg_first_response_time: Number(row.avg_first_response_time),
    avg_resolution_time: Number(row.avg_resolution_time),
    tickets_closed_this_week: Number(row.tickets_closed_this_week),
    tickets_closed_this_month: Number(row.tickets_closed_this_month),
  };
}

export async function getTicketsByPriority(): Promise<{ priority: string; count: number }[]> {
  const results = await sql`
    SELECT priority, COUNT(*) as count
    FROM support_tickets
    WHERE status IN ('open', 'in_progress')
    GROUP BY priority
    ORDER BY
      CASE priority
        WHEN 'critical' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END
  `;

  return results.map((row: any) => ({
    priority: row.priority,
    count: Number(row.count),
  }));
}

export async function getTicketsByCategory(): Promise<{ category: string; count: number }[]> {
  const results = await sql`
    SELECT category, COUNT(*) as count
    FROM support_tickets
    GROUP BY category
    ORDER BY count DESC
  `;

  return results.map((row: any) => ({
    category: row.category,
    count: Number(row.count),
  }));
}
