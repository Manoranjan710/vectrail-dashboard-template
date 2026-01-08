"use client";

import { useState, useEffect } from "react";
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
  TrendingUp,
  Target,
  Users,
  AlertCircle,
  DollarSign,
} from "lucide-react";

// Utility function to truncate text
const truncateText = (text, maxLength = 6) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export default function Campaign() {
  const [campaigns, setCampaigns] = useState([]);
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analytics/campaigns`
        );
        if (!response.ok) throw new Error("Failed to fetch campaigns");
        const result = await response.json();
        setCampaigns(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoadingRevenue(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/analytics/revenue`
        );
        if (!response.ok) throw new Error("Failed to fetch revenue data");
        const result = await response.json();
        setRevenueData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingRevenue(false);
      }
    };

    fetchRevenue();
  }, []);

  const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-gray-500 text-sm">{message}</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Color palette
  const COLORS = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#14B8A6",
  ];

  // Calculate summary stats
  const totalLeads = campaigns.reduce((sum, c) => sum + c.total_leads, 0);
  const totalQualified = campaigns.reduce(
    (sum, c) => sum + c.qualified_leads,
    0
  );
  const totalConverted = campaigns.reduce(
    (sum, c) => sum + c.converted_leads,
    0
  );
  const avgConversionRate = (
    campaigns.reduce((sum, c) => sum + parseFloat(c.conversion_rate || 0), 0) /
    campaigns.length
  ).toFixed(2);

  // Revenue stats
  const totalRevenue =
    revenueData?.by_university?.reduce(
      (sum, u) => sum + (parseFloat(u.total_revenue) || 0),
      0
    ) || 0;
  const totalStudents =
    revenueData?.by_university?.reduce((sum, u) => sum + u.total_students, 0) ||
    0;
  const avgRevenuePerStudent =
    totalStudents > 0 ? (totalRevenue / totalStudents).toFixed(2) : 0;
  const pendingPayments = revenueData?.by_university?.reduce(
  (sum, u) => sum + (u.total_students - u.paying_students),
  0
) || 0;


  // Top universities by revenue
  const topUniversities =
    revenueData?.by_university
      ?.filter((u) => parseFloat(u.total_revenue) > 0)
      ?.sort(
        (a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue)
      )
      ?.slice(0, 10)
      ?.map((u) => ({
        name: truncateText(u.UniversityName, 6),
        revenue: Math.round(parseFloat(u.total_revenue) / 100000) / 10, // Convert to lakhs
        fullName: u.UniversityName,
        student_count: u.student_count,
      })) || [];

  // Top courses by revenue
  const topCourses =
    revenueData?.by_course
      ?.sort(
        (a, b) => parseFloat(b.total_revenue) - parseFloat(a.total_revenue)
      )
      ?.slice(0, 10)
      ?.map((c) => ({
        name: truncateText(c.Course, 6),
        revenue: Math.round(parseFloat(c.total_revenue) / 100000) / 10,
        students: c.student_count,
        fullName: c.Course,
      })) || [];

  // Payment modes data
  const paymentModesData =
    revenueData?.payment_modes
      ?.filter((p) => p.total_amount !== null)
      ?.map((p) => ({
        name:'ModeId '+ p.ModeId,
        value: Math.round(parseFloat(p.total_amount) / 100000) / 10, // Convert to lakhs
        transactions: p.transaction_count,
      })) || [];

  // Data for leads by campaign bar chart
  const campaignLeadsData = campaigns
    .sort((a, b) => b.total_leads - a.total_leads)
    .slice(0, 10)
    .map((c) => ({
      name: truncateText(c.campaign_name, 6),
      total_leads: c.total_leads,
      qualified_leads: c.qualified_leads,
      converted_leads: c.converted_leads,
      fullName: c.campaign_name,
    }));

  // Data for channel distribution
  const channelMap = {};
  campaigns.forEach((c) => {
    if (!channelMap[c.lead_channel]) {
      channelMap[c.lead_channel] = {
        channel: c.lead_channel || "Unknown",
        count: 0,
        leads: 0,
      };
    }
    channelMap[c.lead_channel].count += 1;
    channelMap[c.lead_channel].leads += c.total_leads;
  });
  const channelData = Object.values(channelMap);

  // Conversion rate data
  const conversionData = campaigns
    .filter((c) => parseFloat(c.conversion_rate) > 0)
    .sort(
      (a, b) => parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate)
    )
    .slice(0, 8)
    .map((c) => ({
      name: truncateText(c.campaign_name, 6),
      conversion_rate: parseFloat(c.conversion_rate),
      fullName: c.campaign_name,
    }));

  // Campaign status data
  const statusData = [
    {
      name: "Total Leads",
      value: totalLeads,
      color: "#3B82F6",
    },
    {
      name: "Qualified",
      value: totalQualified,
      color: "#10B981",
    },
    {
      name: "Converted",
      value: totalConverted,
      color: "#EF4444",
    },
  ];

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div
      className="bg-white rounded-lg shadow p-6 border-l-4"
      style={{ borderColor: color }}
    >
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

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-900">
        Campaign Analytics
      </h2>

      {/* Campaign Section */}
      {loading ? (
        <LoadingSpinner message="Loading campaign data..." />
      ) : (
        <>
          {/* Campaign Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Leads"
              value={totalLeads}
              icon={Target}
              color="#3B82F6"
            />
            <StatCard
              title="Qualified Leads"
              value={totalQualified}
              icon={Users}
              color="#10B981"
            />
            <StatCard
              title="Converted Leads"
              value={totalConverted}
              icon={TrendingUp}
              color="#EF4444"
            />
            <StatCard
              title="Avg Conversion Rate"
              value={`${avgConversionRate}%`}
              icon={AlertCircle}
              color="#F59E0B"
            />
          </div>

          {/* Campaign Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Campaigns by Leads */}
            <ChartCard title="Top Campaigns by Total Leads">
              {campaignLeadsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignLeadsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      width={100}
                    />
                    <YAxis />
                    <Tooltip
                      content={({ active, payload }) => 
                        active && payload?.length ? (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                            <p className="text-sm font-semibold text-gray-900">{payload[0].payload.fullName}</p>
                            <p className="text-sm text-gray-700">{payload[0].name}: {payload[0].value}</p>
                          </div>
                        ) : null
                      }
                    />
                    <Legend />
                    <Bar
                      dataKey="total_leads"
                      fill="#3B82F6"
                      name="Total Leads"
                    />
                    <Bar
                      dataKey="qualified_leads"
                      fill="#10B981"
                      name="Qualified"
                    />
                    <Bar
                      dataKey="converted_leads"
                      fill="#EF4444"
                      name="Converted"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No data available
                </p>
              )}
            </ChartCard>

            {/* Leads by Channel Distribution */}
            <ChartCard title="Lead Distribution by Channel">
              {channelData.length > 0 ? (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="leads"
                        >
                          {channelData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} leads`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Channel Legend */}
                  <div className="grid grid-cols-2 gap-4">
                    {channelData.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex items-center gap-2 mb-1">
                          <span 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          ></span>
                          <span className="text-gray-700 font-medium text-sm">{item.channel}</span>
                        </div>
                        <div className="ml-5">
                          <p className="text-gray-600 text-sm">{item.leads} leads</p>
                          <p className="text-gray-500 text-xs">{item.count} campaigns</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No data available
                </p>
              )}
            </ChartCard>

            {/* Campaigns Count by Channel */}
            <ChartCard title="Number of Campaigns by Channel">
              {channelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={channelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#06B6D4" name="Campaign Count" />
                    <Bar dataKey="leads" fill="#F59E0B" name="Total Leads" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No data available
                </p>
              )}
            </ChartCard>

            {/* Conversion Rates */}
            <ChartCard title="Campaign Conversion Rates">
              {conversionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      width={100}
                    />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload }) => 
                        active && payload?.length ? (
                          <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                            <p className="text-sm font-semibold text-gray-900">{payload[0].payload.fullName}</p>
                            <p className="text-sm text-gray-700">{payload[0].value.toFixed(2)}%</p>
                          </div>
                        ) : null
                      }
                    />
                    <Bar
                      dataKey="conversion_rate"
                      fill="#EF4444"
                      name="Conversion Rate %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <p>No campaigns with conversion rate &gt; 0%</p>
                </div>
              )}
            </ChartCard>
          </div>

          {/* Campaigns Table */}
          {campaigns.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                All Campaigns
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Campaign Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Channel
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Total Leads
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Qualified
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Converted
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Conversion Rate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        End Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {campaigns.map((campaign, idx) => (
                      <tr key={idx} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors duration-150">
                        <td
                          className="px-6 py-4 text-sm text-gray-900 font-medium truncate max-w-xs"
                          title={campaign.campaign_name}
                        >
                          {campaign.campaign_name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {campaign.lead_channel || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-right">
                          {campaign.total_leads}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-right">
                          {campaign.qualified_leads}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 text-right">
                          {campaign.converted_leads}
                        </td>
                        <td className="px-6 py-4 text-sm text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {parseFloat(campaign.conversion_rate).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(campaign.start_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(campaign.end_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Revenue Analytics Section */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          Revenue Analytics
        </h2>

        {loadingRevenue ? (
          <LoadingSpinner message="Loading revenue data..." />
        ) : revenueData ? (
          <>
            {/* Revenue Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Revenue"
                value={`₹${(totalRevenue / 10000000).toFixed(2)}Cr`}
                icon={DollarSign}
                color="#10B981"
              />
              <StatCard
                title="Total Students"
                value={totalStudents.toLocaleString()}
                icon={Users}
                color="#3B82F6"
              />
              <StatCard
                title="Avg Revenue/Student"
                value={`₹${parseInt(avgRevenuePerStudent).toLocaleString()}`}
                icon={TrendingUp}
                color="#F59E0B"
              />
              <StatCard
                title="Pending Payments"
                value={`₹${(pendingPayments / 100000).toFixed(2)}L`}
                icon={AlertCircle}
                color="#EF4444"
              />
            </div>

            {/* Revenue Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Top Universities by Revenue */}
              <ChartCard title="Top 10 Universities by Revenue">
                {topUniversities.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topUniversities}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => 
                          active && payload?.length ? (
                            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                              <p className="text-sm font-semibold text-gray-900">{payload[0].payload.fullName}</p>
                              <p className="text-sm text-gray-700">₹{payload[0].value}L</p>
                            </div>
                          ) : null
                        }
                      />
                      <Bar
                        dataKey="revenue"
                        fill="#10B981"
                        name="Revenue (in Lakhs)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No revenue data available
                  </p>
                )}
              </ChartCard>

              {/* Top Courses by Revenue */}
              <ChartCard title="Top 10 Courses by Revenue">
                {topCourses.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCourses}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => 
                          active && payload?.length ? (
                            <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                              <p className="text-sm font-semibold text-gray-900">{payload[0].payload.fullName}</p>
                              <p className="text-sm text-gray-700">₹{payload[0].value}L</p>
                            </div>
                          ) : null
                        }
                      />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        fill="#3B82F6"
                        name="Revenue (in Lakhs)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No course revenue data available
                  </p>
                )}
              </ChartCard>

              {/* Payment Modes Distribution */}
              <ChartCard title="Revenue by Payment Mode">
                {paymentModesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentModesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ₹${value}L`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentModesData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}L`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No payment mode data available
                  </p>
                )}
              </ChartCard>

              {/* Student Distribution */}
              {/* <ChartCard title="Student Count by Top Universities">
                {topUniversities.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topUniversities}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="student_count"
                        fill="#06B6D4"
                        name="Students"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No student data available
                  </p>
                )}
              </ChartCard> */}
            </div>

            {/* Universities Table */}
            {revenueData.by_university &&
              revenueData.by_university.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">
                    University Revenue Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            University Name
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Students
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Total Revenue
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Avg/Student
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Transactions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {revenueData.by_university
                          ?.filter((uni) => uni)
                          ?.slice(0, 20)
                          ?.map((uni, idx) => (
                            <tr key={idx} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors duration-150">
                              <td
                                className="px-6 py-4 text-sm text-gray-900 font-medium truncate max-w-xs"
                                title={uni?.UniversityName}
                              >
                                {uni?.UniversityName}
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-gray-700">
                                {uni?.total_students?.toLocaleString?.() || "0"}
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-gray-700">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                  ₹{uni?.total_revenue
                                    ? parseInt(uni.total_revenue).toLocaleString()
                                    : "0"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-gray-700">
                                ₹
                                {uni?.avg_revenue_per_student
                                  ? parseInt(
                                      uni.avg_revenue_per_student
                                    ).toLocaleString()
                                  : "0"}
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-gray-700">
                                {uni?.transaction_count?.toLocaleString?.() || "0"}
                              </td>
                            </tr>
                          )) || []}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* Courses Table */}
            {revenueData.by_course && revenueData.by_course.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Course Revenue Details
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Course Name
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Total Revenue
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Avg/Student
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {revenueData.by_course
                        ?.filter((course) => course)
                        ?.slice(0, 20)
                        ?.map((course, idx) => (
                          <tr key={idx} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors duration-150">
                            <td
                              className="px-6 py-4 text-sm text-gray-900 font-medium truncate max-w-xs"
                              title={course?.Course}
                            >
                              {course?.Course}
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-700">
                              {course?.total_students?.toLocaleString?.() || "0"}
                            </td>
                            <td className="px-6 py-4 text-right text-sm">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                ₹{course?.total_revenue ? parseInt(course.total_revenue).toLocaleString() : "0"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm text-gray-700">
                              ₹
                              {course?.avg_revenue_per_student
                                ? parseInt(
                                    course.avg_revenue_per_student
                                  ).toLocaleString()
                                : "0"}
                            </td>
                          </tr>
                        )) || []}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
