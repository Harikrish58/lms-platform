import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { logout as apiLogout } from "@/lib/auth";
import toast from "react-hot-toast";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      // Clear session cookie on the server
      await apiLogout();

      // Clear all cached data in the client state
      queryClient.clear();

      toast.success("Logged out successfully");

      // Redirect user back to the login page
      router.push("/login");
      router.refresh();
    } catch (error: unknown) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out.");
    }
  };

  return { handleLogout };
};