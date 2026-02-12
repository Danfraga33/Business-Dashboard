import { useLoaderData } from "react-router";
import { getMarketingMetrics, getChannelPerformance, type MarketingMetrics, type ChannelPerformance } from "../lib/marketing.server";
import { Layout } from "../components/Layout";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ZAxis } from "recharts";

interface LoaderData {
  metrics: MarketingMetrics;
  paidChannels: ChannelPerformance[];
}

export async function loader() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const [metrics, paidChannels] = await Promise.all([
    getMarketingMetrics(startDate, endDate),
    getChannelPerformance(startDate, endDate, "paid"),
  ]);

  return { metrics, paidChannels };
}

export default function MarketingPaid() {
  const { metrics, paidChannels } = useLoaderData<LoaderData>();

  // Format numbers for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate paid-specific metrics from paidChannels data
  const paidSpend = paidChannels.reduce((sum, channel) => sum + channel.spend, 0);
  const paidSignups = paidChannels.reduce((sum, channel) => sum + channel.signups, 0);
  const paidConversions = paidChannels.reduce((sum, channel) => sum + channel.conversions, 0);
  const paidCAC = paidConversions > 0 ? paidSpend / paidConversions : 0;

  // Prepare scatter plot data (Spend vs Conversions)
  const scatterData = paidChannels.map((channel) => ({
    x: channel.spend,
    y: channel.conversions,
    z: channel.cac,
    name: channel.channel_name,
  }));

  // Prepare CAC comparison data
  const cacChartData = paidChannels.map((channel) => ({
    name: channel.channel_name,
    CAC: channel.cac,
  }));

  // Prepare ROAS comparison data
  const roasChartData = paidChannels.map((channel) => ({
    name: channel.channel_name,
    ROAS: channel.roas,
  }));

  // Custom tooltip for scatter plot
  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Spend: <span className="font-medium">{formatCurrency(data.x)}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Conversions: <span className="font-medium">{data.y.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            CAC: <span className="font-medium">{formatCurrency(data.z)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <PageHeader
          title="Paid Channels"
          description="Performance metrics for paid marketing channels"
        />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Paid Spend"
            value={formatCurrency(paidSpend)}
          />
          <StatCard
            label="Paid CAC"
            value={formatCurrency(paidCAC)}
          />
          <StatCard
            label="Paid Signups"
            value={paidSignups.toLocaleString()}
          />
          <StatCard
            label="Paid Conversions"
            value={paidConversions.toLocaleString()}
          />
        </div>

        {/* Scatter Plot: Spend vs Conversions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Spend vs Conversions
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="x"
                name="Spend"
                tickFormatter={(value) => formatCurrency(value)}
                label={{ value: "Spend", position: "insideBottom", offset: -10 }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name="Conversions"
                label={{ value: "Conversions", angle: -90, position: "insideLeft" }}
              />
              <ZAxis type="number" dataKey="z" range={[50, 400]} name="CAC" />
              <Tooltip content={<CustomScatterTooltip />} />
              <Scatter name="Channels" data={scatterData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CAC by Channel Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              CAC by Channel
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cacChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
                <Bar dataKey="CAC" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ROAS by Channel Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              ROAS by Channel
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roasChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip formatter={(value) => `${(value as number).toFixed(2)}x`} />
                <Legend />
                <Bar dataKey="ROAS" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Paid Channels Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Paid Channels Performance
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Spend
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Signups
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    CAC
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ROAS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paidChannels.map((channel) => (
                  <tr key={channel.channel_name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {channel.channel_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatCurrency(channel.spend)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {channel.clicks.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {channel.ctr.toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {channel.signups.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {channel.conversions.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                      {formatCurrency(channel.cac)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900 dark:text-white">
                      {channel.roas.toFixed(2)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
