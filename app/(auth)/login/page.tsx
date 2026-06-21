"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { isAxiosError, AxiosError } from "axios";

import axiosInstance from "@/lib/axios";

// Validation Schema
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),

  password: z.string().min(6, {
    message: "Password must be at least 6 characters",
  }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface ApiErrorResponse {
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setGlobalError(null);

      // Authenticate user
      await axiosInstance.post("/api/login", data);

      // Refresh authenticated user cache
      await queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });

      // Redirect user
      router.push("/courses");
      router.refresh();
    } catch (error) {
      if (isAxiosError(error)) {
        const axiosError: AxiosError<ApiErrorResponse> = error;
        setGlobalError(
          typeof axiosError.response?.data?.message === "string"
            ? axiosError.response.data.message
            : "Invalid email or password",
        );
      } else {
        setGlobalError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        
        {/* Brand Section */}
        <section className="hidden border-r border-slate-200 bg-white lg:flex lg:items-center lg:justify-center">
          <div className="w-full max-w-2xl px-16">
            <Image
              src="/logo.png"
              alt="NextEra"
              width={340}
              height={140}
              priority
            />

            <div className="mt-14 max-w-xl">
              <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900">
                Future-ready learning for developers
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Access curated paths, hands-on projects, and a
                modern learning experience built for real-world
                engineering.
              </p>
            </div>
          </div>
        </section>

        {/* Login Section */}
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
                Welcome back
              </h2>

              <p className="mt-2 text-sm font-medium text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-bold text-teal-600 transition-colors hover:text-teal-700"
                >
                  Sign up for free
                </Link>
              </p>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 shadow-sm sm:px-10">
              
              {/* Global Error */}
              {globalError && (
                <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-rose-600"
                  />

                  <p className="text-sm font-bold text-rose-700">
                    {globalError}
                  </p>
                </div>
              )}

              {/* Login Form */}
              <form
                className="space-y-6"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
              >
                
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-slate-500" />
                    </div>

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      {...register("email")}
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:outline-none focus:ring-4 ${
                        errors.email
                          ? "border-rose-600 focus:border-rose-600 focus:ring-rose-600/20"
                          : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/20"
                      }`}
                    />
                  </div>

                  {errors.email && (
                    <p id="email-error" className="mt-2 text-xs font-bold text-rose-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold text-slate-700"
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      className="text-xs font-bold text-teal-600 hover:text-teal-700"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-slate-500" />
                    </div>

                    <input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "password-error" : undefined}
                      {...register("password")}
                      className={`block w-full rounded-xl border py-2.5 pl-10 pr-3 text-sm transition-all focus:outline-none focus:ring-4 ${
                        errors.password
                          ? "border-rose-600 focus:border-rose-600 focus:ring-rose-600/20"
                          : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/20"
                      }`}
                    />
                  </div>

                  {errors.password && (
                    <p id="password-error" className="mt-2 text-xs font-bold text-rose-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-600/30 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
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