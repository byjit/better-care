import { eq, and, inArray, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { consultation, user, type UserRole } from "../db/schema";
import { consultationInsertSchema, consultationStatusEnum, type ConsultationStatus } from "../db/schema/consultation";
import { ConsultationValidator } from "../lib/validation";
import { randomUUID } from "crypto";

export const consultationRouter = router({
  create: protectedProcedure
    .input(consultationInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { session: { user: currentUser } } = ctx;

      if (currentUser.role !== 'patient') {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only patients can create consultations." });
      }

      const doctor = await db.query.user.findFirst({
        where: and(eq(user.id, input.doctorId), eq(user.role, "doctor")),
      });

      if (!doctor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Selected doctor not found" });
      }

      const now = new Date();
      const consultationId = `consult_${randomUUID()}`;

      const [newConsultation] = await db
        .insert(consultation)
        .values({
          id: consultationId,
          patientId: currentUser.id,
          ...input,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      return newConsultation;
    }),

  getMyConsultations: protectedProcedure.query(async ({ ctx }) => {
    const { session: { user: currentUser } } = ctx;

    if (currentUser.role === "patient") {
      return db.query.consultation.findMany({
        where: eq(consultation.patientId, currentUser.id),
        with: { doctor: { columns: { name: true, image: true } } },
        orderBy: desc(consultation.updatedAt),
      });
    }

    // For doctors
    return db.query.consultation.findMany({
      where: and(
        eq(consultation.doctorId, currentUser.id),
        inArray(consultation.status, ["pending", "active"])
      ),
      with: { patient: { columns: { name: true, image: true } } },
      orderBy: desc(consultation.updatedAt),
    });
  }),

  getConsultationsByStatus: protectedProcedure
    .input(z.object({ statuses: z.array(z.enum(consultationStatusEnum)).min(1) }))
    .query(async ({ ctx, input }) => {
      const { session: { user: currentUser } } = ctx;
      if (currentUser.role !== 'doctor') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Only doctors can access this resource.' });
      }

      const consultations = await db.query.consultation.findMany({
        where: and(
          eq(consultation.doctorId, currentUser.id),
          inArray(consultation.status, input.statuses)
        ),
        with: { patient: { columns: { id: true, name: true, image: true } } },
        orderBy: desc(consultation.updatedAt)
        });

      return input.statuses.reduce((acc, status) => {
        acc[status] = consultations.filter(c => c.status === status);
        return acc;
      }, {} as Record<ConsultationStatus, (typeof consultations)>);
    }),

  acceptConsultation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session: { user: currentUser } } = ctx;

      const existingConsultation = await db.query.consultation.findFirst({ where: eq(consultation.id, input.id) });
      if (!existingConsultation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Consultation not found" });
      }

      ConsultationValidator.validateDoctorOperation(existingConsultation, currentUser.id, "accept");
      ConsultationValidator.validateStatusTransition(existingConsultation.status, "active", currentUser.role as UserRole);

      const [updatedConsultation] = await db
        .update(consultation)
        .set({ status: "active", updatedAt: new Date() })
        .where(eq(consultation.id, input.id))
        .returning();

      return updatedConsultation;
    }),

  updateConsultationStatus: protectedProcedure
    .input(z.object({ id: z.string(), action: z.enum(["reject", "end"]) }))
    .mutation(async ({ ctx, input }) => {
      const { session: { user: currentUser } } = ctx;

      const existingConsultation = await db.query.consultation.findFirst({ where: eq(consultation.id, input.id) });
      if (!existingConsultation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Consultation not found" });
      }

      ConsultationValidator.validateDoctorOperation(existingConsultation, currentUser.id, input.action);
      ConsultationValidator.validateStatusTransition(existingConsultation.status, "inactive", currentUser.role as UserRole);

      const [updatedConsultation] = await db
        .update(consultation)
        .set({ status: "inactive", updatedAt: new Date() })
        .where(eq(consultation.id, input.id))
        .returning();

      return updatedConsultation;
    }),

  reassignDoctor: protectedProcedure
    .input(z.object({ consultationId: z.string(), newDoctorId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session: { user: currentUser } } = ctx;

      const existingConsultation = await db.query.consultation.findFirst({ where: eq(consultation.id, input.consultationId) });
      if (!existingConsultation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Consultation not found" });
      }

      ConsultationValidator.validateReassignment(existingConsultation, currentUser.id, currentUser.role);

      const newDoctor = await db.query.user.findFirst({
        where: and(eq(user.id, input.newDoctorId), eq(user.role, "doctor")),
      });
      if (!newDoctor) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Selected new doctor not found" });
      }

      const [updatedConsultation] = await db
        .update(consultation)
        .set({
          doctorId: input.newDoctorId,
          status: "pending",
          updatedAt: new Date(),
        })
        .where(eq(consultation.id, input.consultationId))
        .returning();

      return updatedConsultation;
    }),

  getConsultationById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session: { user: currentUser } } = ctx;

      const result = await db.query.consultation.findFirst({
        where: eq(consultation.id, input.id),
        with: {
          patient: { columns: { name: true, image: true } },
          doctor: { columns: { name: true, image: true } },
        },
      });

      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Consultation not found" });
      }

      ConsultationValidator.validateAccess(result, currentUser.id, currentUser.role as UserRole);

      return result;
    }),
});
