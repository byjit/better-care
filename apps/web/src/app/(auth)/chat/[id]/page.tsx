"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User, Clock, CheckCircle, XCircle } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useParams } from 'next/navigation';
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const [input, setInput] = useState("");

  // Get consultation data
  const { data: consultation, isLoading: consultationLoading, error } = trpc.consultation.getConsultationById.useQuery(
    { id: params.id },
    { enabled: !!params.id }
  );

  // Get current user session
  const { data: session } = trpc.auth.getSession.useQuery();

  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_SERVER_URL}/ai/${params.id}`, 
    }),
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  };

  if (consultationLoading) {
    return (
      <p>Loading...</p>
    );
  }

  if (error || !consultation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive">Failed to load consultation</p>
          <p className="text-sm text-muted-foreground mt-1">
            {error?.message || "Consultation not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] pb-4 relative flex flex-col">
      {/* Consultation Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {consultation.title}
                <Badge className={`flex items-center gap-1`}>
                  {consultation.status}
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {consultation.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-muted-foreground">
                Patient: {session?.user.role === 'patient' ? 'You' : 'Patient'}
              </span>
            </div>
            {consultation.doctorId && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback>
                    <User className="h-3 w-3" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">
                  Doctor: {session?.user.role === 'doctor' ? 'You' : 'Doctor'}
                </span>
              </div>
            )}
            {!consultation.doctorId && consultation.status === 'pending' && (
              <span className="text-yellow-600 text-sm">Waiting for doctor to join...</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <div className="flex-1 grid grid-rows-[1fr_auto] overflow-hidden">
        <div className="overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground mt-8">
              <p className="mb-2">Welcome to your consultation chat!</p>
              <p className="text-sm">
                {consultation.status === 'pending'
                  ? "Waiting for a doctor to join this consultation..."
                  : "Start chatting with your healthcare provider or use @ai to get AI assistance"
                }
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${message.role === "user"
                  ? "bg-primary/10 ml-8"
                  : "bg-secondary/20 mr-8"
                  }`}
              >
                <p className="text-sm font-semibold mb-1">
                  {message.role === "user" ? "You" : "AI Assistant"}
                </p>
                {message.parts?.map((part, index) => {
                  if (part.type === "text") {
                    return (
                      <div key={index} className="whitespace-pre-wrap">
                        {part.text}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSubmit}
          className="sticky bottom-0 left-0 w-full max-w-2xl mx-auto bg-background flex items-center space-x-2 pt-2 border-t px-4 z-30"
        >
          <Input
            name="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={consultation.status === 'active'
              ? "Type your message... (use @ai for AI assistance)"
              : "Type your message..."
            }
            className="flex-1"
            autoComplete="off"
            autoFocus
            disabled={consultation.status === 'inactive'}
          />
          <Button
            type="submit"
            size="icon"
            disabled={consultation.status === 'inactive'}
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}