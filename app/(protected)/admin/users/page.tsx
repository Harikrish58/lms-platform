import { Role } from "@prisma/client";

import { getUsers } from "@/actions/admin.actions";
import UserFilters from "@/components/admin/UserFilters";
import UserTable from "@/components/admin/userTable";
import Pagination from "@/components/admin/shared/Pagination";

type UsersPageProps = {
  searchParams: Promise<{
    page?: string;
    search?: string;
    role?: string;
  }>;
};

export default async function AdminUsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const search = params.search ?? "";

  const role =
    params.role && ["STUDENT", "INSTRUCTOR", "ADMIN"].includes(params.role)
      ? (params.role as Role)
      : undefined;

  const { users, pagination } = await getUsers({
    page,
    limit: 10,
    search,
    role,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage platform users, roles, and permissions.
        </p>
      </div>

      <UserFilters />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {users.length} of {pagination.totalUsers} users
        </p>

        <p className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages}
        </p>
      </div>

      <UserTable users={users} />
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
      />
    </div>
  );
}
