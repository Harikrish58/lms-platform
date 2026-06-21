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
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-teal-100 text-teal-700",
    default: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}