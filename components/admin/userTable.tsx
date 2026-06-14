import Image from "next/image";

import DeleteUserButton from "@/components/admin/DeleteUserButton";
import UserRoleSelect from "@/components/admin/UserRoleSelect";
import UserStatusButton from "@/components/admin/UserStatusButton";
import DataTable from "@/components/admin/shared/DataTable";
import EmptyState from "@/components/admin/shared/EmptyState";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { Role } from "@/generated/prisma/client";

type UserTableProps = {
  users: {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl: string | null;
    isVerified: boolean;
    isActive: boolean;
    createdAt: Date;
  }[];
};

export default function UserTable({
  users,
}: UserTableProps) {
  if (!users.length) {
    return (
      <EmptyState
        title="No users found"
        description="There are currently no users matching your criteria."
      />
    );
  }

  return (
    <DataTable>
      <thead className="border-b bg-slate-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            User
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Role
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

          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {users.map((user) => (
          <tr
            key={user.id}
            className="border-b last:border-b-0 hover:bg-slate-50"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border">
                  <Image
                    src={
                      user.avatarUrl ||
                      "/images/default-avatar.png"
                    }
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <p className="font-medium text-slate-900">
                    {user.name}
                  </p>

                  <p className="text-sm text-slate-500">
                    {user.email}
                  </p>
                </div>
              </div>
            </td>

            <td className="px-6 py-4">
              <UserRoleSelect
                userId={user.id}
                currentRole={user.role}
              />
            </td>

            <td className="px-6 py-4">
              {user.isVerified ? (
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
              {user.isActive ? (
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
                user.createdAt,
              ).toLocaleDateString()}
            </td>

            <td className="px-6 py-4">
              <div className="flex justify-end gap-2">
                <UserStatusButton
                  userId={user.id}
                  isActive={user.isActive}
                />

                <DeleteUserButton
                  userId={user.id}
                />

                <button
                  type="button"
                  className="rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-slate-100"
                >
                  View
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}