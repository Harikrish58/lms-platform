import AdminCard from "@/components/admin/shared/AdminCard";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <AdminCard className="p-12 text-center">
      <h3 className="text-lg font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-slate-100"
        >
          {actionLabel}
        </button>
      )}
    </AdminCard>
  );
}