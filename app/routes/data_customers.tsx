import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { EmptyState } from "../components/EmptyState";
import { Users } from "lucide-react";
import {
  getAllCustomers,
  getCustomerStats,
  getCohortAnalysis,
} from "../lib/data.server";
import type { Customer, CohortData } from "../types/dashboard";
import { format } from "date-fns";

export async function loader() {
  const [customers, stats, cohorts] = await Promise.all([
    getAllCustomers(),
    getCustomerStats(),
    getCohortAnalysis(),
  ]);

  return { customers, stats, cohorts };
}

function getHealthLabel(score: number | null): { label: string; color: string } {
  if (score === null) return { label: 'Unknown', color: 'text-ink-muted' };
  if (score >= 76) return { label: 'Excellent', color: 'text-green-600' };
  if (score >= 51) return { label: 'Healthy', color: 'text-blue-600' };
  if (score >= 26) return { label: 'At Risk', color: 'text-yellow-600' };
  return { label: 'Critical', color: 'text-red-600' };
}

export default function Customers({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { customers, stats, cohorts } = loaderData;

  if (customers.length === 0) {
    return (
      <>
        <PageHeader
          title="Customers"
          description="Customer lifecycle and behavioral metrics"
        />
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Run 'npm run seed' to populate the database with sample customer data."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description="Customer lifecycle and behavioral metrics"
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Customers"
          value={stats.total.toLocaleString()}
        />
        <StatCard
          label="Active"
          value={stats.active.toLocaleString()}
        />
        <StatCard
          label="New This Month"
          value={stats.new_this_month.toLocaleString()}
          change={15.2}
        />
        <StatCard
          label="Churned"
          value={stats.churned.toLocaleString()}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          label="Activation Rate"
          value={`${stats.activation_rate.toFixed(1)}%`}
        />
        <StatCard
          label="Avg Health Score"
          value={stats.avg_health_score.toFixed(0)}
        />
      </div>

      {/* Cohort Analysis */}
      <div className="bg-surface border border-edge rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-ink mb-4">Cohort Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Cohort</th>
                <th className="text-right text-xs font-medium text-ink-secondary py-3 px-4">Customers</th>
                <th className="text-right text-xs font-medium text-ink-secondary py-3 px-4">MRR</th>
                <th className="text-right text-xs font-medium text-ink-secondary py-3 px-4">Retention</th>
                <th className="text-right text-xs font-medium text-ink-secondary py-3 px-4">Churn</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((cohort: CohortData) => (
                <tr key={cohort.cohort} className="border-b border-edge">
                  <td className="py-3 px-4 text-sm text-ink">{cohort.cohort}</td>
                  <td className="py-3 px-4 text-sm text-ink text-right">{cohort.customers}</td>
                  <td className="py-3 px-4 text-sm text-ink text-right">${cohort.mrr.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-green-600 text-right">{cohort.retention_rate}%</td>
                  <td className="py-3 px-4 text-sm text-red-600 text-right">{cohort.churn_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-surface border border-edge rounded-lg p-6">
        <h3 className="text-lg font-semibold text-ink mb-4">Recent Customers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-edge">
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Email</th>
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Plan</th>
                <th className="text-right text-xs font-medium text-ink-secondary py-3 px-4">MRR</th>
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Health</th>
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Segment</th>
                <th className="text-left text-xs font-medium text-ink-secondary py-3 px-4">Signup Date</th>
              </tr>
            </thead>
            <tbody>
              {customers.slice(0, 20).map((customer: Customer) => {
                const health = getHealthLabel(customer.health_score);
                return (
                  <tr key={customer.id} className="border-b border-edge">
                    <td className="py-3 px-4 text-sm text-ink">{customer.email}</td>
                    <td className="py-3 px-4 text-sm text-ink capitalize">{customer.plan || '-'}</td>
                    <td className="py-3 px-4 text-sm text-ink text-right">
                      ${customer.mrr?.toFixed(0) || 0}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span className={`${health.color} font-medium`}>
                        {customer.health_score || '-'} {customer.health_score && `(${health.label})`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-ink capitalize">{customer.segment || '-'}</td>
                    <td className="py-3 px-4 text-sm text-ink-secondary">
                      {customer.signup_date ? format(customer.signup_date, 'MMM dd, yyyy') : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
