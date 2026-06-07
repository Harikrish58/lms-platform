"use client";

import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload";
import {
  Loader2,
  User,
  Mail,
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  KeyRound,
  Award,
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

// Strict Schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  avatarUrl: z.string().optional(),

  headline: z
    .string()
    .max(100, "Headline cannot exceed 100 characters")
    .optional(),

  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

interface LmsUser {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
  bio: string | null;
  headline: string | null;
  isVerified: boolean;
}

interface MeResponse {
  success: boolean;
  data: LmsUser;
}
interface UserStats {
  enrolledCourses: number;
  completedCourses: number;
  completedLessons: number;
  learningHours: number;
}

interface UserPreferences {
  courseUpdates: boolean;
  lessonNotifications: boolean;
  announcements: boolean;
  marketingEmails: boolean;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading: userLoading,
    isError: userError,
  } = useQuery<MeResponse>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await axiosInstance.get("/api/me");
      return response.data;
    },
  });

  const user = data?.data;

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery<UserStats>({
    queryKey: ["userStats"],
    queryFn: async () => (await axiosInstance.get("/api/me/stats")).data,
  });

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ["userPreferences"],
    queryFn: async () => (await axiosInstance.get("/api/me/preferences")).data,
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", avatarUrl: "", bio: "", headline: "" },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name || "",
        avatarUrl: user.avatarUrl || "",
        bio: user.bio || "",
        headline: user.headline || "",
      });
    }
  }, [user, profileForm]);

  const avatarUrl =
    useWatch({ control: profileForm.control, name: "avatarUrl" }) ?? null;

  const updateProfile = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      axiosInstance.patch("/api/me", values),
    onSuccess: (response) => {
      toast.success("Profile updated");

      queryClient.setQueryData(["currentUser"], response.data.data);

      queryClient.invalidateQueries({
        queryKey: ["currentUser"],
      });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const updatePassword = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      axiosInstance.post("/api/me/password", values),
    onSuccess: () => {
      toast.success("Password updated");
      passwordForm.reset();
    },
    onError: (err) => {
      const msg = isAxiosError(err)
        ? err.response?.data?.message
        : "Failed to update password";
      toast.error(msg);
    },
  });

  const updatePreferences = useMutation({
    mutationFn: (values: UserPreferences) =>
      axiosInstance.patch("/api/me/preferences", values),

    onSuccess: () => {
      toast.success("Notification preferences updated");

      queryClient.invalidateQueries({
        queryKey: ["userPreferences"],
      });
    },

    onError: () => {
      toast.error("Failed to update preferences");
    },
  });

  const deleteAccount = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete("/api/me/delete");
    },

    onSuccess: () => {
      toast.success("Account deleted");

      window.location.href = "/";
    },

    onError: () => {
      toast.error("Failed to delete account");
    },
  });

  if (userLoading || statsLoading)
    return (
      <Loader2 className="mx-auto mt-20 animate-spin text-teal-600" size={40} />
    );
  if (userError || !user)
    return (
      <div className="mt-20 text-center font-bold text-rose-600">
        Failed to load settings.
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-10 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          Account Settings
        </h1>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Profile Section */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-5">
                <h2 className="flex items-center gap-2 font-black text-slate-900">
                  <User size={20} className="text-teal-600" /> Public Profile
                </h2>
              </div>
              <div className="p-8">
                <div className="mb-8 w-40">
                  <ImageUpload
                    value={avatarUrl}
                    onChange={(url) => profileForm.setValue("avatarUrl", url)}
                    onRemove={() => profileForm.setValue("avatarUrl", "")}
                  />
                </div>
                <form
                  onSubmit={profileForm.handleSubmit((d) =>
                    updateProfile.mutate(d),
                  )}
                  className="space-y-4"
                >
                  <input
                    {...profileForm.register("name")}
                    placeholder="Display Name"
                    className="w-full rounded-lg border p-3"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-rose-600 font-bold">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}

                  <input
                    {...profileForm.register("headline")}
                    placeholder="Professional Headline"
                    className="w-full rounded-lg border p-3"
                  />
                  <textarea
                    {...profileForm.register("bio")}
                    placeholder="Bio"
                    className="w-full rounded-lg border p-3"
                  />

                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="bg-teal-600 px-6 py-3 font-bold text-white rounded-lg transition-colors hover:bg-teal-700"
                  >
                    Save Profile
                  </button>
                </form>
              </div>
            </section>

            {/* Security Section */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-5">
                <h2 className="flex items-center gap-2 font-black text-slate-900">
                  <KeyRound size={20} className="text-teal-600" /> Security
                </h2>
              </div>
              <div className="p-8">
                <form
                  onSubmit={passwordForm.handleSubmit((d) =>
                    updatePassword.mutate(d),
                  )}
                  className="space-y-4"
                >
                  <input
                    {...passwordForm.register("currentPassword")}
                    type="password"
                    placeholder="Current Password"
                    className="w-full rounded-lg border p-3"
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-xs text-rose-600 font-bold">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}

                  <input
                    {...passwordForm.register("newPassword")}
                    type="password"
                    placeholder="New Password"
                    className="w-full rounded-lg border p-3"
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-rose-600 font-bold">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}

                  <input
                    {...passwordForm.register("confirmPassword")}
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full rounded-lg border p-3"
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-rose-600 font-bold">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={updatePassword.isPending}
                    className="bg-teal-600 px-6 py-3 font-bold text-white rounded-lg transition-colors hover:bg-teal-700"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-5">
                <h2 className="font-black text-slate-900">
                  Notification Preferences
                </h2>
              </div>

              <div className="space-y-4 p-8">
                <label className="flex items-center justify-between">
                  <span>Course Updates</span>

                  <input
                    type="checkbox"
                    checked={preferences?.courseUpdates ?? false}
                    onChange={(e) =>
                      updatePreferences.mutate({
                        ...preferences!,
                        courseUpdates: e.target.checked,
                      })
                    }
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span>Lesson Notifications</span>

                  <input
                    type="checkbox"
                    checked={preferences?.lessonNotifications ?? false}
                    onChange={(e) =>
                      updatePreferences.mutate({
                        ...preferences!,
                        lessonNotifications: e.target.checked,
                      })
                    }
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span>Announcements</span>

                  <input
                    type="checkbox"
                    checked={preferences?.announcements ?? false}
                    onChange={(e) =>
                      updatePreferences.mutate({
                        ...preferences!,
                        announcements: e.target.checked,
                      })
                    }
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span>Marketing Emails</span>

                  <input
                    type="checkbox"
                    checked={preferences?.marketingEmails ?? false}
                    onChange={(e) =>
                      updatePreferences.mutate({
                        ...preferences!,
                        marketingEmails: e.target.checked,
                      })
                    }
                  />
                </label>
              </div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
              <div className="border-b border-rose-100 bg-rose-50 px-8 py-5">
                <h2 className="font-black text-rose-700">Danger Zone</h2>
              </div>

              <div className="space-y-4 p-8">
                <p className="text-sm text-slate-600">
                  Deleting your account will permanently remove your profile,
                  enrollments, progress, reviews, and settings. This action
                  cannot be undone.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    const confirmed = window.confirm(
                      "Are you sure you want to permanently delete your account?",
                    );

                    if (confirmed) {
                      deleteAccount.mutate();
                    }
                  }}
                  className="rounded-lg bg-rose-600 px-5 py-3 font-bold text-white hover:bg-rose-700"
                >
                  Delete Account
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">
                Account Details
              </h3>
              <div className="space-y-4 text-sm font-bold">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-slate-400" /> {user.email}
                </div>
                <div className="flex items-center gap-3">
                  <User size={18} className="text-slate-400" /> {user.role}
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-slate-400" /> Joined{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3">
                  {user.isVerified ? (
                    <CheckCircle className="text-emerald-600" size={18} />
                  ) : (
                    <AlertTriangle className="text-amber-600" size={18} />
                  )}
                  {user.isVerified ? "Verified Account" : "Unverified"}
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl">
              <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">
                Learning Stats
              </h3>
              {statsError ? (
                <p className="text-rose-400 text-sm">Failed to load stats.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800 p-4 rounded-xl">
                    <BookOpen className="text-teal-400" />{" "}
                    <p className="text-xl font-black">
                      {stats?.enrolledCourses || 0}
                    </p>
                    <p className="text-xs text-slate-400">Enrolled courses</p>
                  </div>
                  <div className="bg-slate-800 p-4 rounded-xl">
                    <Award className="text-amber-400" />{" "}
                    <p className="text-xl font-black">
                      {stats?.completedCourses || 0}
                    </p>
                    <p className="text-xs text-slate-400">Completed courses</p>
                  </div>
                  <div className="col-span-2 rounded-xl bg-slate-800 p-4">
                    <Clock className="text-teal-400 mb-2" />{" "}
                    <p className="text-xl font-black">
                      {stats?.learningHours || 0} hrs
                    </p>
                    <p className="text-xs text-slate-400">learning Hours</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
