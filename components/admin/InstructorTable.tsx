import Image from "next/image";

import DataTable from "@/components/admin/shared/DataTable";
import EmptyState from "@/components/admin/shared/EmptyState";
import StatusBadge from "@/components/admin/shared/StatusBadge";

type InstructorTableProps = {
  instructors: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    headline: string | null;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
  }[];
};

export default function InstructorTable({
  instructors,
}: InstructorTableProps) {
  if (!instructors.length) {
    return (
      <EmptyState
        title="No instructors found"
        description="There are currently no instructors available."
      />
    );
  }

  return (
    <DataTable>
      <thead className="border-b bg-slate-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Instructor
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Headline
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Verification
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Status
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Joined
          </th>
        </tr>
      </thead>

      <tbody>
        {instructors.map((instructor) => (
          <tr
            key={instructor.id}
            className="border-b last:border-b-0 hover:bg-slate-50"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border">
                  <Image
                    src={
                      instructor.avatarUrl ||
                      "/images/default-avatar.png"
                    }
                    alt={instructor.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="font-medium text-slate-900">
                    {instructor.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {instructor.email}
                  </p>
                </div>
              </div>
            </td>

            <td className="px-6 py-4 text-sm text-slate-600">
              {instructor.headline ||
                "No headline"}
            </td>

            <td className="px-6 py-4">
              {instructor.isVerified ? (
                <StatusBadge variant="success">
                  Verified
                </StatusBadge>
              ) : (
                <StatusBadge variant="warning">
                  Pending
                </StatusBadge>
              )}
            </td>

            <td className="px-6 py-4">
              {instructor.isActive ? (
                <StatusBadge variant="success">
                  Active
                </StatusBadge>
              ) : (
                <StatusBadge variant="danger">
                  Inactive
                </StatusBadge>
              )}
            </td>

            <td className="px-6 py-4 text-sm text-slate-600">
              {new Date(
                instructor.createdAt,
              ).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}