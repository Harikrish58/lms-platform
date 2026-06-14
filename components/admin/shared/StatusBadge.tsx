type StatusBadgeProps = {
  children: React.ReactNode;
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default";
};

export default function StatusBadge({
  children,
  variant = "default",
}: StatusBadgeProps) {
  const variantStyles = {
    success:
      "bg-green-100 text-green-700",
    warning:
      "bg-yellow-100 text-yellow-700",
    danger:
      "bg-red-100 text-red-700",
    info:
      "bg-blue-100 text-blue-700",
    default:
      "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}