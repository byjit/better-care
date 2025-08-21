"use client";

import { Suspense } from "react";
import { NewChatContent } from "@/components/new-chat/new-chat-content";
import { Loader } from "@/components/loader";

export default function NewChatPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Start New Consultation</h1>
        <p className="text-muted-foreground">
          Create a new consultation or continue with an existing one
        </p>
      </div>

      <Suspense fallback={<Loader />}>
        <NewChatContent />
      </Suspense>
    </div>
  );
}