import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { z } from "zod";
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod';

export const userRoleEnum = ["patient", "doctor"] as const;
export type UserRole = (typeof userRoleEnum)[number];

export const patientMetadataSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z.string(),
  sex: z.enum(["male", "female", "other"]),
});

export const doctorMetadataSchema = z.object({
  name: z.string().min(1),
  dateOfBirth: z.string(),
  sex: z.enum(["male", "female", "other"]),
  specialization: z.string().min(1),
  licenseNumber: z.string().optional(),
  experience: z.number().min(0).optional(),
});

export const metadataSchema = z.union([patientMetadataSchema, doctorMetadataSchema]);
export type Metadata = z.infer<typeof metadataSchema>;

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
  image: text("image"),
  role: text("role", { enum: userRoleEnum }).notNull().default("patient"),
  onboard: integer("onboard", { mode: "boolean" }).notNull().default(true),
  metadata: text('metadata', { mode: "json" }).$type<Metadata>(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const userSelectSchema = createSelectSchema(user, {
  metadata: metadataSchema,
});
export const userInsertSchema = createInsertSchema(user, {
  metadata: metadataSchema,
});
export const userUpdateSchema = createUpdateSchema(user, {
  metadata: metadataSchema,
});

export const userRelations = relations(user, ({ many }) => ({
  patientConsultations: many(consultation, { relationName: "patient_consultations" }),
  doctorConsultations: many(consultation, { relationName: "doctor_consultations" }),
  messages: many(message),
}));

export type User = z.infer<typeof userSelectSchema>;
export type NewUser = z.infer<typeof userInsertSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;

// Import consultation and message here to avoid circular dependency issues
import { consultation } from "./consultation";
import { message } from "./message";