import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { user } from "./user";
import { consultation } from "./consultation";

export const messageTypeEnum = ["user", "ai"] as const;
export type MessageType = (typeof messageTypeEnum)[number];

export const message = sqliteTable("message", {
  id: text("id").primaryKey(),
  consultationId: text("consultation_id").notNull().references(() => consultation.id),
  senderId: text("sender_id").notNull().references(() => user.id),
  content: text("content").notNull(),
  messageType: text("message_type", { enum: messageTypeEnum }).default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Relations
export const messageRelations = relations(message, ({ one }) => ({
  consultation: one(consultation, {
    fields: [message.consultationId],
    references: [consultation.id],
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
}));

// Base schemas
export const messageSelectSchema = createSelectSchema(message);
export const messageInsertSchema = createInsertSchema(message, {
  content: z.string().min(1, "Message content is required").max(5000, "Message must be less than 5000 characters"),
  messageType: z.enum(messageTypeEnum).optional(),
});
export const messageUpdateSchema = createUpdateSchema(message);

// Specialized schemas for different operations
export const sendMessageSchema = messageInsertSchema.omit({
  id: true,
  createdAt: true,
  senderId: true, // Will be set from auth context
}).extend({
  consultationId: z.string().min(1, "Consultation ID is required"),
});

export const getMessagesSchema = z.object({
  consultationId: z.string().min(1, "Consultation ID is required"),
  limit: z.number().min(1).max(100).optional().default(50),
  offset: z.number().min(0).optional().default(0),
});

export const aiMessageSchema = z.object({
  consultationId: z.string().min(1, "Consultation ID is required"),
  content: z.string().min(1, "AI message content is required"),
  triggerMessageId: z.string().optional(), // Reference to the message that triggered AI
});

// Types
export type Message = z.infer<typeof messageSelectSchema>;
export type NewMessage = z.infer<typeof messageInsertSchema>;
export type MessageUpdate = z.infer<typeof messageUpdateSchema>;
export type SendMessage = z.infer<typeof sendMessageSchema>;
export type GetMessages = z.infer<typeof getMessagesSchema>;
export type AIMessage = z.infer<typeof aiMessageSchema>;

// Validation functions
export const validateMessageContent = (content: string): { isValid: boolean; error?: string } => {
  // Check for empty content
  if (!content.trim()) {
    return {
      isValid: false,
      error: "Message content cannot be empty",
    };
  }

  // Check for excessive length
  if (content.length > 5000) {
    return {
      isValid: false,
      error: "Message content exceeds maximum length of 5000 characters",
    };
  }

  return { isValid: true };
};

export const detectAIMention = (content: string): { hasAIMention: boolean; cleanContent: string } => {
  const aiMentionRegex = /@b\s+/gi;
  const hasAIMention = aiMentionRegex.test(content);
  const cleanContent = content.replace(aiMentionRegex, '').trim();
  
  return { hasAIMention, cleanContent };
};

export const validateMessageAccess = (
  consultationId: string,
  userId: string,
  userRole: "patient" | "doctor"
): { hasAccess: boolean; error?: string } => {
  // This function would typically check against the consultation
  // For now, we'll return a basic validation structure
  if (!consultationId || !userId) {
    return {
      hasAccess: false,
      error: "Missing consultation ID or user ID",
    };
  }

  return { hasAccess: true };
};

export const sanitizeMessageContent = (content: string): string => {
  // Basic HTML sanitization - remove potentially dangerous tags
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};