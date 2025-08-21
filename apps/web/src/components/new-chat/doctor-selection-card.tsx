"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, User, ArrowRight } from "lucide-react";

interface Doctor {
  id: string;
  name: string;
  image: string | null;
  metadata: {
    specialization: string;
    experience?: number;
  };
}

interface DoctorSelectionCardProps {
  doctor: Doctor;
  onSelect: () => void;
}

export function DoctorSelectionCard({ doctor, onSelect }: DoctorSelectionCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={onSelect}>
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={doctor.image || undefined} alt={doctor.name} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{doctor.name}</h3>
            <Badge variant="secondary" className="mt-1">
              {doctor.metadata.specialization}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {doctor.metadata.experience !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>{doctor.metadata.experience} years experience</span>
            </div>
          )}
          <Button className="w-full" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
            Select Doctor
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}