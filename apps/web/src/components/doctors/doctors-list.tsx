"use client";

import { DoctorCard } from "./doctor-card";
import { DoctorCardSkeleton } from "./doctor-card-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  image: string | null;
  metadata: {
    specialization: string;
    experience?: number;
  };
}

interface DoctorsListProps {
  doctors: Doctor[] | undefined;
  isLoading: boolean;
  error: any | null;
}

export function DoctorsList({ doctors, isLoading, error }: DoctorsListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <DoctorCardSkeleton key={i} />
        ))}
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doctor) => (
        <DoctorCard key={doctor.id} doctor={doctor} />
      ))}
    </div>
  );
}