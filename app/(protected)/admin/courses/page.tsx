import { getCourses } from "@/actions/admin.actions";
import CourseTable from "@/components/admin/CourseTable";

export default async function AdminCoursesPage() {
  const { courses } = await getCourses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Courses
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage platform courses.
        </p>
      </div>

      <CourseTable courses={courses} />
    </div>
  );
}