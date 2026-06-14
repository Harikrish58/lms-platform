import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { authMiddleware } from "@/lib/middleware/auth";

type AdminLayoutProps = {
  children: ReactNode;
};

const adminLinks = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Users",
    href: "/admin/users",
  },
  {
    label: "Courses",
    href: "/admin/courses",
  },
  {
    label: "Instructors",
    href: "/admin/instructors",
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
  },
];

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const auth = await authMiddleware();

  if (!auth.success) {
    redirect("/login");
  }

  if (auth.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-xl font-bold">Admin Panel</h2>

            <p className="mt-1 text-sm text-slate-500">
              LMS Administration
            </p>
          </div>

          <nav className="flex flex-col gap-2 p-4">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold">
                  Administration
                </h1>

                <p className="text-sm text-slate-500">
                  Welcome back, {auth.user.email}
                </p>
              </div>
            </div>
          </header>

          <section className="p-8">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
}