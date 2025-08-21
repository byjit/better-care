"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";
import { DoctorSelection } from "./doctor-selection";
import { ConsultationForm } from "./consultation-form";
import { ExistingConsultations } from "./existing-consultations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function NewChatContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preSelectedDoctorId = searchParams.get("doctorId");
  
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(preSelectedDoctorId);
  const [activeTab, setActiveTab] = useState<"existing" | "new">(
    preSelectedDoctorId ? "new" : "existing"
  );

  const { data: existingConsultations, isLoading: loadingConsultations } = 
    trpc.consultation.getMyConsultations.useQuery();

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setActiveTab("new");
  };

  const handleConsultationSelect = (consultationId: string) => {
    router.push(`/chat/${consultationId}`);
  };

  const handleConsultationCreated = (consultationId: string) => {
    router.push(`/chat/${consultationId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "existing" | "new")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Continue Existing</TabsTrigger>
          <TabsTrigger value="new">Start New</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="mt-6">
          <ExistingConsultations
            consultations={existingConsultations as any}
            isLoading={loadingConsultations}
            onConsultationSelect={handleConsultationSelect}
            onCreateNew={() => setActiveTab("new")}
          />
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          {!selectedDoctorId ? (
            <DoctorSelection onDoctorSelect={handleDoctorSelect} />
          ) : (
            <ConsultationForm
              doctorId={selectedDoctorId}
              onConsultationCreated={handleConsultationCreated}
              onBack={() => setSelectedDoctorId(null)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}