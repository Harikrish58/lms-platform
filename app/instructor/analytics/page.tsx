"use client";

import { useQuery } from "@tanstack/react-query";
import { DollarSign, Users, Star, Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import AnalyticsChart, { ChartDataProps } from "@/components/instructor/AnalyticsChart";

interface AnalyticsMetrics {
  totalRevenue: number;
  totalEnrollments: number;
  averageCourseRating: number;
  revenueData: ChartDataProps[];
}

/**
 * Primary analytics dashboard for instructors.
 * Aggregates Stripe payment data, active enrollments, and review scores across all published courses.
 */
export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery<AnalyticsMetrics>({
    queryKey: ["instructor-analytics"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/instructor/analytics");
      return response.data.data;
    },
    staleTime: 1000 * 60 * 15, 
  });

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="text-center">
          <p className="text-slate-600 font-bold mb-4">Unable to load analytics data.</p>
          <button 
            onClick={() => window.location.reload()}
            className="text-indigo-600 hover:underline font-medium"
          >
            Retry connection
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Performance Analytics
        </h1>
        <p className="text-slate-500 mt-2 font-medium">
          Track your course revenue, student growth, and platform ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={`$${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-100"
        />
        <MetricCard
          title="Total Enrollments"
          value={data.totalEnrollments.toLocaleString()}
          icon={Users}
          colorClass="text-indigo-600"
          bgClass="bg-indigo-100"
        />
        <MetricCard
          title="Average Rating"
          value={data.averageCourseRating > 0 ? data.averageCourseRating.toFixed(1) : "N/A"}
          icon={Star}
          colorClass="text-amber-500"
          bgClass="bg-amber-100"
        />
      </div>

      <AnalyticsChart data={data.revenueData} />
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
}

function MetricCard({ title, value, icon: Icon, colorClass, bgClass }: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-xl ${bgClass} ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-500">{title}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  );
}