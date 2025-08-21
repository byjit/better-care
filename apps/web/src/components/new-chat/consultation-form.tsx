"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/utils/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Send } from "lucide-react";
import { toast } from "sonner";

const consultationFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Please provide at least 10 characters describing your issue").max(1000, "Description must be less than 1000 characters"),
});

type ConsultationFormData = z.infer<typeof consultationFormSchema>;

interface ConsultationFormProps {
  doctorId: string;
  onConsultationCreated: (consultationId: string) => void;
  onBack: () => void;
}

export function ConsultationForm({ doctorId, onConsultationCreated, onBack }: ConsultationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: doctor } = trpc.doctors.getAllDoctors.useQuery(undefined, {
    select: (doctors) => doctors?.find(d => d.id === doctorId)
  });

  const createConsultation = trpc.consultation.create.useMutation({
    onSuccess: (consultation) => {
      toast.success("Consultation created successfully!");
      onConsultationCreated(consultation.id);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create consultation");
      setIsSubmitting(false);
    },
  });

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = async (data: ConsultationFormData) => {
    setIsSubmitting(true);
    createConsultation.mutate({
      ...data,
      doctorId,
    });
  };

  if (!doctor) {
    return <div>Loading doctor information...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Doctor Selection
        </Button>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={doctor.image || undefined} alt={doctor.name} />
                <AvatarFallback>
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{doctor.name}</h3>
                <Badge variant="secondary">{doctor.metadata.specialization}</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Describe Your Health Concern</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultation Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Brief title for your consultation (e.g., 'Persistent headaches')"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Problem Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe your symptoms, when they started, and any relevant details that might help the doctor understand your condition..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Creating Consultation..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Start Consultation
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}