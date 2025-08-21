import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { user } from "./user";
import { message } from "./message";

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

// Relations
export const consultationRelations = relations(consultation, ({ one, many }) => ({
  patient: one(user, {
    fields: [consultation.patientId],
    references: [user.id],
    relationName: "patient_consultations",
  }),
  doctor: one(user, {
    fields: [consultation.doctorId],
    references: [user.id],
    relationName: "doctor_consultations",
  }),
  messages: many(message),
}));

// Schemas
export const consultationSchema = createSelectSchema(consultation);
export const consultationInsertSchema = createInsertSchema(consultation, {
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    doctorId: z.string().min(1, "Doctor ID is required"),
}).omit({
    id: true,
    patientId: true,
    createdAt: true,
    updatedAt: true,
    status: true,
});

// Types
export type Consultation = z.infer<typeof consultationSchema>;
export type NewConsultation = z.infer<typeof consultationInsertSchema>;
