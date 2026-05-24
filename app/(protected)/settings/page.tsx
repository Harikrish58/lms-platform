"use client";

import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ui/ImageUpload";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => (await axiosInstance.get("/api/me")).data,
  });

  const form = useForm({
    defaultValues: {
      name: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, form]);

  const avatarUrl = useWatch({
    control: form.control,
    name: "avatarUrl",
  });

  const updateMutation = useMutation({
    mutationFn: (values: { name: string; avatarUrl: string }) =>
      axiosInstance.patch("/api/me/update", values),
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  if (isLoading) return <Loader2 className="animate-spin mx-auto mt-20" />;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-black mb-6">Profile Settings</h1>

      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <label className="block text-sm font-bold mb-4">Profile Picture</label>
        <div className="mb-6 w-40">
          <ImageUpload
            value={avatarUrl}
            onChange={(url) => form.setValue("avatarUrl", url)}
            onRemove={() => form.setValue("avatarUrl", "")}
          />
        </div>

        <form
          onSubmit={form.handleSubmit((d) => updateMutation.mutate(d))}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-bold mb-1">Display Name</label>
            <input
              {...form.register("name")}
              className="w-full p-2 border rounded-lg bg-slate-50"
            />
          </div>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
