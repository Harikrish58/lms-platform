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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Users Management
        </h1>

        <p className="mt-2 text-base text-slate-500 max-w-2xl">
          Manage platform users, assign roles, and monitor account statuses.
        </p>
      </div>

      <UserFilters />

      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <p className="text-sm font-bold text-slate-500">
          Showing <span className="text-slate-900">{users.length}</span> of <span className="text-slate-900">{pagination.totalUsers}</span> users
        </p>

        <p className="text-sm font-bold text-slate-500">
          Page <span className="text-slate-900">{pagination.page}</span> of <span className="text-slate-900">{pagination.totalPages}</span>
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