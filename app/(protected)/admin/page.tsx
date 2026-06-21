import { getAdminAnalytics } from "@/actions/admin.actions";
import { 
  Users, 
  GraduationCap, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle, 
  Star, 
  DollarSign, 
  Activity 
} from "lucide-react";
import AdminCard from "@/components/admin/shared/AdminCard";

const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalytics();

  const stats = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Students",
      value: analytics.totalStudents,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
    {
      title: "Instructors",
      value: analytics.totalInstructors,
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Admins",
      value: analytics.totalAdmins,
      icon: ShieldCheck,
      color: "text-rose-600",
      bg: "bg-rose-100",
    },
    {
      title: "Total Courses",
      value: analytics.totalCourses,
      icon: BookOpen,
      color: "text-slate-600",
      bg: "bg-slate-100",
    },
    {
      title: "Published Courses",
      value: analytics.publishedCourses,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Active Enrollments",
      value: analytics.totalEnrollments,
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Completed",
      value: analytics.completedEnrollments,
      icon: GraduationCap,
      color: "text-emerald-600",
      bg: "bg-emerald-100",
    },
    {
      title: "Total Reviews",
      value: analytics.totalReviews,
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      title: "Total Revenue",
      value: currencyFormatter.format(analytics.totalRevenue),
      icon: DollarSign,
      color: "text-teal-700",
      bg: "bg-teal-100",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-900">
          Platform Overview
        </h2>
        <p className="mt-2 text-base text-slate-500 max-w-2xl">
          Real-time metrics and performance data for your entire learning ecosystem.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <AdminCard
              key={stat.title}
              className="p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  {stat.title}
                </p>
                <h3 className="mt-2 text-3xl font-black text-slate-900">
                  {stat.value}
                </h3>
              </div>
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}