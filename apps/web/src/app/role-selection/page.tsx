"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type UserRole = "patient" | "doctor";

interface PatientFormData {
  name: string;
  dateOfBirth: string;
  sex: "male" | "female" | "other" | "";
}

interface DoctorFormData {
  name: string;
  dateOfBirth: string;
  sex: "male" | "female" | "other" | "";
  specialization: string;
  licenseNumber: string;
  experience: string;
}

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState<"role" | "details">("role");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const [patientForm, setPatientForm] = useState<PatientFormData>({
    name: "",
    dateOfBirth: "",
    sex: "",
  });

  const [doctorForm, setDoctorForm] = useState<DoctorFormData>({
    name: "",
    dateOfBirth: "",
    sex: "",
    specialization: "",
    licenseNumber: "",
    experience: "",
  });

  const completeOnboardingMutation = trpc.auth.completeOnboarding.useMutation({
    onSuccess: () => {
      toast.success("Profile setup completed successfully!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error("Failed to complete setup: " + error.message);
      setIsLoading(false);
    },
  });

  const handleRoleSelection = () => {
    if (!selectedRole) return;
    setStep("details");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    setIsLoading(true);

    const metadata = selectedRole === "patient" 
      ? {
          name: patientForm.name,
          dateOfBirth: patientForm.dateOfBirth,
          sex: patientForm.sex as "male" | "female" | "other",
        }
      : {
          name: doctorForm.name,
          dateOfBirth: doctorForm.dateOfBirth,
          sex: doctorForm.sex as "male" | "female" | "other",
          specialization: doctorForm.specialization,
          licenseNumber: doctorForm.licenseNumber || undefined,
          experience: doctorForm.experience ? parseInt(doctorForm.experience) : undefined,
        };

    completeOnboardingMutation.mutate({
      role: selectedRole,
      metadata,
    });
  };

  const isFormValid = () => {
    if (selectedRole === "patient") {
      return patientForm.name && patientForm.dateOfBirth && patientForm.sex;
    } else if (selectedRole === "doctor") {
      return doctorForm.name && doctorForm.dateOfBirth && doctorForm.sex && doctorForm.specialization;
    }
    return false;
  };

  if (step === "role") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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
                className={cn("cursor-pointer transition-colors", selectedRole === "patient" && "border-primary bg-primary/5")} 
                onClick={() => setSelectedRole("patient")}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">👨‍💻</div>
                  <h3 className="font-semibold text-lg">Patient</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Seek medical consultations and connect with doctors
                  </p>
                </CardContent>
              </Card>

              <Card 
                className={cn("cursor-pointer transition-colors", selectedRole === "doctor" && "border-primary bg-primary/5")}
                onClick={() => setSelectedRole("doctor")}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">👨‍⚕️</div>
                  <h3 className="font-semibold text-lg">Doctor</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Provide medical consultations and help patients
                  </p>
                </CardContent>
              </Card>
            </div>

            <Button 
              onClick={handleRoleSelection}
              disabled={!selectedRole}
              className="w-full"
              size="lg"
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Complete Your {selectedRole === "patient" ? "Patient" : "Doctor"} Profile
          </CardTitle>
          <CardDescription>
            Please provide your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={selectedRole === "patient" ? patientForm.name : doctorForm.name}
                onChange={(e) => {
                  if (selectedRole === "patient") {
                    setPatientForm(prev => ({ ...prev, name: e.target.value }));
                  } else {
                    setDoctorForm(prev => ({ ...prev, name: e.target.value }));
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={selectedRole === "patient" ? patientForm.dateOfBirth : doctorForm.dateOfBirth}
                onChange={(e) => {
                  if (selectedRole === "patient") {
                    setPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }));
                  } else {
                    setDoctorForm(prev => ({ ...prev, dateOfBirth: e.target.value }));
                  }
                }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select
                value={selectedRole === "patient" ? patientForm.sex : doctorForm.sex}
                onValueChange={(value: "male" | "female" | "other") => {
                  if (selectedRole === "patient") {
                    setPatientForm(prev => ({ ...prev, sex: value }));
                  } else {
                    setDoctorForm(prev => ({ ...prev, sex: value }));
                  }
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole === "doctor" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    type="text"
                    placeholder="e.g., Cardiology, Pediatrics, General Medicine"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, specialization: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Medical License Number (Optional)</Label>
                  <Input
                    id="licenseNumber"
                    type="text"
                    placeholder="Enter your medical license number"
                    value={doctorForm.licenseNumber}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience (Optional)</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    placeholder="Years of medical practice"
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, experience: e.target.value }))}
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("role")}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className="flex-1"
              >
                {isLoading ? "Setting up..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}