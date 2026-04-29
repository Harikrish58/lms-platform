"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/services/auth.service";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email"),
    name: z.string().min(4, "Name must be at least 4 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      const res = await registerUser(data);

      if (res.success) {
        toast.success("Account created successfully!");
        router.push("/login");
      } else {
        toast.error(res.message || "Registration failed");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        toast.error(err.response?.data?.message || "Registration failed");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 py-12">
      {/* Subtle background glow */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-violet-100/50 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-100/50 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white rounded-3xl shadow-2xl shadow-violet-100/50 border border-slate-100 p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-violet-200 mb-6 transform rotate-3">
              <UserPlus size={30} />
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Create Account
            </h2>
            <p className="text-slate-500 mt-2 font-medium">
              Join our community today
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors"
                  size={18}
                />
                <input
                  placeholder="John Doe"
                  {...register("name")}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                    errors.name ? "border-red-500" : "border-slate-200"
                  } rounded-xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-600 outline-none transition-all placeholder:text-slate-400`}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-medium italic">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                    errors.email ? "border-red-500" : "border-slate-200"
                  } rounded-xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-600 outline-none transition-all placeholder:text-slate-400`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-medium italic">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                    errors.password ? "border-red-500" : "border-slate-200"
                  } rounded-xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-600 outline-none transition-all placeholder:text-slate-400`}
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-medium italic">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Confirm Password
              </label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-slate-200"
                  } rounded-xl focus:ring-4 focus:ring-violet-500/10 focus:border-violet-600 outline-none transition-all placeholder:text-slate-400`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 ml-1 font-medium italic">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-200 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" size={20} />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign Up Now</span>
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </div>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center pt-6 border-t border-slate-50">
            <p className="text-slate-500 text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-violet-600 font-bold hover:text-indigo-700 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
