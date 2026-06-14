import { getAdminAnalytics } from "@/actions/admin.actions";

export default async function AdminDashboardPage() {
  const analytics = await getAdminAnalytics();

  const stats = [
    {
      title: "Total Users",
      value: analytics.totalUsers,
    },
    {
      title: "Students",
      value: analytics.totalStudents,
    },
    {
      title: "Instructors",
      value: analytics.totalInstructors,
    },
    {
      title: "Admins",
      value: analytics.totalAdmins,
    },
    {
      title: "Courses",
      value: analytics.totalCourses,
    },
    {
      title: "Published Courses",
      value: analytics.publishedCourses,
    },
    {
      title: "Enrollments",
      value: analytics.totalEnrollments,
    },
    {
      title: "Completed Enrollments",
      value: analytics.completedEnrollments,
    },
    {
      title: "Reviews",
      value: analytics.totalReviews,
    },
    {
      title: "Revenue",
      value: `${analytics.totalRevenue}`,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Dashboard
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Overview of platform activity and performance.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">
              {stat.title}
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}