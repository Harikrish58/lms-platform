"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

type UserStatusButtonProps = {
  userId: string;
  isActive: boolean;
};

export default function UserStatusButton({
  userId,
  isActive,
}: UserStatusButtonProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/users/${userId}/status`,
        {
          method: "PATCH",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update status",
        );
      }

      toast.success(
        isActive
          ? "User deactivated"
          : "User activated",
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update status",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleToggle}
      className={`flex min-w-[110px] items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
        isActive
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-green-200 text-green-600 hover:bg-green-50"
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isActive ? (
        "Deactivate"
      ) : (
        "Activate"
      )}
    </button>
  );
}