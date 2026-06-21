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

const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

const formatCurrency = (amount: number): string =>
  amount === 0 ? "Free" : currencyFormatter.format(amount);

// Main Courses Marketplace Page handling server-side synced filtering and paginated data fetching
export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();

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
  const { data, isLoading, isFetching, isError, refetch } =
    useQuery<CoursesResponse>({
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
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <div className="rounded-full bg-rose-50 p-4 text-rose-600">
          <BookOpen size={40} />
        </div>
        <p className="font-bold text-slate-600">
          We couldn&apos;t load the catalog.
        </p>
        <button
          onClick={() => refetch()}
          className="text-teal-600 underline transition-colors hover:text-teal-700"
        >
          Try again
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header and Search Input */}
      <div className="bg-slate-900 px-16 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-4xl font-black tracking-tight md:text-5xl"
          >
            Advance your career.
          </motion.h1>

          <div className="group relative max-w-2xl">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-teal-600"
              size={20}
            />
            <input
              aria-label="Search courses"
              value={queryState.search}
              onChange={(e) => updateQuery({ search: e.target.value })}
              placeholder="Search for software, skills, or instructors..."
              className="w-full rounded-lg bg-white py-4 pl-12 pr-4 text-lg font-medium text-slate-900 shadow-2xl outline-none transition-all focus:ring-4 focus:ring-teal-600/20"
            />
          </div>
        </div>
      </div>

      {/* Filter and Sorting Sticky Bar */}
      <div className="sticky top-0 z-20 border-b bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-6 py-4">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
            {["All", "Development", "Design", "Business"].map((c) => (
              <button
                key={c}
                onClick={() => updateQuery({ category: c, page: 1 })}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition-all ${
                  queryState.category === c
                    ? "bg-slate-900 text-white"
                    : "border border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <select
              aria-label="Sort courses"
              value={queryState.sort}
              onChange={(e) => updateQuery({ sort: e.target.value, page: 1 })}
              className="cursor-pointer bg-transparent text-sm font-bold text-slate-700 focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Course Grid and Content State Management */}
        <div
          className={`grid grid-cols-1 gap-x-6 gap-y-12 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${
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
          <div className="rounded-3xl border-2 border-dashed border-slate-200 py-24 text-center">
            <Search className="mx-auto mb-4 text-slate-200" size={64} />
            <h2 className="text-xl font-black text-slate-900">
              No matching courses
            </h2>
            <p className="mt-2 text-slate-500">
              Try adjusting your filters or search keywords.
            </p>
            <button
              onClick={() =>
                updateQuery({ search: "", category: "All", page: 1 })
              }
              className="mt-6 font-bold text-teal-600 hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Dynamic Pagination Control */}
        {totalPages > 1 && (
          <div className="mt-20 flex items-center justify-center gap-2 border-t pt-8">
            <button
              disabled={queryState.page === 1}
              onClick={() => updateQuery({ page: queryState.page - 1 })}
              className="rounded-full p-3 transition-colors hover:bg-slate-100 disabled:opacity-20"
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
                      className={`h-10 w-10 rounded-full text-sm font-bold transition-all ${
                        queryState.page === p
                          ? "bg-teal-600 text-white shadow-lg shadow-teal-200"
                          : "text-slate-600 hover:bg-slate-100"
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
              className="rounded-full p-3 transition-colors hover:bg-slate-100 disabled:opacity-20"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </main>

      {/* Background Fetching Indicator */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-8 right-8 z-50 flex animate-pulse items-center gap-3 rounded-full bg-slate-900 px-5 py-3 text-white shadow-2xl">
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
  const navigateToCourse = () => router.push(`/courses/${course.id}`);

  return (
    <motion.article
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      whileHover={{ y: -6 }}
      onClick={navigateToCourse}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateToCourse();
        }
      }}
      role="button"
      tabIndex={0}
      className="group flex h-full cursor-pointer flex-col rounded-xl outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-teal-600/20"
    >
      <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-100 bg-slate-100 shadow-sm">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            priority={priority}
            sizes="(max-width:768px) 100vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <BookOpen size={40} />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-grow flex-col">
        <h3 className="h-12 line-clamp-2 text-lg font-bold leading-tight text-slate-900 transition-colors group-hover:text-teal-600">
          {course.title}
        </h3>

        <p className="mb-2 mt-1 text-xs font-medium text-slate-500">
          {course.instructor.name}
        </p>

        <div className="mb-3 flex items-center gap-1.5">
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
          <span className="text-xs font-bold text-slate-400">
            ({course.totalReviews.toLocaleString()})
          </span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-slate-50 pt-3">
          <span className="text-xl font-black text-slate-900">
            {formatCurrency(course.price)}
          </span>
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter text-slate-400">
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
  <div className="flex h-full flex-col">
    <div className="mb-4 aspect-video animate-pulse rounded-lg bg-slate-200" />
    <div className="mb-2 h-5 w-full animate-pulse rounded bg-slate-200" />
    <div className="mb-4 h-5 w-2/3 animate-pulse rounded bg-slate-200" />
    <div className="mt-auto h-10 w-full animate-pulse rounded bg-slate-100" />
  </div>
);
