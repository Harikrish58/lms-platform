import { ReactNode } from "react";
import AdminCard from "@/components/admin/shared/AdminCard";

type DataTableProps = {
  children: ReactNode;
};

export default function DataTable({ children }: DataTableProps) {
  return (
    <AdminCard className="overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600 whitespace-nowrap">
          {children}
        </table>
      </div>
    </AdminCard>
  );
}