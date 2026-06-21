import { ReactNode } from "react";

type AdminCardProps = {
  children: ReactNode;
  className?: string;
};

export default function AdminCard({
  children,
  className = "",
}: AdminCardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}