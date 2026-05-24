import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/api/logout");

      queryClient.setQueryData(["currentUser"], null);

      queryClient.removeQueries({
        queryKey: ["currentUser"],
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return { handleLogout };
};
