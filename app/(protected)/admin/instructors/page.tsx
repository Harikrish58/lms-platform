import { getInstructors } from "@/actions/admin.actions";

import InstructorTable from "@/components/admin/InstructorTable";

export default async function AdminInstructorsPage() {
  const { instructors } =
    await getInstructors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Instructors
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage platform instructors.
        </p>
      </div>

      <InstructorTable
        instructors={instructors}
      />
    </div>
  );
}