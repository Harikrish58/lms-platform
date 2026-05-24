"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { registerUser } from "@/services/auth.service";

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),

    name: z.string().min(4, {
      message: "Name must be at least 4 characters",
    }),

    password: z.string().min(6, {
      message: "Password must be at least 6 characters",
    }),

    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),

    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      setGlobalError(null);

      const res = await registerUser(data);

      if (res.success) {
        router.push("/login");
      } else {
        setGlobalError(
          res.message || "Registration failed",
        );
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setGlobalError(
          err.response?.data?.message ||
            "Registration failed",
        );
      } else {
        setGlobalError(
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Brand Section */}
        <section className="hidden border-r border-slate-200 bg-white lg:flex lg:items-center lg:justify-center">
          <div className="w-full max-w-2xl px-16">
            <Image
              src="/logo.png"
              alt="NextEra"
              width={420}
              height={140}
              priority
            />

            <div className="mt-14 max-w-xl">
              <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900">
                Start building your future in tech
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Learn modern development through structured
                courses, real-world projects, and hands-on
                engineering experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Right Register Section */}
        <section className="flex items-center justify-center bg-slate-50 px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-md">
            
            {/* Mobile Logo */}
            <div className="mb-10 lg:hidden">
              <Image
                src="/logo.png"
                alt="NextEra"
                width={220}
                height={70}
                priority
              />
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">
                Create account
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-indigo-600 transition-colors hover:text-indigo-500"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 shadow-sm sm:px-10">
              
              {/* Global Error */}
              {globalError && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-rose-600"
                  />

                  <p className="text-sm font-bold text-rose-800">
                    {globalError}
                  </p>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                
                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Full name
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>

                    <input
                      type="text"
                      placeholder="John Doe"
                      {...register("name")}
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:outline-none focus:ring-4 ${
                        errors.name
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
                      }`}
                    />
                  </div>

                  {errors.name && (
                    <p className="mt-2 text-xs font-bold text-rose-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Email address
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>

                    <input
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:outline-none focus:ring-4 ${
                        errors.email
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
                      }`}
                    />
                  </div>

                  {errors.email && (
                    <p className="mt-2 text-xs font-bold text-rose-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Password
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>

                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register("password")}
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:outline-none focus:ring-4 ${
                        errors.password
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
                      }`}
                    />
                  </div>

                  {errors.password && (
                    <p className="mt-2 text-xs font-bold text-rose-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Confirm password
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>

                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register("confirmPassword")}
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:outline-none focus:ring-4 ${
                        errors.confirmPassword
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
                          : "border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20"
                      }`}
                    />
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-2 text-xs font-bold text-rose-600">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}