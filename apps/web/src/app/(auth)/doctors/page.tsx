"use client";

import { trpc } from "@/utils/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Stethoscope, User, Calendar, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";

export default function DoctorsPage() {
  const { data: doctors, isLoading, error } = trpc.doctors.getAllDoctors.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Available Doctors</h1>
          <p className="text-muted-foreground">
            Connect with qualified healthcare professionals for your consultation needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Doctors</h1>
          <p className="text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Doctors Available</h2>
          <p className="text-muted-foreground">
            There are currently no doctors available for consultation. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  const formatExperience = (experience?: number) => {
    if (!experience) return "New practitioner";
    if (experience === 1) return "1 year experience";
    return `${experience} years experience`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Available Doctors</h1>
        <p className="text-muted-foreground">
          Connect with qualified healthcare professionals for your consultation needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="h-full hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.image || undefined} alt={doctor.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(doctor.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{doctor.name}</CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="h-4 w-4 mr-1" />
                    Doctor
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Specialization</span>
                  <Badge variant="secondary" className="font-medium">
                    {doctor.metadata.specialization}
                  </Badge>
                </div>

                {doctor.metadata.experience !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Experience</span>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatExperience(doctor.metadata.experience)}
                    </div>
                  </div>
                )}
              </div>

              <Button className="w-full" size="sm">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Consultation
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}