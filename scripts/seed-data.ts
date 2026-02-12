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

    console.log("✓ Database seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seedData();
