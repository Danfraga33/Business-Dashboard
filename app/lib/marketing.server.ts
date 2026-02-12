import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// TypeScript Interfaces
export interface MarketingChannel {
  id: number;
  channel_name: string;
  channel_type: 'paid' | 'organic';
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  signups: number;
  paid_conversions: number;
  revenue: number;
  created_at: string;
}

export interface MarketingMetrics {
  totalSpend: number;
  totalSignups: number;
  totalConversions: number;
  totalRevenue: number;
  blendedCAC: number;
  conversionRate: number;
  roas: number;
}

export interface ChannelPerformance {
  channel_name: string;
  channel_type: 'paid' | 'organic';
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  signups: number;
  conversions: number;
  revenue: number;
  cac: number;
  roas: number;
  ctr: number;
}

/**
 * Fetch all marketing channels for a date range
 */
export async function getMarketingChannels(
  startDate?: Date,
  endDate?: Date,
  channelType?: 'paid' | 'organic'
): Promise<MarketingChannel[]> {
  let query = sql`
    SELECT
      id,
      channel_name,
      channel_type,
      date::text as date,
      spend,
      impressions,
      clicks,
      leads,
      signups,
      paid_conversions,
      revenue,
      created_at::text as created_at
    FROM marketing_channels
    WHERE 1=1
  `;

  if (startDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    query = sql`${query} AND date >= ${startDateStr}`;
  }

  if (endDate) {
    const endDateStr = endDate.toISOString().split('T')[0];
    query = sql`${query} AND date <= ${endDateStr}`;
  }

  if (channelType) {
    query = sql`${query} AND channel_type = ${channelType}`;
  }

  query = sql`${query} ORDER BY date DESC, channel_name ASC`;

  const results = await query;
  return results as MarketingChannel[];
}

/**
 * Calculate aggregate metrics across all channels
 */
export async function getMarketingMetrics(
  startDate?: Date,
  endDate?: Date
): Promise<MarketingMetrics> {
  let query = sql`
    SELECT
      COALESCE(SUM(spend), 0) as total_spend,
      COALESCE(SUM(signups), 0) as total_signups,
      COALESCE(SUM(paid_conversions), 0) as total_conversions,
      COALESCE(SUM(revenue), 0) as total_revenue
    FROM marketing_channels
    WHERE 1=1
  `;

  if (startDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    query = sql`${query} AND date >= ${startDateStr}`;
  }

  if (endDate) {
    const endDateStr = endDate.toISOString().split('T')[0];
    query = sql`${query} AND date <= ${endDateStr}`;
  }

  const results = await query;
  const row = results[0] as any;

  const totalSpend = Number(row.total_spend);
  const totalSignups = Number(row.total_signups);
  const totalConversions = Number(row.total_conversions);
  const totalRevenue = Number(row.total_revenue);

  const blendedCAC = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const conversionRate = totalSignups > 0 ? (totalConversions / totalSignups) * 100 : 0;
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  return {
    totalSpend,
    totalSignups,
    totalConversions,
    totalRevenue,
    blendedCAC,
    conversionRate,
    roas,
  };
}

/**
 * Get channel performance aggregated by channel
 */
export async function getChannelPerformance(
  startDate?: Date,
  endDate?: Date,
  channelType?: 'paid' | 'organic'
): Promise<ChannelPerformance[]> {
  let query = sql`
    SELECT
      channel_name,
      channel_type,
      COALESCE(SUM(spend), 0) as spend,
      COALESCE(SUM(impressions), 0) as impressions,
      COALESCE(SUM(clicks), 0) as clicks,
      COALESCE(SUM(leads), 0) as leads,
      COALESCE(SUM(signups), 0) as signups,
      COALESCE(SUM(paid_conversions), 0) as conversions,
      COALESCE(SUM(revenue), 0) as revenue
    FROM marketing_channels
    WHERE 1=1
  `;

  if (startDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    query = sql`${query} AND date >= ${startDateStr}`;
  }

  if (endDate) {
    const endDateStr = endDate.toISOString().split('T')[0];
    query = sql`${query} AND date <= ${endDateStr}`;
  }

  if (channelType) {
    query = sql`${query} AND channel_type = ${channelType}`;
  }

  query = sql`${query} GROUP BY channel_name, channel_type ORDER BY spend DESC`;

  const results = await query;

  return results.map((row: any) => {
    const spend = Number(row.spend);
    const impressions = Number(row.impressions);
    const clicks = Number(row.clicks);
    const conversions = Number(row.conversions);
    const revenue = Number(row.revenue);

    const cac = conversions > 0 ? spend / conversions : 0;
    const roas = spend > 0 ? revenue / spend : 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return {
      channel_name: row.channel_name,
      channel_type: row.channel_type,
      spend,
      impressions,
      clicks,
      leads: Number(row.leads),
      signups: Number(row.signups),
      conversions,
      revenue,
      cac,
      roas,
      ctr,
    };
  });
}

/**
 * Get time-series data for a specific channel
 */
export async function getChannelTimeSeries(
  channelName: string,
  startDate?: Date,
  endDate?: Date
): Promise<MarketingChannel[]> {
  let query = sql`
    SELECT
      id,
      channel_name,
      channel_type,
      date::text as date,
      spend,
      impressions,
      clicks,
      leads,
      signups,
      paid_conversions,
      revenue,
      created_at::text as created_at
    FROM marketing_channels
    WHERE channel_name = ${channelName}
  `;

  if (startDate) {
    const startDateStr = startDate.toISOString().split('T')[0];
    query = sql`${query} AND date >= ${startDateStr}`;
  }

  if (endDate) {
    const endDateStr = endDate.toISOString().split('T')[0];
    query = sql`${query} AND date <= ${endDateStr}`;
  }

  query = sql`${query} ORDER BY date ASC`;

  const results = await query;
  return results as MarketingChannel[];
}
