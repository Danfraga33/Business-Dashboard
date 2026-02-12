// Utility to generate dates
export function generateDateRange(daysBack: number): Date[] {
  const dates: Date[] = [];
  const today = new Date();

  for (let i = daysBack; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date);
  }

  return dates;
}

// Generate mock customers
export function generateMockCustomers(count: number) {
  const plans = ['free', 'starter', 'pro', 'enterprise'] as const;
  const segments = ['smb', 'mid-market', 'enterprise'] as const;

  return Array.from({ length: count }, (_, i) => {
    const signup = new Date();
    signup.setDate(signup.getDate() - Math.floor(Math.random() * 365));

    const plan = plans[Math.floor(Math.random() * plans.length)];
    const mrrValues = { free: 0, starter: 29, pro: 99, enterprise: 499 };

    return {
      email: `customer${i + 1}@example.com`,
      name: `Customer ${i + 1}`,
      plan,
      mrr: mrrValues[plan],
      health_score: Math.floor(Math.random() * 100),
      segment: segments[Math.floor(Math.random() * segments.length)],
      signup_date: signup,
      activation_date: Math.random() > 0.2 ? new Date(signup.getTime() + 86400000) : null,
      churned_date: Math.random() > 0.9 ? new Date() : null,
      churn_reason: null,
      cohort: `${signup.getFullYear()}-${String(signup.getMonth() + 1).padStart(2, '0')}`,
    };
  });
}

// Generate mock SaaS metrics
export function generateMockSaasMetrics(days: number) {
  const dates = generateDateRange(days);
  let mrr = 10000;

  return dates.map((date) => {
    mrr += Math.random() * 500 - 200; // Random growth
    const arr = mrr * 12;
    const cac = 150 + Math.random() * 50;
    const ltv = 1800 + Math.random() * 400;

    return {
      date,
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      cac: Math.round(cac),
      ltv: Math.round(ltv),
      ltv_cac_ratio: Number((ltv / cac).toFixed(2)),
      payback_period_months: Number((cac / (mrr / 100)).toFixed(1)),
      gross_margin: 75 + Math.random() * 10,
      nrr: 100 + Math.random() * 20,
      active_customers: Math.floor(mrr / 50),
      new_customers: Math.floor(Math.random() * 10),
      churned_customers: Math.floor(Math.random() * 3),
    };
  });
}

// Generate mock marketing channel data
export function generateMockMarketingChannels(days: number) {
  const channels = [
    { name: 'Google Ads', type: 'paid' as const },
    { name: 'Facebook Ads', type: 'paid' as const },
    { name: 'LinkedIn Ads', type: 'paid' as const },
    { name: 'SEO', type: 'organic' as const },
    { name: 'Content Marketing', type: 'organic' as const },
    { name: 'Referrals', type: 'organic' as const },
  ];

  const dates = generateDateRange(days);
  const data: any[] = [];

  dates.forEach((date) => {
    channels.forEach((channel) => {
      const spend = channel.type === 'paid' ? 500 + Math.random() * 1000 : 0;
      const impressions = Math.floor(10000 + Math.random() * 50000);
      const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.03));
      const signups = Math.floor(clicks * (0.05 + Math.random() * 0.1));
      const paid_conversions = Math.floor(signups * (0.1 + Math.random() * 0.2));

      data.push({
        channel_name: channel.name,
        channel_type: channel.type,
        date,
        spend: channel.type === 'paid' ? Math.round(spend) : null,
        impressions,
        clicks,
        leads: Math.floor(clicks * 0.3),
        signups,
        paid_conversions,
        revenue: paid_conversions * 99,
      });
    });
  });

  return data;
}

export const mockData = {
  generateCustomers: generateMockCustomers,
  generateSaasMetrics: generateMockSaasMetrics,
  generateMarketingChannels: generateMockMarketingChannels,
  generateDateRange,
};
