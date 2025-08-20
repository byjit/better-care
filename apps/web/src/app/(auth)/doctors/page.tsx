"use client";

import { trpc } from "@/utils/trpc";
import { DoctorsList } from "@/components/doctors/doctors-list";

export default function DoctorsPage() {
  const { data: doctors, isLoading, error } = trpc.doctors.getAllDoctors.useQuery();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Available Doctors</h1>
        <p className="text-muted-foreground">
          Connect with qualified healthcare professionals for your consultation needs
        </p>
      </div>

      <DoctorsList doctors={doctors} isLoading={isLoading} error={error} />
    </div>
  );
}