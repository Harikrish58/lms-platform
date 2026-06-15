"use client";

import { useState, useEffect, useRef, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useLogout } from "@/hooks/useLogout";
import {
  Search,
  Menu,
  X,
  LogOut,
  BookOpen,
  Settings,
  Bell,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  avatarUrl: string | null;
}

interface MeResponse {
  success: boolean;
  data: UserProfile;
}

// Navigation Constants
const NAV_LINKS = [{ href: "/courses", label: "Courses" }];

const PROFILE_LINKS = [
  { href: "/my-courses", label: "My Learning", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavbarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { handleLogout } = useLogout();

  // Initialize navbar search from the current URL if it exists
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Synchronized authenticated session fetching via TanStack Query
  const { data, isLoading } = useQuery<MeResponse | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await fetch("/api/me");
      if (!response.ok) return null;
      return response.json() as Promise<MeResponse>;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const user = data?.success ? data.data : null;

  // Derived state mappings
  const firstName = user?.name?.split(" ")[0] ?? "";

  const currentWorkspace = pathname.startsWith("/admin")
    ? "ADMIN"
    : pathname.startsWith("/instructor")
      ? "INSTRUCTOR"
      : "STUDENT";

  const isInstructor = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  const workspaceLinks: {
    label: string;
    href: string;
  }[] = [];

  if (isInstructor) {
    workspaceLinks.push({
      label: "Instructor",
      href: "/instructor/courses",
    });
  }

  if (user?.role === "ADMIN") {
    workspaceLinks.push({
      label: "Admin",
      href: "/admin",
    });
  }

  // Handle search submission on desktop and mobile
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    } else {
      params.delete("search");
    }

    // Reset to page 1 during a new search query sequence
    params.delete("page");

    // Redirect straight to the courses overview page with the parameters
    router.push(`/courses?${params.toString()}`);

    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  // Global outside click and escape key tracking
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/90 backdrop-blur-md shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Brand Identity - Logo Image */}
        <Link href="/" className="flex items-center shrink-0 group">
          <div className="relative w-[130px] h-[40px] flex items-center">
            <Image
              src="/navlogo.png"
              alt="Nextera Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Course Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors duration-200"
              size={16}
            />
            <input
              type="text"
              aria-label="Search courses"
              placeholder="Search premium courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white focus:border-teal-600/30 focus:ring-4 focus:ring-teal-600/5 transition-all duration-200 outline-none"
            />
          </form>
        </div>

        {/* Navigation Options Group */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                pathname === link.href
                  ? "text-teal-700 bg-teal-50"
                  : "text-slate-600 hover:text-teal-600 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="h-4 w-[1px] bg-slate-200 mx-1" />

          {isLoading ? (
            <div className="px-4 py-2 flex items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={18} />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3.5">
              {/* Role Based Switch Mode Link */}
              <button
                aria-label="Notifications"
                title="Notifications"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-xl relative transition-all duration-200 cursor-pointer"
              >
                <Bell size={19} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>

              {/* User Dropdown Profile Workspace Container */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 p-1.5 pl-3.5 border border-slate-200/80 rounded-full hover:shadow-sm hover:border-slate-300 transition-all duration-200 bg-white cursor-pointer group"
                >
                  <span className="text-xs font-bold text-slate-700 select-none">
                    {firstName}
                  </span>
                  {user.avatarUrl ? (
                    <div className="w-7 h-7 rounded-full overflow-hidden relative border border-slate-100 shadow-sm">
                      <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 mr-1 transition-transform duration-200 ${isProfileOpen ? "rotate-180 text-slate-700" : ""}`}
                  />
                </button>

                {isProfileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2.5 w-60 bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-50">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Signed In As
                      </p>
                      <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      {PROFILE_LINKS.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            role="menuitem"
                            onClick={() => setIsProfileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors ${
                              isActive
                                ? "text-teal-700 bg-teal-50"
                                : "text-slate-600 hover:text-teal-600 hover:bg-teal-50/50"
                            }`}
                          >
                            <Icon
                              size={16}
                              className={isActive ? "text-teal-600" : "text-slate-400"}
                            />
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>

                    {workspaceLinks.length > 0 && (
                      <>
                        <div className="px-4 pt-3 pb-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Workspace
                          </p>
                        </div>

                        <div className="px-1 pb-2 space-y-0.5">
                          {workspaceLinks.map((workspace) => {
                            const isActive =
                              currentWorkspace === workspace.label.toUpperCase();

                            return (
                              <Link
                                key={workspace.href}
                                href={workspace.href}
                                onClick={() => setIsProfileOpen(false)}
                                className={`flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-colors ${
                                  isActive
                                    ? "bg-teal-50 text-teal-700 font-semibold"
                                    : "text-slate-600 hover:bg-slate-50"
                                }`}
                              >
                                <span>{workspace.label}</span>

                                {isActive && (
                                  <Sparkles
                                    size={14}
                                    className="text-teal-600"
                                  />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </>
                    )}

                    <div className="h-px bg-slate-100 my-1 mx-1" />

                    <div className="p-1">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2">
              <Link
                href="/login"
                className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-50 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-teal-600 hover:shadow-md hover:shadow-teal-100 active:scale-[0.98] transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Menu Action Trigger */}
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          aria-label="Toggle Menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-5 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Mobile Search Form Wrapper */}
          <form onSubmit={handleSearchSubmit} className="relative group">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors"
              size={16}
            />
            <input
              type="text"
              aria-label="Search courses"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:border-teal-600/30 focus:ring-4 focus:ring-teal-600/5 transition-all"
            />
          </form>

          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2.5 text-base font-bold rounded-xl ${
                  pathname === link.href
                    ? "text-teal-700 bg-teal-50"
                    : "text-slate-800 hover:bg-slate-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  href="/my-courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 text-base font-bold rounded-xl ${
                    pathname === "/my-courses"
                      ? "text-teal-700 bg-teal-50"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  My Learning
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 text-base font-bold rounded-xl ${
                    pathname === "/settings"
                      ? "text-teal-700 bg-teal-50"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Settings
                </Link>

                {workspaceLinks.map((workspace) => {
                  const isActive =
                    currentWorkspace === workspace.label.toUpperCase();

                  return (
                    <Link
                      key={workspace.href}
                      href={workspace.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-3 py-2.5 text-base font-bold rounded-xl ${
                        isActive
                          ? "text-teal-700 bg-teal-50"
                          : "text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      {workspace.label} Workspace
                    </Link>
                  );
                })}
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            {user ? (
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-rose-50 text-rose-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-rose-100 active:scale-[0.99] transition-all cursor-pointer"
              >
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="block w-full py-2.5 border border-slate-200 text-center text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block w-full py-2.5 bg-teal-600 text-white text-center font-bold rounded-xl hover:bg-teal-700 shadow-sm transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <div className="h-16 border-b border-slate-200/60 bg-white/90" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}