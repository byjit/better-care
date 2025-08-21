"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, User, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Consultation {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "inactive";
  createdAt: Date;
  doctor?: {
    name: string;
    image: string | null;
  } | null;
}

interface ExistingConsultationsProps {
  consultations: Consultation[] | undefined;
  isLoading: boolean;
  onConsultationSelect: (consultationId: string) => void;
  onCreateNew: () => void;
}

const statusConfig = {
  pending: { label: "Pending", variant: "secondary" as const, color: "text-yellow-600" },
  active: { label: "Active", variant: "default" as const, color: "text-green-600" },
  inactive: { label: "Completed", variant: "outline" as const, color: "text-gray-600" },
};

export function ExistingConsultations({ 
  consultations, 
  isLoading, 
  onConsultationSelect, 
  onCreateNew 
}: ExistingConsultationsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Consultations</h2>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New Consultation
          </Button>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!consultations || consultations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No consultations yet</h3>
        <p className="text-muted-foreground mb-6">
          Start your first consultation with one of our qualified doctors
        </p>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Start New Consultation
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Consultations</h2>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Consultation
        </Button>
      </div>

      <div className="space-y-4">
        {consultations.map((consultation) => {
          const statusInfo = statusConfig[consultation.status];
          
          return (
            <Card 
              key={consultation.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onConsultationSelect(consultation.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={consultation.doctor?.image || undefined} alt={consultation.doctor?.name} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{consultation.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {consultation.doctor ? `Dr. ${consultation.doctor.name}` : "No doctor assigned"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(consultation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusInfo.variant} className={statusInfo.color}>
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {consultation.description}
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-3 p-0 h-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConsultationSelect(consultation.id);
                  }}
                >
                  Continue conversation →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}