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

export default async function Home() {
  let featuredCourses: Course[] = [];

  try {
    const response = await getCourses({ page: 1, limit: 3 });

    if (response?.data) {
      featuredCourses = response.data.slice(0, 3);
    }
  } catch (error) {
    console.error("Failed to fetch featured courses:", error);
  }

  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative isolate bg-slate-950 text-white">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-24 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-indigo-300 backdrop-blur">
              <Sparkles size={16} />
              Trusted by modern developers
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-none max-w-3xl mx-auto">
                Master Modern{" "}
                <span className="block text-indigo-400">Web Development</span>
              </h1>

              <p className="max-w-2xl text-lg text-slate-400 leading-relaxed mx-auto">
                Learn React, Next.js, TypeScript, backend architecture,
                production workflows, and real-world engineering practices
                through premium hands-on courses.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white transition-all hover:bg-indigo-500 hover:scale-[1.02]"
              >
                Explore Courses
                <ArrowRight size={18} />
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
                <p className="text-sm text-slate-400 mt-1">Active learners</p>
              </div>

              <div>
                <h3 className="text-3xl font-black">120+</h3>
                <p className="text-sm text-slate-400 mt-1">Video lessons</p>
              </div>

              <div>
                <h3 className="text-3xl font-black">4.9 Rating</h3>
                <p className="text-sm text-slate-400 mt-1">Student feedback</p>
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
            <div className="group rounded-3xl bg-white border border-slate-200 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <BookOpen size={24} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900">
                Structured Learning Paths
              </h3>

              <p className="mt-3 text-slate-500 leading-relaxed">
                Follow carefully designed learning roadmaps with practical
                projects, real-world workflows, and production concepts.
              </p>
            </div>

            <div className="group rounded-3xl bg-white border border-slate-200 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900">
                Progress Tracking
              </h3>

              <p className="mt-3 text-slate-500 leading-relaxed">
                Continue exactly where you left off with lesson completion
                tracking, saved progress, and seamless learning continuity.
              </p>
            </div>

            <div className="group rounded-3xl bg-white border border-slate-200 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Users size={24} />
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900">
                Community Driven
              </h3>

              <p className="mt-3 text-slate-500 leading-relaxed">
                Learn alongside developers worldwide and build industry-ready
                technical confidence together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
                  Featured Courses
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-tight text-slate-900">
                  Learn From Real Projects
                </h2>
              </div>

              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Browse all courses
                <ArrowRight size={16} />
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
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <BookOpen size={42} />
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                      <Star size={14} fill="currentColor" />
                      <span>{course.averageRating.toFixed(1)}</span>
                      <span className="text-slate-400">
                        ({course.totalReviews} reviews)
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      By {course.instructor.name}
                    </p>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
                          Price
                        </p>

                        <p className="text-2xl font-black text-slate-900">
                          {course.price === 0
                            ? "Free"
                            : `$${course.price.toFixed(2)}`}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
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
          <div className="relative overflow-hidden rounded-[40px] bg-slate-950 px-8 py-20 md:px-16 text-center text-white">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
            </div>

            <div className="relative max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                Start Building Real-World Skills Today
              </h2>

              <p className="mt-6 text-lg text-slate-400 leading-relaxed">
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
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
