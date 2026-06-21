"use client";

import { Role } from "@/generated/prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type UserRoleSelectProps = {
  userId: string;
  currentRole: Role;
};

export default function UserRoleSelect({
  userId,
  currentRole,
}: UserRoleSelectProps) {
  const router = useRouter();

  const [role, setRole] =
    useState<Role>(currentRole);

  const [loading, setLoading] =
    useState(false);

  const handleChange = async (
    value: Role,
  ) => {
    const previousRole = role;

    try {
      setLoading(true);
      setRole(value);

      const response = await fetch(
        `/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            role: value,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update role",
        );
      }

      toast.success("Role updated");

      router.refresh();
    } catch (error) {
      console.error(error);

      setRole(previousRole);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update role",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={role}
        disabled={loading}
        onChange={(e) =>
          handleChange(
            e.target.value as Role,
          )
        }
        className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
      >
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

      {loading && (
        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
      )}
    </div>
  );
}