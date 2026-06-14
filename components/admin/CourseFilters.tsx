"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChangeEvent } from "react";

export default function CourseFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentRole = searchParams.get("role") ?? "";

  const updateParams = (
    key: string,
    value: string,
  ) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    router.push(`/admin/courses?${params.toString()}`);
  };

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    updateParams("search", event.target.value);
  };

  const handleRoleChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    updateParams("role", event.target.value);
  };

  const clearFilters = () => {
    router.push("/admin/courses");
  };

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={currentSearch}
            onChange={handleSearchChange}
            className="h-11 w-full rounded-lg border px-4 text-sm outline-none transition focus:border-slate-400"
          />

          <select
            value={currentRole}
            onChange={handleRoleChange}
            className="h-11 min-w-[180px] rounded-lg border px-4 text-sm outline-none transition focus:border-slate-400"
          >
            <option value="">
              All Roles
            </option>

            <option value="STUDENT">
              Student
            </option>

            <option value="INSTRUCTOR">
              Instructor
            </option>

            <option value="ADMIN">
              Admin
            </option>
          </select>
        </div>

        <button
          type="button"
          onClick={clearFilters}
          className="h-11 rounded-lg border px-4 text-sm font-medium transition hover:bg-slate-100"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}