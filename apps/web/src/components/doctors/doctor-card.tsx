"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Star, User, MessageCircle } from "lucide-react";
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Doctor {
  id: string;
  name: string;
  image: string | null;
  metadata: {
    specialization: string;
    experience?: number;
  };
}

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const [selectedConsultationId, setSelectedConsultationId] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  // Get patient's consultations
  const { data: consultations, isLoading: consultationsLoading } = trpc.consultation.getMyConsultations.useQuery();

  // Get current user session to check role
  const { data: session } = trpc.auth.getSession.useQuery();

  // Connect doctor to consultation mutation
  const connectToConsultation = trpc.consultation.connectDoctorToConsultation.useMutation({
    onSuccess: (data) => {
      toast.success("Successfully connected to consultation!");
      router.push(`/chat/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to connect to consultation");
      setIsConnecting(false);
    }
  });

  const handleProceed = async () => {
    if (!selectedConsultationId) {
      toast.error("Please select a consultation");
      return;
    }

    setIsConnecting(true);

    try {
      await connectToConsultation.mutateAsync({
        consultationId: selectedConsultationId,
        doctorId: doctor.id
      });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  // Filter available consultations (pending ones for patients)
  const availableConsultations = consultations?.filter(consultation =>
    consultation.status === "pending"
  ) || [];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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

          {/* Show consultation selection only for patients */}
          {session?.user.role === 'patient' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Consultation</label>
                <Select
                  value={selectedConsultationId}
                  onValueChange={setSelectedConsultationId}
                  disabled={consultationsLoading || availableConsultations.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a consultation" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableConsultations.map((consultation) => (
                      <SelectItem key={consultation.id} value={consultation.id}>
                        {consultation.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableConsultations.length === 0 && !consultationsLoading && (
                  <p className="text-xs text-muted-foreground">
                    No pending consultations. Create one first.
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                onClick={handleProceed}
                disabled={!selectedConsultationId || isConnecting || availableConsultations.length === 0}
              >
                {isConnecting ? (
                  <>
                    <Calendar className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </>
                )}
              </Button>
            </>
          )}

          {/* Show simple book consultation for non-patients */}
          {session?.user.role !== 'patient' && (
            <Button className="w-full" onClick={() => router.push('/new-chat')}>
              <Calendar className="h-4 w-4 mr-2" />
              Book Consultation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}