// SaaS Metrics Types
export interface SaasMetrics {
  id: number;
  date: Date;
  mrr: number;
  arr: number;
  cac: number;
  ltv: number;
  ltv_cac_ratio: number;
  payback_period_months: number;
  gross_margin: number;
  nrr: number;
  active_customers: number;
  new_customers: number;
  churned_customers: number;
  created_at: Date;
}

// Customer Types
export type CustomerPlan = 'free' | 'starter' | 'pro' | 'enterprise';
export type CustomerSegment = 'smb' | 'mid-market' | 'enterprise';

export interface Customer {
  id: number;
  email: string;
  name: string | null;
  plan: CustomerPlan | null;
  mrr: number | null;
  health_score: number | null; // 0-100
  segment: CustomerSegment | null;
  signup_date: Date | null;
  activation_date: Date | null;
  churned_date: Date | null;
  churn_reason: string | null;
  cohort: string | null; // 'YYYY-MM'
  created_at: Date;
  updated_at: Date;
}

export interface CustomerStats {
  total: number;
  active: number;
  churned: number;
  new_this_month: number;
  activation_rate: number;
  avg_health_score: number;
}

// Marketing Types
export type ChannelType = 'paid' | 'organic';

export interface MarketingChannel {
  id: number;
  channel_name: string;
  channel_type: ChannelType;
  date: Date;
  spend: number | null;
  impressions: number | null;
  clicks: number | null;
  leads: number | null;
  signups: number | null;
  paid_conversions: number | null;
  revenue: number | null;
  created_at: Date;
}

export interface MarketingMetrics {
  total_spend: number;
  blended_cac: number;
  total_signups: number;
  conversion_rate: number;
  ctr: number;
  roas: number;
}

// Pricing Experiments Types
export type ExperimentStatus = 'active' | 'completed' | 'cancelled';
export type ExperimentWinner = 'A' | 'B' | null;

export interface PricingVariant {
  plan: string;
  price: number;
  billing: string;
  features?: string[];
}

export interface PricingExperiment {
  id: number;
  name: string;
  hypothesis: string | null;
  variant_a: PricingVariant;
  variant_b: PricingVariant;
  start_date: Date | null;
  end_date: Date | null;
  status: ExperimentStatus;
  winner: ExperimentWinner;
  revenue_impact: number | null;
  statistical_significance: number | null;
  created_at: Date;
}

// Feature Rollouts Types
export type FeatureStatus = 'dev' | 'beta' | 'production';

export interface FeatureRollout {
  id: number;
  feature_name: string;
  description: string | null;
  status: FeatureStatus;
  release_date: Date | null;
  adoption_rate: number | null;
  engagement_score: number | null; // 0-100
  retention_impact: number | null;
  created_at: Date;
  updated_at: Date;
}

// Infrastructure Types
export interface InfrastructureMetrics {
  id: number;
  date: Date;
  service_name: string | null;
  cost: number | null;
  uptime_percentage: number | null;
  api_response_time_p50: number | null;
  api_response_time_p95: number | null;
  api_response_time_p99: number | null;
  total_requests: number | null;
  error_rate: number | null;
  created_at: Date;
}

// Support Tickets Types
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'bug' | 'feature_request' | 'question' | 'billing';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: number;
  customer_id: number | null;
  subject: string | null;
  description: string | null;
  priority: TicketPriority | null;
  category: TicketCategory | null;
  status: TicketStatus | null;
  first_response_time: number | null; // minutes
  resolution_time: number | null; // minutes
  assigned_to: string | null;
  created_at: Date;
  resolved_at: Date | null;
}

export interface SupportMetrics {
  open_tickets: number;
  avg_first_response_time: number;
  avg_resolution_time: number;
  tickets_closed_this_week: number;
  tickets_closed_this_month: number;
}

// Cohort Analysis Types
export interface CohortData {
  cohort: string; // 'YYYY-MM'
  customers: number;
  mrr: number;
  retention_rate: number;
  churn_rate: number;
}

// Health Indicator Types
export interface HealthScore {
  score: number; // 0-100
  label: 'critical' | 'at-risk' | 'healthy' | 'excellent';
  color: string;
}
