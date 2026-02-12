import { json } from "react-router";
import type { Route } from "./+types/data.unit-economics";
import { useLoaderData } from "react-router";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { EmptyState } from "../components/EmptyState";
import { BarChart3 } from "lucide-react";
import { getSaasMetrics, getLatestSaasMetrics } from "../lib/data.server";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";

export async function loader({ request }: Route.LoaderArgs) {
  const [metrics, latest] = await Promise.all([
    getSaasMetrics(90),
    getLatestSaasMetrics(),
  ]);

  return json({ metrics, latest });
}

export default function UnitEconomics({ loaderData }: Route.ComponentProps) {
  const { metrics, latest } = loaderData;

  if (!latest) {
    return (
      <Layout>
        <PageHeader
          title="Unit Economics"
          description="Core SaaS metrics that define business health"
        />
        <EmptyState
          icon={BarChart3}
          title="No data available"
          description="Run 'npm run seed' to populate the database with sample data."
        />
      </Layout>
    );
  }

  const chartData = metrics.map((m) => ({
    date: format(m.date, 'MMM dd'),
    MRR: m.mrr,
    CAC: m.cac,
    LTV: m.ltv,
  }));

  return (
    <Layout>
      <PageHeader
        title="Unit Economics"
        description="Core SaaS metrics that define business health"
      />

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="MRR"
          value={`$${latest.mrr?.toLocaleString() || 0}`}
          trend={5.2}
        />
        <StatCard
          label="ARR"
          value={`$${latest.arr?.toLocaleString() || 0}`}
        />
        <StatCard
          label="CAC"
          value={`$${latest.cac?.toFixed(0) || 0}`}
        />
        <StatCard
          label="LTV"
          value={`$${latest.ltv?.toFixed(0) || 0}`}
        />
      </div>

      {/* Ratio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          label="LTV:CAC Ratio"
          value={latest.ltv_cac_ratio?.toFixed(2) || '0'}
          subtitle="Target: 3:1 or higher"
        />
        <StatCard
          label="Payback Period"
          value={`${latest.payback_period_months?.toFixed(1) || 0} months`}
        />
        <StatCard
          label="Net Revenue Retention"
          value={`${latest.nrr?.toFixed(1) || 0}%`}
        />
      </div>

      {/* Trend Chart */}
      <div className="bg-surface border border-edge rounded-lg p-6">
        <h3 className="text-lg font-semibold text-ink mb-4">90-Day Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="MRR" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="CAC" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="LTV" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <StatCard
          label="Active Customers"
          value={latest.active_customers?.toLocaleString() || '0'}
        />
        <StatCard
          label="New This Month"
          value={latest.new_customers?.toLocaleString() || '0'}
          trend={12.5}
        />
        <StatCard
          label="Churned This Month"
          value={latest.churned_customers?.toLocaleString() || '0'}
          trend={-5.3}
        />
      </div>
    </Layout>
  );
}
