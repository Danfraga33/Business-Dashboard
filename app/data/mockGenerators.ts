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

// Generate mock pricing experiments
export function generateMockPricingExperiments(count: number) {
  const statuses = ['active', 'completed', 'cancelled'] as const;
  const plans = ['starter', 'pro', 'enterprise'];
  const billings = ['monthly', 'annual'];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 90));
    const endDate = status !== 'active' ? new Date(startDate.getTime() + Math.floor(Math.random() * 30) * 86400000) : null;

    const plan = plans[Math.floor(Math.random() * plans.length)];
    const basePrice = plan === 'starter' ? 29 : plan === 'pro' ? 99 : 499;

    return {
      name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Pricing Test ${i + 1}`,
      hypothesis: `Changing ${plan} price will increase conversions by ${Math.floor(10 + Math.random() * 30)}%`,
      variant_a: JSON.stringify({ plan, price: basePrice, billing: billings[0] }),
      variant_b: JSON.stringify({ plan, price: Math.round(basePrice * (0.8 + Math.random() * 0.4)), billing: billings[Math.floor(Math.random() * 2)] }),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate ? endDate.toISOString().split('T')[0] : null,
      status,
      winner: status === 'completed' ? (Math.random() > 0.5 ? 'A' : 'B') : null,
      revenue_impact: status === 'completed' ? Math.round((Math.random() * 10000 - 3000) * 100) / 100 : null,
      statistical_significance: status === 'completed' ? Math.round((85 + Math.random() * 15) * 100) / 100 : null,
    };
  });
}

// Generate mock feature rollouts
export function generateMockFeatureRollouts(count: number) {
  const statuses = ['dev', 'beta', 'production'] as const;
  const featureNames = [
    'AI-Powered Analytics', 'Custom Dashboards', 'Team Collaboration',
    'API Webhooks', 'Advanced Filters', 'Export to PDF',
    'Slack Integration', 'Mobile App', 'Audit Logging',
    'SSO Authentication', 'Role-Based Access', 'Dark Mode v2',
  ];

  return Array.from({ length: Math.min(count, featureNames.length) }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() - Math.floor(Math.random() * 120));

    return {
      feature_name: featureNames[i],
      description: `${featureNames[i]} - enhances user experience and engagement`,
      status,
      release_date: status !== 'dev' ? releaseDate.toISOString().split('T')[0] : null,
      adoption_rate: status === 'production' ? Math.round(Math.random() * 80 * 100) / 100 : status === 'beta' ? Math.round(Math.random() * 20 * 100) / 100 : null,
      engagement_score: status !== 'dev' ? Math.floor(30 + Math.random() * 70) : null,
      retention_impact: status === 'production' ? Math.round((Math.random() * 10 - 2) * 100) / 100 : null,
    };
  });
}

// Generate mock infrastructure metrics
export function generateMockInfrastructureMetrics(days: number) {
  const services = ['AWS', 'Vercel', 'Neon DB', 'Anthropic API', 'Stripe', 'Cloudflare'];
  const dates = generateDateRange(days);
  const data: any[] = [];

  dates.forEach((date) => {
    services.forEach((service) => {
      const baseCost = service === 'AWS' ? 800 : service === 'Vercel' ? 200 : service === 'Neon DB' ? 150 : service === 'Anthropic API' ? 500 : service === 'Stripe' ? 100 : 50;
      data.push({
        date: date.toISOString().split('T')[0],
        service_name: service,
        cost: Math.round((baseCost + Math.random() * baseCost * 0.3) * 100) / 100,
        uptime_percentage: Math.round((99 + Math.random() * 1) * 100) / 100,
        api_response_time_p50: Math.floor(20 + Math.random() * 80),
        api_response_time_p95: Math.floor(100 + Math.random() * 200),
        api_response_time_p99: Math.floor(200 + Math.random() * 500),
        total_requests: Math.floor(10000 + Math.random() * 90000),
        error_rate: Math.round(Math.random() * 2 * 100) / 100,
      });
    });
  });

  return data;
}

// Generate mock support tickets
export function generateMockSupportTickets(count: number) {
  const priorities = ['low', 'medium', 'high', 'critical'] as const;
  const categories = ['bug', 'feature_request', 'question', 'billing'] as const;
  const statuses = ['open', 'in_progress', 'resolved', 'closed'] as const;
  const subjects = [
    'Cannot export data to CSV', 'Dashboard loading slowly',
    'Feature request: bulk import', 'Billing discrepancy',
    'API rate limit exceeded', 'Login issues on mobile',
    'Chart data not updating', 'Need SSO setup help',
    'Integration with Slack failing', 'Custom report not saving',
  ];
  const agents = ['Alice Chen', 'Bob Martinez', 'Carol Smith', 'David Kim'];

  return Array.from({ length: count }, (_, i) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
    const isResolved = status === 'resolved' || status === 'closed';

    return {
      customer_id: null,
      subject: subjects[i % subjects.length],
      description: `Detailed description for: ${subjects[i % subjects.length]}`,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      status,
      first_response_time: Math.floor(5 + Math.random() * 120),
      resolution_time: isResolved ? Math.floor(30 + Math.random() * 480) : null,
      assigned_to: agents[Math.floor(Math.random() * agents.length)],
      created_at: createdAt.toISOString(),
      resolved_at: isResolved ? new Date(createdAt.getTime() + Math.floor(Math.random() * 48) * 3600000).toISOString() : null,
    };
  });
}

export const mockData = {
  generateCustomers: generateMockCustomers,
  generateSaasMetrics: generateMockSaasMetrics,
  generateMarketingChannels: generateMockMarketingChannels,
  generatePricingExperiments: generateMockPricingExperiments,
  generateFeatureRollouts: generateMockFeatureRollouts,
  generateInfrastructureMetrics: generateMockInfrastructureMetrics,
  generateSupportTickets: generateMockSupportTickets,
  generateDateRange,
};
