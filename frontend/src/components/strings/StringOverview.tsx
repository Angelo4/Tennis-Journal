"use client";

import { useState, useMemo } from "react";
import {
  format,
  differenceInDays,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { useStrings, useSessions } from "@/hooks/useApi";
import type { TennisString, TennisSession } from "@/api";
import { Tabs, StatCard, LoadingContainer } from "@/components/ui";
import { ChartContainer } from "@/components/charts";
import { STRING_TYPE_LABELS, CHART_COLORS } from "@/utils/constants";

type StringFilter = "active" | "removed" | "all";

interface StringStats {
  string: TennisString;
  totalSessions: number;
  totalMinutes: number;
  totalHours: number;
  avgRating: number;
  daysSinceStrung: number;
  daysActive: number;
}

export function StringOverview() {
  const { data: strings, isLoading: stringsLoading } = useStrings();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const [filter, setFilter] = useState<StringFilter>("all");

  // Filter strings based on active/removed status
  const filteredStrings = useMemo(() => {
    if (!strings) return [];
    return strings.filter((str) => {
      if (filter === "active") return str.isActive !== false;
      if (filter === "removed") return str.isActive === false;
      return true;
    });
  }, [strings, filter]);

  // Calculate stats for each string
  const stringStats = useMemo((): StringStats[] => {
    if (!filteredStrings || !sessions) return [];

    return filteredStrings
      .map((str) => {
        const stringSessions = sessions.filter((s) => s.stringId === str.id);
        const totalMinutes = stringSessions.reduce(
          (sum, s) => sum + (s.durationMinutes ?? 0),
          0
        );
        const ratingsWithValues = stringSessions.filter(
          (s) => s.stringFeelingRating != null
        );
        const avgRating =
          ratingsWithValues.length > 0
            ? ratingsWithValues.reduce(
                (sum, s) => sum + (s.stringFeelingRating ?? 0),
                0
              ) / ratingsWithValues.length
            : 0;

        const dateStrung = str.dateStrung ? parseISO(str.dateStrung) : new Date();
        const endDate =
          str.isActive === false && str.dateRemoved
            ? parseISO(str.dateRemoved)
            : new Date();

        return {
          string: str,
          totalSessions: stringSessions.length,
          totalMinutes,
          totalHours: Math.round((totalMinutes / 60) * 10) / 10,
          avgRating: Math.round(avgRating * 10) / 10,
          daysSinceStrung: differenceInDays(new Date(), dateStrung),
          daysActive: differenceInDays(endDate, dateStrung),
        };
      })
      .sort((a, b) => b.totalHours - a.totalHours);
  }, [filteredStrings, sessions]);

  // Overall aggregated stats
  const overallStats = useMemo(() => {
    if (!stringStats.length) return null;

    const totalHours = stringStats.reduce((sum, s) => sum + s.totalHours, 0);
    const totalSessions = stringStats.reduce(
      (sum, s) => sum + s.totalSessions,
      0
    );
    const avgRatings = stringStats.filter((s) => s.avgRating > 0);
    const overallAvgRating =
      avgRatings.length > 0
        ? avgRatings.reduce((sum, s) => sum + s.avgRating, 0) / avgRatings.length
        : 0;
    const avgDaysPerString =
      stringStats.reduce((sum, s) => sum + s.daysActive, 0) / stringStats.length;

    return {
      totalStrings: stringStats.length,
      totalHours: Math.round(totalHours * 10) / 10,
      totalSessions,
      avgRating: Math.round(overallAvgRating * 10) / 10,
      avgDaysPerString: Math.round(avgDaysPerString),
    };
  }, [stringStats]);

  // Data for hours per string bar chart
  const hoursPerStringData = useMemo(() => {
    return stringStats.slice(0, 10).map((s) => ({
      name: `${s.string.brand} ${s.string.model}`.substring(0, 15),
      hours: s.totalHours,
      sessions: s.totalSessions,
      fullName: `${s.string.brand} ${s.string.model}`,
    }));
  }, [stringStats]);

  // Data for string type distribution
  const stringTypeData = useMemo(() => {
    const typeCounts: Record<number, number> = {};
    filteredStrings?.forEach((str) => {
      const type = str.type ?? 0;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: STRING_TYPE_LABELS[Number(type)],
      value: count,
    }));
  }, [filteredStrings]);

  // Monthly usage data (last 6 months) - per string
  const { monthlyUsageData, stringKeysForChart } = useMemo(() => {
    if (!sessions || !filteredStrings || filteredStrings.length === 0) {
      return { monthlyUsageData: [], stringKeysForChart: [] };
    }

    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    const months = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: endOfMonth(now),
    });

    // Create a map of string id to display name
    const stringNameMap: Record<string, string> = {};
    filteredStrings.forEach((str) => {
      if (str.id) {
        stringNameMap[str.id] = `${str.brand} ${str.model}`.substring(0, 15);
      }
    });

    const data = months.map((month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const result: Record<string, string | number> = {
        month: format(month, "MMM yy"),
      };

      // Calculate hours for each string in this month
      filteredStrings.forEach((str) => {
        if (!str.id) return;

        const stringSessions = sessions.filter((s) => {
          if (s.stringId !== str.id) return false;
          const sessionDate = parseISO(s.sessionDate!);
          return sessionDate >= monthStart && sessionDate <= monthEnd;
        });

        const totalMinutes = stringSessions.reduce(
          (sum, s) => sum + (s.durationMinutes ?? 0),
          0
        );
        const key = stringNameMap[str.id];
        result[key] = Math.round((totalMinutes / 60) * 10) / 10;
      });

      return result;
    });

    // Get unique string keys that have at least some data
    const keysWithData = new Set<string>();
    data.forEach((monthData) => {
      Object.entries(monthData).forEach(([key, value]) => {
        if (key !== "month" && typeof value === "number" && value > 0) {
          keysWithData.add(key);
        }
      });
    });

    return {
      monthlyUsageData: data,
      stringKeysForChart: Array.from(keysWithData),
    };
  }, [sessions, filteredStrings]);

  // Rating comparison data
  const ratingComparisonData = useMemo(() => {
    return stringStats
      .filter((s) => s.avgRating > 0)
      .slice(0, 8)
      .map((s) => ({
        name: `${s.string.brand} ${s.string.model}`.substring(0, 12),
        rating: s.avgRating,
        fullName: `${s.string.brand} ${s.string.model}`,
      }));
  }, [stringStats]);

  const isLoading = stringsLoading || sessionsLoading;
  const activeCount = strings?.filter((s) => s.isActive !== false).length ?? 0;
  const removedCount = strings?.filter((s) => s.isActive === false).length ?? 0;

  const filterTabs = [
    { id: "all", label: "All", icon: "📊", count: strings?.length ?? 0 },
    { id: "active", label: "Active", icon: "🎾", count: activeCount },
    { id: "removed", label: "Removed", icon: "📦", count: removedCount },
  ];

  return (
    <LoadingContainer isLoading={isLoading} spinnerColor="purple">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">String Overview</h2>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <Tabs
            tabs={filterTabs}
            activeTab={filter}
            onTabChange={(id) => setFilter(id as StringFilter)}
            variant="pills"
            color="purple"
          />
        </div>

        {/* Overall Stats Cards */}
        {overallStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <StatCard
              label="Total Strings"
              value={overallStats.totalStrings}
              color="purple"
            />
            <StatCard
              label="Total Hours"
              value={`${overallStats.totalHours}h`}
              color="blue"
            />
            <StatCard
              label="Total Sessions"
              value={overallStats.totalSessions}
              color="green"
            />
            <StatCard
              label="Avg Rating"
              value={
                overallStats.avgRating > 0
                  ? `${overallStats.avgRating}/10`
                  : "N/A"
              }
              color="yellow"
            />
            <StatCard
              label="Avg Days/String"
              value={overallStats.avgDaysPerString}
              color="orange"
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Hours per String */}
          <ChartContainer
            title="Hours per String"
            isEmpty={hoursPerStringData.length === 0}
            emptyMessage="No usage data available"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hoursPerStringData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" unit="h" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === "hours" ? `${value}h` : value,
                    name === "hours" ? "Hours" : "Sessions",
                  ]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.fullName || label
                  }
                />
                <Bar dataKey="hours" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Monthly Usage Trend */}
          <ChartContainer
            title="Monthly Usage by String"
            isEmpty={
              monthlyUsageData.length === 0 || stringKeysForChart.length === 0
            }
            emptyMessage="No usage data available"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis unit="h" />
                <Tooltip
                  formatter={(value: number) => [`${value}h`, "Hours"]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {stringKeysForChart.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    stackId="a"
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    name={key}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* String Type Distribution */}
          <ChartContainer
            title="String Types"
            isEmpty={stringTypeData.length === 0}
            emptyMessage="No string data available"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stringTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stringTypeData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>

          {/* Rating Comparison */}
          <ChartContainer
            title="Rating Comparison"
            isEmpty={ratingComparisonData.length === 0}
            emptyMessage="No ratings available"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis domain={[0, 10]} />
                <Tooltip
                  formatter={(value: number) => [`${value}/10`, "Rating"]}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.fullName || label
                  }
                />
                <Bar dataKey="rating" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* String Details Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              String Details
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    String
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Rating
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Active
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stringStats.map((stat) => (
                  <tr key={stat.string.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {stat.string.brand} {stat.string.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stat.string.gauge}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        {STRING_TYPE_LABELS[stat.string.type ?? 0]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {stat.string.isActive !== false ? (
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          Removed
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {stat.totalSessions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {stat.totalHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {stat.avgRating > 0 ? `${stat.avgRating}/10` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {stat.daysActive} days
                    </td>
                  </tr>
                ))}
                {stringStats.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      No strings found for the selected filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LoadingContainer>
  );
}
