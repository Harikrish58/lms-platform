"use client";

import {
  useState,
  useEffect,
  useMemo,
  useTransition,
  useCallback,
  memo,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  BookOpen,
  Users,
} from "lucide-react";
import { getCourses } from "@/services/course.service";

// Data structures for the course domain and API responses
interface Course {
  id: string;
  title: string;
  price: number;
  thumbnail: string | null;
  averageRating: number;
  totalReviews: number;
  instructor: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  enrollmentsCount: number;
  sectionsCount: number;
}

interface CoursesResponse {
  data: Course[];
  meta: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  };
}

interface QueryState {
  search: string;
  category: string;
  sort: string;
  page: number;
}

// Main Courses Marketplace Page handling server-side synced filtering and paginated data fetching
export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  // Initialize state from URL parameters for bookmarking and SEO
  const [queryState, setQueryState] = useState<QueryState>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "All",
    sort: searchParams.get("sort") || "popular",
    page: Number(searchParams.get("page")) || 1,
  });

  const [debouncedSearch, setDebouncedSearch] = useState(queryState.search);

  // Debounce search input to prevent excessive API calls and URL updates
  useEffect(() => {
    const id = setTimeout(() => {
      startTransition(() => setDebouncedSearch(queryState.search));
    }, 400);
    return () => clearTimeout(id);
  }, [queryState.search]);

  // Synchronize internal state with browser URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (queryState.category !== "All")
      params.set("category", queryState.category);
    if (queryState.sort !== "popular") params.set("sort", queryState.sort);
    if (queryState.page > 1) params.set("page", String(queryState.page));

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [
    debouncedSearch,
    queryState.category,
    queryState.sort,
    queryState.page,
    router,
  ]);

  // Prepare parameters for TanStack Query
  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: queryState.category === "All" ? undefined : queryState.category,
      sort: queryState.sort,
      page: queryState.page,
      limit: 10,
    }),
    [debouncedSearch, queryState.category, queryState.sort, queryState.page],
  );

  // Core data fetching hook with stale-while-revalidate strategy
  const { data, isLoading, isFetching, isError } = useQuery<CoursesResponse>({
    queryKey: ["courses", queryParams],
    queryFn: () => getCourses(queryParams),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  // Prefetch next page for seamless navigation performance
  useEffect(() => {
    if (data?.meta && queryParams.page < data.meta.totalPages) {
      const nextPage = queryParams.page + 1;
      queryClient.prefetchQuery({
        queryKey: ["courses", { ...queryParams, page: nextPage }],
        queryFn: () => getCourses({ ...queryParams, page: nextPage }),
      });
    }
  }, [data, queryParams, queryClient]);

  const courses = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;

  // Unified state updater using React Transition for UI responsiveness
  const updateQuery = useCallback((updates: Partial<QueryState>) => {
    startTransition(() => {
      setQueryState((prev) => ({ ...prev, ...updates }));
    });
  }, []);

  if (isError)
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="bg-red-50 p-4 rounded-full text-red-500">
          <BookOpen size={40} />
        </div>
        <p className="text-slate-600 font-bold">
          We couldn&apos;t load the catalog.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="text-indigo-600 underline"
        >
          Try again
        </button>
      </div>
    );

  return (
    <div className="bg-[#fcfcfd] min-h-screen">
      {/* Hero Header and Search Input */}
      <div className="bg-slate-900 text-white py-16 px-16">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight"
          >
            Advance your career.
          </motion.h1>

          <div className="relative max-w-2xl group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors"
              size={20}
            />
            <input
              value={queryState.search}
              onChange={(e) => updateQuery({ search: e.target.value })}
              placeholder="Search for software, skills, or instructors..."
              className="w-full pl-12 pr-4 py-4 rounded-lg text-white shadow-2xl focus:ring-4 focus:ring-indigo-500/20 outline-1 font-medium text-lg transition-all"
            />
          </div>
        </div>
      </div>

      {/* Filter and Sorting Sticky Bar */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {["All", "Development", "Design", "Business"].map((c) => (
              <button
                key={c}
                onClick={() => updateQuery({ category: c, page: 1 })}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                  queryState.category === c
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <select
              value={queryState.sort}
              onChange={(e) => updateQuery({ sort: e.target.value, page: 1 })}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer text-sm"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Course Grid and Content State Management */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 transition-opacity duration-300 ${
            isFetching && !isLoading ? "opacity-60" : "opacity-100"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
              : courses.map((course: Course, i: number) => (
                  <MemoCourseCard
                    key={course.id}
                    course={course}
                    router={router}
                    priority={i < 4}
                  />
                ))}
          </AnimatePresence>
        </div>

        {/* Empty state handling */}
        {!isLoading && courses.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-slate-200 rounded-3xl">
            <Search className="mx-auto text-slate-200 mb-4" size={64} />
            <h2 className="text-xl font-black text-slate-900">
              No matching courses
            </h2>
            <p className="text-slate-500 mt-2">
              Try adjusting your filters or search keywords.
            </p>
            <button
              onClick={() =>
                updateQuery({ search: "", category: "All", page: 1 })
              }
              className="mt-6 text-indigo-600 font-bold hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Dynamic Pagination Control */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-20 pt-8 border-t">
            <button
              disabled={queryState.page === 1}
              onClick={() => updateQuery({ page: queryState.page - 1 })}
              className="p-3 rounded-full hover:bg-slate-100 disabled:opacity-20 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (
                  p === 1 ||
                  p === totalPages ||
                  (p >= queryState.page - 1 && p <= queryState.page + 1)
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => updateQuery({ page: p })}
                      className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${
                        queryState.page === p
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                          : "hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === 2 || p === totalPages - 1)
                  return (
                    <span key={p} className="px-1 text-slate-300">
                      ...
                    </span>
                  );
                return null;
              })}
            </div>

            <button
              disabled={queryState.page === totalPages}
              onClick={() => updateQuery({ page: queryState.page + 1 })}
              className="p-3 rounded-full hover:bg-slate-100 disabled:opacity-20 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </main>

      {/* Background Fetching Indicator */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-8 right-8 bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-pulse">
          <Loader2 className="animate-spin" size={16} />
          <span className="text-xs font-black uppercase tracking-widest">
            Updating...
          </span>
        </div>
      )}
    </div>
  );
}

// Memoized Card component to optimize re-renders during list updates
const MemoCourseCard = memo(function CourseCard({
  course,
  router,
  priority,
}: {
  course: Course;
  router: ReturnType<typeof useRouter>;
  priority: boolean;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ y: -6 }}
      onClick={() => router.push(`/courses/${course.id}`)}
      className="group cursor-pointer flex flex-col h-full"
    >
      <div className="aspect-video relative rounded-lg overflow-hidden bg-slate-100 border border-slate-100 shadow-sm">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            priority={priority}
            sizes="(max-width:768px) 100vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <BookOpen size={40} />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-2 h-12 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-xs text-slate-500 mt-1 mb-2 font-medium">
          {course.instructor.name}
        </p>

        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-sm font-black text-amber-800">
            {course.averageRating.toFixed(1)}
          </span>
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                fill={
                  i < Math.floor(course.averageRating) ? "currentColor" : "none"
                }
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 font-bold">
            ({course.totalReviews.toLocaleString()})
          </span>
        </div>

        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="text-xl font-black text-slate-900">
            {course.price === 0 ? "Free" : `$${course.price.toFixed(2)}`}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            <Users size={12} />
            {course.enrollmentsCount.toLocaleString()}
          </div>
        </div>
      </div>
    </motion.article>
  );
});

// Loading placeholder component
const Skeleton = () => (
  <div className="flex flex-col h-full">
    <div className="aspect-video bg-slate-200 rounded-lg mb-4 animate-pulse" />
    <div className="h-5 bg-slate-200 rounded w-full mb-2 animate-pulse" />
    <div className="h-5 bg-slate-200 rounded w-2/3 mb-4 animate-pulse" />
    <div className="h-10 bg-slate-100 rounded w-full mt-auto animate-pulse" />
  </div>
);
