"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";

type DeleteReviewButtonProps = {
  reviewId: string;
};

export default function DeleteReviewButton({
  reviewId,
}: DeleteReviewButtonProps) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/reviews/${reviewId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data =
          await response.json();

        throw new Error(
          data.message ??
            "Failed to delete review",
        );
      }

      toast.success("Review deleted");

      setOpen(false);

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete review",
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
        title="Delete Review"
        description="This action cannot be undone. The review will be permanently removed."
        confirmText="Delete Review"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}