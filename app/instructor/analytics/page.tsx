"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, Users, Star, Loader2 } from "lucide-react";

import axiosInstance from "@/lib/axios";
import AnalyticsChart, {
  ChartDataProps,
} from "@/components/instructor/AnalyticsChart";

interface AnalyticsMetrics {
  totalRevenue: number;
  totalEnrollments: number;
  averageCourseRating: number;
  revenueData: ChartDataProps[];
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}

/**
 * Primary analytics dashboard for instructors.
 * Displays revenue, enrollments, ratings, and performance trends
 * across all instructor-owned courses.
 */
export default function AnalyticsPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery<AnalyticsMetrics>({
    queryKey: ["instructor-analytics"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/instructor/analytics");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 15,
  });

  if (isLoading) {
    return (
      <div
        className="flex h-[80vh] items-center justify-center"
        aria-label="Loading analytics"
      >
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900">
            Unable to load analytics
          </h2>

          <p className="mt-2 text-slate-500">
            Something went wrong while fetching your analytics data.
          </p>

          <button
            onClick={() => refetch()}
            className="mt-4 font-semibold text-teal-600 transition-colors hover:text-teal-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const formattedRevenue = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(data.totalRevenue);

  return (
    <div className="mx-auto min-h-screen max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Performance Analytics
        </h1>

        <p className="mt-2 font-medium text-slate-500">
          Track your course revenue, student growth, and platform ratings.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          title="Total Revenue"
          value={`$${formattedRevenue}`}
          icon={DollarSign}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-100"
        />

        <MetricCard
          title="Total Enrollments"
          value={data.totalEnrollments.toLocaleString()}
          icon={Users}
          colorClass="text-teal-600"
          bgClass="bg-teal-100"
        />

        <MetricCard
          title="Average Rating"
          value={
            data.averageCourseRating > 0
              ? data.averageCourseRating.toFixed(1)
              : "N/A"
          }
          icon={Star}
          colorClass="text-amber-500"
          bgClass="bg-amber-100"
        />
      </div>

      <AnalyticsChart data={data.revenueData} />
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  colorClass,
  bgClass,
}: MetricCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`rounded-xl p-4 ${bgClass} ${colorClass}`}>
        <Icon size={24} />
      </div>

      <div>
        <p className="text-sm font-bold text-slate-500">{title}</p>

        <p className="mt-1 text-2xl font-black text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}