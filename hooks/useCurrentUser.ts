"use client";

import { Role } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
}

interface MeResponse {
  success: boolean;
  data: UserProfile;
}

export const useCurrentUser = () => {
  return useQuery<MeResponse | null>({
    queryKey: ["me"],

    queryFn: async () => {
      const response = await fetch("/api/me");

      if (!response.ok) {
        return null;
      }

      return response.json();
    },

    retry: false,
    staleTime: 1000 * 60 * 5,
  });
};
