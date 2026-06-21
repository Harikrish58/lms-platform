import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Star,
  BarChart,
} from "lucide-react";

import { authMiddleware } from "@/lib/middleware/auth";

type AdminLayoutProps = {
  children: ReactNode;
};

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Instructors", href: "/admin/instructors", icon: GraduationCap },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
];

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const auth = await authMiddleware();

  if (!auth.success) {
    redirect("/login");
  }

  if (auth.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar Navigation */}
        <aside className="w-72 border-r border-slate-200 bg-white flex flex-col shadow-sm z-10">
          <div className="border-b border-slate-100 p-6 flex flex-col items-start gap-4">
            <Link href="/" className="inline-block">
              <div className="relative w-[120px] h-[36px]">
                <Image
                  src="/navlogo.png"
                  alt="NextEra Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
                Workspace
              </h2>
              <p className="text-lg font-bold text-slate-800">Admin Console</p>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-1.5 p-4">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-teal-50 hover:text-teal-700"
                >
                  <Icon
                    size={20}
                    className="text-slate-400 transition-colors group-hover:text-teal-600"
                  />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">
                  Administration
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                  Managing platform settings for{" "}
                  <span className="text-slate-800 font-bold">
                    {auth.user.email}
                  </span>
                </p>
              </div>

              {/* Profile Avatar Placeholder */}
              <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold shadow-sm border border-teal-200">
                {auth.user.email?.[0]?.toUpperCase() || "A"}
              </div>
            </div>
          </header>

          <section className="p-8 max-w-7xl mx-auto w-full">{children}</section>
        </main>
      </div>
    </div>
  );
}
