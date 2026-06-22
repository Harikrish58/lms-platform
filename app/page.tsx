import Image from "next/image";
import Link from "next/link";
import { getCourses } from "@/actions/course.actions";
import {
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

const FEATURED_COURSES_LIMIT = 3;

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
  };
}

const currencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

const formatCurrency = (amount: number): string =>
  amount === 0 ? "Free" : currencyFormatter.format(amount);

const features = [
  {
    icon: BookOpen,
    title: "Structured Learning Paths",
    description:
      "Follow carefully designed learning roadmaps with practical projects, real-world workflows, and production concepts.",
  },
  {
    icon: ShieldCheck,
    title: "Progress Tracking",
    description:
      "Continue exactly where you left off with lesson completion tracking, saved progress, and seamless learning continuity.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Learn alongside developers worldwide and build industry-ready technical confidence together.",
  },
];

export default async function HomePage() {
  let featuredCourses: Course[] = [];

  try {
    const response = await getCourses({
      page: 1,
      limit: FEATURED_COURSES_LIMIT,
    });

    if (response?.data && Array.isArray(response.data)) {
      featuredCourses = response.data.slice(0, FEATURED_COURSES_LIMIT);
    }
  } catch (error) {
    console.error(
      "[HomePage] Failed to fetch featured courses",
      error instanceof Error ? error.message : error,
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative isolate bg-slate-900 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.15),transparent_40%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-teal-100 backdrop-blur">
              <Sparkles size={16} aria-hidden="true" />
              Trusted by modern developers
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none max-w-3xl mx-auto">
                Master Modern{" "}
                <span className="block text-teal-100">Web Development</span>
              </h1>

              <p className="max-w-2xl text-lg text-slate-500 leading-relaxed mx-auto">
                Learn React, Next.js, TypeScript, backend architecture,
                production workflows, and real-world engineering practices
                through premium hands-on courses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-8 py-4 font-bold text-white transition-all hover:bg-teal-700 hover:scale-[1.02]"
              >
                Explore Courses
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur transition-all hover:bg-white/10"
              >
                Start Learning
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div>
                <h3 className="text-3xl font-black">15K+</h3>
                <p className="text-sm text-slate-500 mt-1">Active learners</p>
              </div>

              <div>
                <h3 className="text-3xl font-black">120+</h3>
                <p className="text-sm text-slate-500 mt-1">Video lessons</p>
              </div>

              <div>
                <h3 className="text-3xl font-black">4.9 Rating</h3>
                <p className="text-sm text-slate-500 mt-1">Student feedback</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Built for Serious Developers
            </h2>

            <p className="mt-4 text-lg text-slate-500">
              Everything you need to learn production-grade engineering skills
              in one modern learning platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group rounded-3xl bg-white border border-slate-200 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center">
                    <Icon size={24} aria-hidden="true" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600">
                  Featured Courses
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
                  Learn From Real Projects
                </h2>
              </div>

              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors"
              >
                Browse all courses
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <BookOpen size={42} aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-1 text-amber-600 text-sm font-semibold">
                      <Star size={14} fill="currentColor" aria-hidden="true" />
                      <span>{course.averageRating.toFixed(1)}</span>
                      <span className="text-slate-500">
                        ({course.totalReviews} reviews)
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
                      {course.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      By {course.instructor.name}
                    </p>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">
                          Price
                        </p>

                        <p className="text-2xl font-black text-slate-900">
                          {formatCurrency(course.price)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-teal-50 px-4 py-2 text-sm font-bold text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
                        View Course
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="px-6 pb-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[40px] bg-slate-900 px-8 py-20 md:px-16 text-center text-white">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 h-full w-[800px] -translate-x-1/2 bg-[radial-gradient(circle_at_top,rgba(13,148,136,0.15),transparent_70%)]" />
            </div>

            <div className="relative max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                Start Building Real-World Skills Today
              </h2>

              <p className="mt-6 text-lg text-slate-500 leading-relaxed">
                Join developers learning modern frontend engineering, backend
                systems, authentication, databases, APIs, and production
                workflows through practical projects.
              </p>

              <div className="mt-10">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black text-slate-900 transition-all hover:scale-[1.02]"
                >
                  Create Free Account
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
