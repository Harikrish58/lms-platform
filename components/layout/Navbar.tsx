"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "@/lib/axios";
import {
  Search,
  Menu,
  X,
  LogOut,
  User,
  BookOpen,
  Settings,
  Bell,
  ChevronDown,
  Loader2,
} from "lucide-react";

/**
 * PRODUCTION-READY NAVBAR
 * Features: Real auth state with tokens, dynamic user data, 
 * loading states, and specialized dropdown handlers.
 */
export default function Navbar() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // AUTH & USER STATE
  const [user, setUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI STATE
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  /**
   * HYDRATION: Fetch user session from token
   * Usually handles HttpOnly cookies or Authorization headers automatically via axios interceptors
   */
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get("/api/auth/me");
        setUser(data.user);
      } catch (err) {
        // Not logged in or token expired
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  // GLOBAL EVENT: Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /**
   * DESTRUCTIVE ACTION: Logout
   * Clears server-side session and resets local UI state
   */
  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      setIsProfileOpen(false);
      
      // Redirect and clear router cache
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        
        {/* BRAND IDENTITY */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-indigo-600 flex items-center justify-center text-white font-black group-hover:scale-105 transition-transform">
            N
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 hidden sm:block">
            NextEra
          </span>
        </Link>

        {/* SEARCH: FUNCTIONAL BAR */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-600/20 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        {/* NAVIGATION: AUTH SENSITIVE */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/courses"
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            Courses
          </Link>

          <div className="h-4 w-[1px] bg-slate-200 mx-2" />

          {isLoading ? (
            <div className="px-4 py-2">
              <Loader2 className="animate-spin text-slate-300" size={20} />
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-900 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
              </button>

              {/* USER PROFILE DROPDOWN */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1 pl-3 border border-slate-200 rounded-full hover:shadow-md transition-all bg-white"
                >
                  <span className="text-xs font-black text-slate-700 hidden lg:block">
                    {user.name.split(" ")[0]}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[10px] uppercase overflow-hidden relative">
                    {user.avatar ? (
                      <Image src={user.avatar} alt="Profile" fill className="object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-slate-50">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/my-courses"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <BookOpen size={16} className="text-slate-400" /> My Learning
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Settings size={16} className="text-slate-400" /> Settings
                    </Link>

                    <div className="h-px bg-slate-50 my-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100"
            >
              Get Started
            </Link>
          )}
        </nav>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-white p-6 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
          </div>
          <Link href="/courses" className="block text-lg font-black text-slate-900">Courses</Link>
          {user && <Link href="/my-courses" className="block text-lg font-black text-slate-900">My Learning</Link>}
          <div className="pt-4 border-t">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 text-red-600 font-black rounded-xl flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="block w-full py-3 bg-indigo-600 text-white text-center font-black rounded-xl"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}