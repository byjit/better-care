"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hero } from "@/components/landing/hero";
import { platformPainPointsAndSolutions } from "@/utils/constant";
import { CheckCircle, AlertCircle, Lightbulb, Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      <Hero />

      <div className="container mx-auto p-6 space-y-10">
        <h2 className="text-3xl font-bold text-center">Features & Solutions</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {platformPainPointsAndSolutions.map((item, index) => (
            <Card className="px-4 py-8" key={index}>
              <CardHeader className="h-20">
                <CardTitle>{item.problem}</CardTitle>
                <CardDescription>{item.pain}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-col items-start gap-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    Our Solution
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {item.solution}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
