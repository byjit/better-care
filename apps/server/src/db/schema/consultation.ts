import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { z } from "zod";
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';
import { user } from "./user";

export const consultationStatusEnum = ["pending", "active", "inactive"] as const;
export type ConsultationStatus = (typeof consultationStatusEnum)[number];

export const consultation = sqliteTable("consultation", {
  id: text("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => user.id),
  doctorId: text("doctor_id").references(() => user.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status", { enum: consultationStatusEnum }).default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const messageTypeEnum = ["user", "ai"] as const;
export type MessageType = (typeof messageTypeEnum)[number];

export const message = sqliteTable("message", {
  id: text("id").primaryKey(),
  consultationId: text("consultation_id").notNull().references(() => consultation.id),
  senderId: text("sender_id").references(() => user.id), // Made nullable for AI messages
  content: text("content").notNull(),
  messageType: text("message_type", { enum: messageTypeEnum }).default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const consultationSelectSchema = createSelectSchema(consultation);
export const consultationInsertSchema = createInsertSchema(consultation);
export const consultationUpdateSchema = createUpdateSchema(consultation);

export const messageSelectSchema = createSelectSchema(message);
export const messageInsertSchema = createInsertSchema(message);
export const messageUpdateSchema = createUpdateSchema(message);

export type Consultation = z.infer<typeof consultationSelectSchema>;
export type NewConsultation = z.infer<typeof consultationInsertSchema>;
export type ConsultationUpdate = z.infer<typeof consultationUpdateSchema>;

export type Message = z.infer<typeof messageSelectSchema>;
export type NewMessage = z.infer<typeof messageInsertSchema>;
export type MessageUpdate = z.infer<typeof messageUpdateSchema>;
