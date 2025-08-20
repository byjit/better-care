"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { trpc } from "@/utils/trpc";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isLoading } = trpc.auth.getSession.useQuery();

  useEffect(() => {
    if (isLoading) return;

    // If no session, redirect to login
    if (!session) {
      router.push("/login");
      return;
    }

    // If user needs onboarding and not on role-selection page
    if (session.user.onboard && pathname !== "/role-selection") {
      router.push("/role-selection");
      return;
    }

    // If user completed onboarding but on role-selection page
    if (!session.user.onboard && pathname === "/role-selection") {
      router.push("/dashboard");
      return;
    }
  }, [session, isLoading, pathname, router]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!session || (session.user.onboard && pathname !== "/role-selection") || (!session.user.onboard && pathname === "/role-selection")) {
    return null;
  }

  return <div className="flex flex-col min-h-screen">{children}</div>;
}