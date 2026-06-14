import { getReviews } from "@/actions/admin.actions";

import ReviewTable from "@/components/admin/ReviewTable";

type ReviewsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function AdminReviewsPage({
  searchParams,
}: ReviewsPageProps) {
  const params = await searchParams;

  const page = Number(params.page) || 1;

  const { reviews, pagination } =
    await getReviews({
      page,
      limit: 10,
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Reviews
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage course reviews across the platform.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {reviews.length} of{" "}
          {pagination.totalReviews} reviews
        </p>

        <p className="text-sm text-muted-foreground">
          Page {pagination.page} of{" "}
          {pagination.totalPages}
        </p>
      </div>

      <ReviewTable reviews={reviews} />
    </div>
  );
}