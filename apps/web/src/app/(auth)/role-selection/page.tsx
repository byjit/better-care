"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const updateRoleMutation = trpc.auth.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Failed to update role: " + error.message);
      setIsLoading(false);
    },
  });

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    updateRoleMutation.mutate({ role: selectedRole });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Choose Your Role</CardTitle>
          <CardDescription>
            Select how you'll be using Better Care
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${
                selectedRole === "patient" 
                  ? "ring-2 ring-blue-500 bg-blue-50" 
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedRole("patient")}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🏥</div>
                <h3 className="font-semibold text-lg">Patient</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Seek medical consultations and connect with doctors
                </p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-colors ${
                selectedRole === "doctor" 
                  ? "ring-2 ring-blue-500 bg-blue-50" 
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedRole("doctor")}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">👩‍⚕️</div>
                <h3 className="font-semibold text-lg">Doctor</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Provide medical consultations and help patients
                </p>
              </CardContent>
            </Card>
          </div>

          <Button 
            onClick={handleRoleSelection}
            disabled={!selectedRole || isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Setting up your account..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}