"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthLayout({
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

        // Already logged in → redirect away from auth pages
        if (response.ok) {
          router.replace("/courses");
          return;
        }

        if (isMounted) setIsChecking(false);
      } catch (error: unknown) {
        // Silently ignore expected abort errors during cleanup
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        
        if (isMounted) setIsChecking(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [router]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Preparing environment...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}