"use client";

import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  Users,
  Target,
  PhoneCall,
} from "lucide-react";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Default dates: 30 days ago to today
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  // Fetch original analytics summary
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analytics/summary`
        );
        if (!response.ok) throw new Error("Failed to fetch analytics");
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchAnalytics();
  }, []);

  // Fetch performance data with date range
  const fetchPerformanceData = async (start, end) => {
    try {
      setLoading(true);
      const startDateStr = format(start, "yyyy-MM-dd");
      const endDateStr = format(end, "yyyy-MM-dd");
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analytics/leads/performance?start_date=${startDateStr}&end_date=${endDateStr}`
      );
      if (!response.ok) throw new Error("Failed to fetch performance data");
      const result = await response.json();
      setPerformanceData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData(startDate, endDate);
  }, [startDate, endDate]);

  const handleDateChange = (e, dateType) => {
    const newDate = new Date(e.target.value);
    if (dateType === "start") {
      setStartDate(newDate);
    } else {
      setEndDate(newDate);
    }
  };

  const handlePresetRange = (days) => {
    const end = new Date();
    const start = subDays(end, days);
    setStartDate(start);
    setEndDate(end);
    setShowDatePicker(false);
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Color palette for charts
  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  // Calculate totals for the lead status chart
  const statusChartData = performanceData?.by_status?.map((item) => ({
    name: `Status ${item.lead_status}`,
    value: parseInt(item.count),
    percentage: item.percentage,
  })) || [];

  const totalLeads = statusChartData.reduce((sum, item) => sum + item.value, 0);

  // Channel data for bar chart
  const channelData = performanceData?.by_channel?.map((item) => ({
    name: item.lead_channel || "Unknown",
    total_leads: item.total_leads,
    qualified_leads: item.qualified_leads,
    conversion_rate: parseFloat(item.conversion_rate),
  })) || [];

  // Owner performance data
  const ownerData = performanceData?.by_owner?.map((item) => ({
    name: `${item.first_name} ${item.last_name}`,
    total_leads: item.total_leads,
    converted: item.converted,
    conversion_rate: parseFloat(item.conversion_rate),
    avg_calls: parseFloat(item.avg_calls),
  })) || [];

  // Source data
  const sourceData = performanceData?.by_source?.map((item) => {
    let sourceName = item.source_medium;
    try {
      const parsed = JSON.parse(item.source_medium);
      sourceName = parsed.name || "Unknown";
    } catch (e) {
      sourceName = item.source_medium;
    }
    return {
      name: sourceName,
      leads: item.leads,
      qualified: item.qualified,
      qualification_rate: parseFloat(item.qualification_rate),
    };
  }) || [];

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <Icon size={32} style={{ color }} className="opacity-20" />
      </div>
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">{title}</h3>
      {children}
    </div>
  );

  const StatItem = ({ title, value, subtitle }) => (
    <div className="flex flex-col">
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </div>
  );

  const SectionCard = ({ title, icon: Icon, children, color }) => (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-l-4"
      style={{ borderColor: color }}
    >
      <div className="flex items-center mb-6">
        <Icon size={28} style={{ color, marginRight: "12px" }} />
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-8">{children}</div>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        Analytics Dashboard
      </h2>

      {/* Original Analytics Summary */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Leads Section */}
          <SectionCard title="Leads" icon={BarChart3} color="#3B82F6">
            <StatItem
              title="Total Leads"
              value={data.leads.total.toLocaleString()}
            />
            <StatItem
              title="Qualified"
              value={data.leads.qualified.toLocaleString()}
            />
            <StatItem
              title="Converted"
              value={data.leads.converted.toLocaleString()}
            />
            <StatItem
              title="Qualification Rate"
              value={`${data.leads.qualification_rate}%`}
            />
          </SectionCard>

          {/* Admissions Section */}
          <SectionCard title="Admissions" icon={BarChart3} color="#06B6D4">
            <StatItem
              title="Total Admissions"
              value={data.admissions.total.toLocaleString()}
            />
            <StatItem
              title="Unique Courses"
              value={data.admissions.unique_courses.toLocaleString()}
            />
            <StatItem
              title="Unique Universities"
              value={data.admissions.unique_universities.toLocaleString()}
            />
          </SectionCard>

          {/* Revenue Section */}
          <SectionCard title="Revenue" icon={BarChart3} color="#10B981">
            <StatItem
              title="Total Revenue"
              value={`₹${(data.revenue.total / 1000000).toFixed(2)}M`}
              subtitle={`${data.revenue.transactions.toLocaleString()} transactions`}
            />
            <StatItem
              title="Average Revenue"
              value={`₹${data.revenue.average.toFixed(2)}`}
            />
            <StatItem
              title="Transactions"
              value={data.revenue.transactions.toLocaleString()}
            />
          </SectionCard>

          {/* Performance Section */}
          <SectionCard title="Performance" icon={TrendingUp} color="#8B5CF6">
            <StatItem
              title="Conversion Rate"
              value={data.performance.conversion_rate.toLocaleString()}
            />
            <StatItem
              title="Active Counselors"
              value={data.performance.active_counselors}
            />
            <StatItem
              title="Avg Calls/Lead"
              value={data.performance.avg_calls_per_lead}
            />
            <StatItem
              title="Avg Emails/Lead"
              value={data.performance.avg_emails_per_lead}
            />
          </SectionCard>
        </div>
      )}

      {/* Leads Performance Analytics Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Leads Performance Analytics
        </h2>

        {/* Date Range Picker */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-600" />
                <span className="text-gray-600 font-medium">Date Range:</span>
              </div>
              <input
                type="date"
                value={format(startDate, "yyyy-MM-dd")}
                onChange={(e) => handleDateChange(e, "start")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">to</span>
              <input
                type="date"
                value={format(endDate, "yyyy-MM-dd")}
                onChange={(e) => handleDateChange(e, "end")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePresetRange(7)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => handlePresetRange(30)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => handlePresetRange(90)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
              >
                Last 90 Days
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Leads"
              value={totalLeads}
              icon={Target}
              color="#3B82F6"
            />
            <StatCard
              title="Active Channels"
              value={channelData.length}
              icon={BarChart3}
              color="#10B981"
            />
            <StatCard
              title="Sales Owners"
              value={ownerData.length}
              icon={Users}
              color="#F59E0B"
            />
            <StatCard
              title="Lead Sources"
              value={sourceData.length}
              icon={TrendingUp}
              color="#EF4444"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Lead Status Distribution - Pie Chart */}
            <ChartCard title="Lead Status Distribution">
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percentage }) =>
                        `${name}: ${value} (${percentage}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} leads`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </ChartCard>

            {/* Channel Performance - Bar Chart */}
            <ChartCard title="Channel Performance">
              {channelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_leads" fill="#3B82F6" name="Total Leads" />
                    <Bar dataKey="qualified_leads" fill="#10B981" name="Qualified Leads" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </ChartCard>

            {/* Sales Owner Performance */}
            <ChartCard title="Sales Owner Performance">
              {ownerData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ownerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_leads" fill="#F59E0B" name="Total Leads" />
                    <Bar dataKey="converted" fill="#10B981" name="Converted" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </ChartCard>

            {/* Lead Sources */}
            <ChartCard title="Lead Sources Performance">
              {sourceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill="#8B5CF6" name="Total Leads" />
                    <Bar dataKey="qualified" fill="#EC4899" name="Qualified Leads" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </ChartCard>

            {/* Conversion Rate Comparison */}
            <ChartCard title="Conversion Rates by Owner">
              {ownerData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ownerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="conversion_rate"
                      stroke="#EF4444"
                      name="Conversion Rate %"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </ChartCard>

            {/* Average Calls by Owner */}
            <ChartCard title="Average Calls per Owner">
              {ownerData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ownerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg_calls" fill="#06B6D4" name="Avg Calls" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </ChartCard>
          </div>

          {/* Detailed Tables */}
          <div className="grid grid-cols-1 gap-8">
            {/* Channel Details Table */}
            {channelData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Channel Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Channel</th>
                        <th className="px-6 py-3 text-right text-gray-700 font-semibold">Total Leads</th>
                        <th className="px-6 py-3 text-right text-gray-700 font-semibold">Qualified</th>
                        <th className="px-6 py-3 text-right text-gray-700 font-semibold">Conversion Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channelData.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-800">{item.name}</td>
                          <td className="px-6 py-3 text-right text-gray-700">{item.total_leads}</td>
                          <td className="px-6 py-3 text-right text-gray-700">{item.qualified_leads}</td>
                          <td className="px-6 py-3 text-right text-gray-700">{item.conversion_rate.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Owner Details Table */}
            {ownerData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Owner Performance</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-700 font-semibold">Owner</th>
                        <th className="px-6 py-3 text-right text-gray-700 font-semibold">Total Leads</th>
                        <th className="px-6 py-3 text-right text-gray-700 font-semibold">Converted</th>
                        <th className="px-6 py-3 text-right text-gray-700 font-semibold">Conversion Rate</th>
                        <th className="px-6 py-3 text-right text-gray-700 font-semibold">Avg Calls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ownerData.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-6 py-3 text-gray-800">{item.name}</td>
                          <td className="px-6 py-3 text-right text-gray-700">{item.total_leads}</td>
                          <td className="px-6 py-3 text-right text-gray-700">{item.converted}</td>
                          <td className="px-6 py-3 text-right text-gray-700">{item.conversion_rate.toFixed(2)}%</td>
                          <td className="px-6 py-3 text-right text-gray-700">{item.avg_calls.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
