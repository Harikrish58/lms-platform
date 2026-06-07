"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/me", {
          cache: "no-cache",
          signal: controller.signal,
        });

        // User not logged in
        if (!response.ok) {
          router.replace("/login");
          return;
        }

        // User authenticated
        if (isMounted) setIsChecking(false);
      } catch (error: unknown) {
        // Silently ignore expected abort errors during cleanup
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        router.replace("/login");
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [router]);

  // Prevent page flicker
  if (isChecking) {
    return (
      <div 
        className="flex min-h-screen flex-col items-center justify-center bg-white"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}