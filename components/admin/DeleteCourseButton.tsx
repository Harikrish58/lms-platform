"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";

type DeleteCourseButtonProps = {
  courseId: string;
};

export default function DeleteCourseButton({
  courseId,
}: DeleteCourseButtonProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/courses/${courseId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.message ??
            "Failed to delete course",
        );
      }

      toast.success("Course deleted");

      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete course",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={loading}
        onClick={() => setOpen(true)}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        Delete
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Course"
        description="This action cannot be undone. The course and all associated content may be permanently removed."
        confirmText="Delete Course"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}