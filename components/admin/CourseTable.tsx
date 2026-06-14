import CoursePublishButton from "@/components/admin/CoursePublishButton";
import DeleteCourseButton from "@/components/admin/DeleteCourseButton";
import DataTable from "@/components/admin/shared/DataTable";
import EmptyState from "@/components/admin/shared/EmptyState";
import StatusBadge from "@/components/admin/shared/StatusBadge";

type CourseTableProps = {
  courses: {
    id: string;
    title: string;
    price: number;
    isPublished: boolean;
    createdAt: Date;
    instructor: {
      name: string;
      email: string;
    };
  }[];
};

export default function CourseTable({
  courses,
}: CourseTableProps) {
  if (!courses.length) {
    return (
      <EmptyState
        title="No courses found"
        description="There are currently no courses available."
      />
    );
  }

  return (
    <DataTable>
      <thead className="border-b bg-slate-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Course
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Instructor
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Price
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Created
          </th>

          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {courses.map((course) => (
          <tr
            key={course.id}
            className="border-b last:border-b-0 hover:bg-slate-50"
          >
            <td className="px-6 py-4">
              <div>
                <p className="font-medium text-slate-900">
                  {course.title}
                </p>
              </div>
            </td>

            <td className="px-6 py-4">
              <div>
                <p className="font-medium">
                  {course.instructor.name}
                </p>

                <p className="text-sm text-slate-500">
                  {course.instructor.email}
                </p>
              </div>
            </td>

            <td className="px-6 py-4 text-sm font-medium">
              ${course.price}
            </td>

            <td className="px-6 py-4">
              {course.isPublished ? (
                <StatusBadge variant="success">
                  Published
                </StatusBadge>
              ) : (
                <StatusBadge variant="warning">
                  Draft
                </StatusBadge>
              )}
            </td>

            <td className="px-6 py-4 text-sm text-slate-600">
              {new Date(
                course.createdAt,
              ).toLocaleDateString()}
            </td>

            <td className="px-6 py-4">
              <div className="flex justify-end gap-2">
                <CoursePublishButton
                  courseId={course.id}
                  isPublished={course.isPublished}
                />

                <DeleteCourseButton
                  courseId={course.id}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}