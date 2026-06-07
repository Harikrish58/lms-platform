"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart } from "lucide-react";

const INSTRUCTOR_ROUTES: ReadonlyArray<{
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    label: "Courses",
    href: "/instructor/courses",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    href: "/instructor/analytics",
    icon: BarChart,
  },
];

/**
 * Shared layout for the instructor workspace.
 * Isolates instructor navigation from the student-facing application
 * and provides a dedicated environment for course management.
 */
export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#fcfcfd]">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-8 md:flex">
        <div className="mb-8 px-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
            Instructor Workspace
          </h2>
        </div>

        <nav className="flex-1 space-y-1.5">
          {INSTRUCTOR_ROUTES.map((route) => {
            const Icon = route.icon;

            const isActive = pathname.startsWith(route.href);

            return (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                {route.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}