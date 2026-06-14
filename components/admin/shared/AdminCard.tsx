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
      className={`rounded-xl border bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}