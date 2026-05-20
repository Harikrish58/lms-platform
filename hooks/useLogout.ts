import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/logout");

      // Remove authenticated user cache only
      queryClient.removeQueries({
        queryKey: ["me"],
      });

      router.push("/login");
      router.refresh();

    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { handleLogout };
};