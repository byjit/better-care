"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, User, Bot, Wifi, WifiOff } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import React from "react";
import { useParams } from 'next/navigation';
import { trpc } from "@/utils/trpc";
import { toast } from "sonner";
import { useSocket } from "@/hooks/use-socket";

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

  // Get existing messages from database
  const { data: existingMessages, isLoading: messagesLoading } = trpc.message.getMessages.useQuery(
    { consultationId: params.id },
    { enabled: !!params.id }
  );

  // Initialize socket connection
  const { socket, isConnected, messages: socketMessages, sendMessage, joinConsultation } = useSocket(
    params.id,
    session?.user.id,
    session?.user.name,
    session?.user.role ?? "patient"
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Join consultation room when connected
  useEffect(() => {
    if (isConnected && params.id) {
      joinConsultation(params.id);
    }
  }, [isConnected, params.id, joinConsultation]);

  // Combine and deduplicate messages, ensuring proper ordering
  const allMessages = React.useMemo(() => {
    const dbMessages = existingMessages || [];
    const realtimeMessages = socketMessages || [];

    // Create a map to track unique messages by ID
    const messageMap = new Map();

    // Add database messages first (they are the source of truth)
    dbMessages.forEach(msg => {
      messageMap.set(msg.id, {
        ...msg,
        createdAt: new Date(msg.createdAt) // Ensure consistent Date object
      });
    });

    // Add socket messages, but only if they're not already in the database
    realtimeMessages.forEach(msg => {
      if (!messageMap.has(msg.id)) {
        messageMap.set(msg.id, {
          ...msg,
          createdAt: new Date(msg.createdAt) // Ensure consistent Date object
        });
      }
    });

    // Convert back to array and sort by creation time
    return Array.from(messageMap.values()).sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [existingMessages, socketMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    if (!isConnected) {
      toast.error("Not connected to server. Please try again.");
      return;
    }

    sendMessage(text);
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
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs">Disconnected</span>
                </div>
              )}
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
        <div className="overflow-y-auto max-h-[calc(50vh)] space-y-4 pb-4">
          {allMessages.length === 0 ? (
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
              allMessages.map((message) => {
                const isCurrentUser = message.senderId === session?.user.id;
                const isAI = message.messageType === 'ai';

                return (
                  <div
                    key={`${message.id}-${message.createdAt}`}
                    className={`flex gap-3 ${isCurrentUser && !isAI ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isCurrentUser && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          {isAI ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[70%] ${isCurrentUser && !isAI ? 'order-first' : ''}`}>
                      <div
                        className={`p-3 rounded-lg ${isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary"
                          }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-semibold">
                            {isAI
                              ? "AI Assistant"
                              : isCurrentUser
                                ? "You"
                                : message.senderName || message.senderRole}
                          </p>
                          <span className="text-xs opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </div>
                      </div>
                    </div>
                    {isCurrentUser && !isAI && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })
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
            disabled={consultation.status === 'inactive' || !isConnected}
          />
          <Button
            type="submit"
            size="icon"
            disabled={consultation.status === 'inactive' || !isConnected || !input.trim()}
          >
            <Send size={18} />
          </Button>
        </form>
      </div>
    </div>
  );
}