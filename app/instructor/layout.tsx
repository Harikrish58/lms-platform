"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart, Settings } from "lucide-react";

/**
 * Shared layout for the instructor workspace.
 * Isolates instructor navigation from the primary student-facing application shell
 * to provide a dedicated, focused authoring and analytics environment.
 */
export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Courses",
      icon: LayoutDashboard,
      href: "/instructor/courses",
      active: pathname === "/instructor/courses" || pathname.includes("/instructor/courses/"),
    },
    {
      label: "Analytics",
      icon: BarChart,
      href: "/instructor/analytics",
      active: pathname === "/instructor/analytics",
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#fcfcfd]">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-8">
        <div className="mb-8 px-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Instructor Workspace
          </h2>
        </div>
        
        <nav className="flex-1 space-y-1.5">
          {routes.map((route) => {
            const Icon = route.icon;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                  route.active
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

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}