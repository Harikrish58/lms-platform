import { ReactNode } from "react";

import AdminCard from "@/components/admin/shared/AdminCard";

type DataTableProps = {
  children: ReactNode;
};

export default function DataTable({
  children,
}: DataTableProps) {
  return (
    <AdminCard className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {children}
        </table>
      </div>
    </AdminCard>
  );
}