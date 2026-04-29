"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = isAuthenticated();

      if (!loggedIn) {
        router.replace("/login");
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router]);

  // Prevent flicker
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}