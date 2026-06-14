import DeleteReviewButton from "@/components/admin/DeleteReviewButton";
import DataTable from "@/components/admin/shared/DataTable";
import EmptyState from "@/components/admin/shared/EmptyState";

type ReviewTableProps = {
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      email: string;
    };
    course: {
      id: string;
      title: string;
    };
  }[];
};

export default function ReviewTable({
  reviews,
}: ReviewTableProps) {
  if (!reviews.length) {
    return (
      <EmptyState
        title="No reviews found"
        description="There are currently no reviews."
      />
    );
  }

  return (
    <DataTable>
      <thead className="border-b bg-slate-50">
        <tr>
          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Reviewer
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Course
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Rating
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Comment
          </th>

          <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Created
          </th>

          <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
            Actions
          </th>
        </tr>
      </thead>

      <tbody>
        {reviews.map((review) => (
          <tr
            key={review.id}
            className="border-b last:border-b-0 hover:bg-slate-50"
          >
            <td className="px-6 py-4">
              <div>
                <p className="font-medium text-slate-900">
                  {review.user.name}
                </p>

                <p className="text-sm text-slate-500">
                  {review.user.email}
                </p>
              </div>
            </td>

            <td className="px-6 py-4 text-sm text-slate-700">
              {review.course.title}
            </td>

            <td className="px-6 py-4">
              <span className="font-medium">
                {review.rating}/5
              </span>
            </td>

            <td className="max-w-md px-6 py-4">
              <p className="line-clamp-2 text-sm text-slate-600">
                {review.comment || "No comment"}
              </p>
            </td>

            <td className="px-6 py-4 text-sm text-slate-600">
              {new Date(
                review.createdAt,
              ).toLocaleDateString()}
            </td>

            <td className="px-6 py-4">
              <div className="flex justify-end">
                <DeleteReviewButton
                  reviewId={review.id}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  );
}