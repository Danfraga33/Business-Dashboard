import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { mockData } from "../app/data/mockGenerators";

config();

const sql = neon(process.env.DATABASE_URL!);

async function seedData() {
  console.log("Seeding database with mock data...");

  try {
    // Clear existing data
    await sql`DELETE FROM saas_metrics`;
    await sql`DELETE FROM customers`;
    await sql`DELETE FROM marketing_channels`;

    // Generate and insert SaaS metrics
    const saasMetrics = mockData.generateSaasMetrics(90);
    for (const metric of saasMetrics) {
      await sql`
        INSERT INTO saas_metrics (
          date, mrr, arr, cac, ltv, ltv_cac_ratio, payback_period_months,
          gross_margin, nrr, active_customers, new_customers, churned_customers
        ) VALUES (
          ${metric.date},
          ${metric.mrr},
          ${metric.arr},
          ${metric.cac},
          ${metric.ltv},
          ${metric.ltv_cac_ratio},
          ${metric.payback_period_months},
          ${metric.gross_margin},
          ${metric.nrr},
          ${metric.active_customers},
          ${metric.new_customers},
          ${metric.churned_customers}
        )
      `;
    }
    console.log(`✓ Inserted ${saasMetrics.length} SaaS metrics records`);

    // Generate and insert customers
    const customers = mockData.generateCustomers(100);
    for (const customer of customers) {
      await sql`
        INSERT INTO customers (
          email, name, plan, mrr, health_score, segment,
          signup_date, activation_date, churned_date, cohort
        ) VALUES (
          ${customer.email},
          ${customer.name},
          ${customer.plan},
          ${customer.mrr},
          ${customer.health_score},
          ${customer.segment},
          ${customer.signup_date},
          ${customer.activation_date},
          ${customer.churned_date},
          ${customer.cohort}
        )
      `;
    }
    console.log(`✓ Inserted ${customers.length} customer records`);

    // Generate and insert marketing channels
    const marketingChannels = mockData.generateMarketingChannels(90);
    for (const channel of marketingChannels) {
      await sql`
        INSERT INTO marketing_channels (
          channel_name, channel_type, date, spend, impressions, clicks,
          leads, signups, paid_conversions, revenue
        ) VALUES (
          ${channel.channel_name},
          ${channel.channel_type},
          ${channel.date},
          ${channel.spend},
          ${channel.impressions},
          ${channel.clicks},
          ${channel.leads},
          ${channel.signups},
          ${channel.paid_conversions},
          ${channel.revenue}
        )
      `;
    }
    console.log(`✓ Inserted ${marketingChannels.length} marketing channel records`);

    // Clear and seed operations data
    await sql`DELETE FROM support_tickets`;
    await sql`DELETE FROM feature_rollouts`;
    await sql`DELETE FROM pricing_experiments`;
    await sql`DELETE FROM infrastructure_metrics`;

    // Generate and insert pricing experiments
    const pricingExperiments = mockData.generatePricingExperiments(8);
    for (const exp of pricingExperiments) {
      await sql`
        INSERT INTO pricing_experiments (
          name, hypothesis, variant_a, variant_b, start_date, end_date,
          status, winner, revenue_impact, statistical_significance
        ) VALUES (
          ${exp.name}, ${exp.hypothesis},
          ${exp.variant_a}::jsonb, ${exp.variant_b}::jsonb,
          ${exp.start_date}, ${exp.end_date},
          ${exp.status}, ${exp.winner},
          ${exp.revenue_impact}, ${exp.statistical_significance}
        )
      `;
    }
    console.log(`✓ Inserted ${pricingExperiments.length} pricing experiment records`);

    // Generate and insert feature rollouts
    const featureRollouts = mockData.generateFeatureRollouts(10);
    for (const feature of featureRollouts) {
      await sql`
        INSERT INTO feature_rollouts (
          feature_name, description, status, release_date,
          adoption_rate, engagement_score, retention_impact
        ) VALUES (
          ${feature.feature_name}, ${feature.description},
          ${feature.status}, ${feature.release_date},
          ${feature.adoption_rate}, ${feature.engagement_score},
          ${feature.retention_impact}
        )
      `;
    }
    console.log(`✓ Inserted ${featureRollouts.length} feature rollout records`);

    // Generate and insert infrastructure metrics
    const infraMetrics = mockData.generateInfrastructureMetrics(30);
    for (const metric of infraMetrics) {
      await sql`
        INSERT INTO infrastructure_metrics (
          date, service_name, cost, uptime_percentage,
          api_response_time_p50, api_response_time_p95, api_response_time_p99,
          total_requests, error_rate
        ) VALUES (
          ${metric.date}, ${metric.service_name}, ${metric.cost},
          ${metric.uptime_percentage}, ${metric.api_response_time_p50},
          ${metric.api_response_time_p95}, ${metric.api_response_time_p99},
          ${metric.total_requests}, ${metric.error_rate}
        )
      `;
    }
    console.log(`✓ Inserted ${infraMetrics.length} infrastructure metric records`);

    // Generate and insert support tickets
    const supportTickets = mockData.generateSupportTickets(30);
    for (const ticket of supportTickets) {
      await sql`
        INSERT INTO support_tickets (
          customer_id, subject, description, priority, category,
          status, first_response_time, resolution_time, assigned_to,
          created_at, resolved_at
        ) VALUES (
          ${ticket.customer_id}, ${ticket.subject}, ${ticket.description},
          ${ticket.priority}, ${ticket.category}, ${ticket.status},
          ${ticket.first_response_time}, ${ticket.resolution_time},
          ${ticket.assigned_to}, ${ticket.created_at}, ${ticket.resolved_at}
        )
      `;
    }
    console.log(`✓ Inserted ${supportTickets.length} support ticket records`);

    console.log("✓ Database seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
