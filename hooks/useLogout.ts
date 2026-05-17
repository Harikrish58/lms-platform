import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth";
import toast from "react-hot-toast";

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();

    toast.success("Logged out successfully");

    router.replace("/login");
    router.refresh();
  };

  return handleLogout;
};