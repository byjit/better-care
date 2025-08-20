"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const { data: session, isLoading } = trpc.auth.getSession.useQuery();

  useEffect(() => {
    if (!isLoading && session?.user) {
      // If user has a role, redirect to dashboard
      if (session.user.role) {
        router.push("/dashboard");
      } else {
        // If user doesn't have a role, redirect to role selection
        router.push("/role-selection");
      }
    }
  }, [session, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600">Better Care</CardTitle>
          <CardDescription className="text-lg">
            Connect with healthcare professionals through secure, AI-enhanced consultations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🏥</div>
              <h3 className="font-semibold">For Patients</h3>
              <p className="text-sm text-gray-600">Get medical consultations from qualified doctors</p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-2">👩‍⚕️</div>
              <h3 className="font-semibold">For Doctors</h3>
              <p className="text-sm text-gray-600">Provide remote consultations to patients</p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/login")}
            className="w-full"
            size="lg"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
