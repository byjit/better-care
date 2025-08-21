"use client";

import { trpc } from "@/utils/trpc";
import { DoctorSelectionCard } from "./doctor-selection-card";
import { DoctorCardSkeleton } from "@/components/doctors/doctor-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface DoctorSelectionProps {
  onDoctorSelect: (doctorId: string) => void;
}

export function DoctorSelection({ onDoctorSelect }: DoctorSelectionProps) {
  const { data: doctors, isLoading, error } = trpc.doctors.getAllDoctors.useQuery();

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Select a Doctor</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error?.message || "Failed to load doctors. Please try again later."}
        </AlertDescription>
      </Alert>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">No doctors available</h3>
        <p className="text-muted-foreground">
          Please check back later or contact support if this issue persists.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select a Doctor</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <DoctorSelectionCard
            key={doctor.id}
            doctor={doctor}
            onSelect={() => onDoctorSelect(doctor.id)}
          />
        ))}
      </div>
    </div>
  );
}