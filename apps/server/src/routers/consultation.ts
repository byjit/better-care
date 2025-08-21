import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { consultation, consultationInsertSchema, user } from "../db/schema";
import { createId } from '@paralleldrive/cuid2';

const createConsultationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
});

export const consultationRouter = router({
  // Patient operations
  create: protectedProcedure
    .input(createConsultationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify user is a patient
      const currentUser = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      
      if (!currentUser[0] || currentUser[0].role !== 'patient') {
        throw new Error("Only patients can create consultations");
      }

      const consultationId = createId();
      
      const newConsultation = await db
        .insert(consultation)
        .values({
          id: consultationId,
          patientId: userId,
          title: input.title,
          description: input.description,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return newConsultation[0];
    }),

  getMyConsultations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    
    const userConsultations = await db
      .select({
        id: consultation.id,
        title: consultation.title,
        description: consultation.description,
        status: consultation.status,
        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
        patientId: consultation.patientId,
        doctorId: consultation.doctorId,
      })
      .from(consultation)
      .where(
        eq(consultation.patientId, userId)
      );

    return userConsultations;
  }),

  // Doctor operations
  getPendingConsultations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    
    // Verify user is a doctor
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    
    if (!currentUser[0] || currentUser[0].role !== 'doctor') {
      throw new Error("Only doctors can view pending consultations");
    }

    const pendingConsultations = await db
      .select({
        id: consultation.id,
        title: consultation.title,
        description: consultation.description,
        status: consultation.status,
        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
        patientId: consultation.patientId,
        patientName: user.name,
      })
      .from(consultation)
      .leftJoin(user, eq(consultation.patientId, user.id))
      .where(eq(consultation.status, "pending"));

    return pendingConsultations;
  }),

  getActiveConsultations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    
    // Verify user is a doctor
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    
    if (!currentUser[0] || currentUser[0].role !== 'doctor') {
      throw new Error("Only doctors can view active consultations");
    }

    const activeConsultations = await db
      .select({
        id: consultation.id,
        title: consultation.title,
        description: consultation.description,
        status: consultation.status,
        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
        patientId: consultation.patientId,
        patientName: user.name,
      })
      .from(consultation)
      .leftJoin(user, eq(consultation.patientId, user.id))
      .where(
        and(
          eq(consultation.status, "active"),
          eq(consultation.doctorId, userId)
        )
      );

    return activeConsultations;
  }),

  acceptConsultation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify user is a doctor
      const currentUser = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      
      if (!currentUser[0] || currentUser[0].role !== 'doctor') {
        throw new Error("Only doctors can accept consultations");
      }

      const updatedConsultation = await db
        .update(consultation)
        .set({
          doctorId: userId,
          status: "active",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(consultation.id, input.id),
            eq(consultation.status, "pending")
          )
        )
        .returning();

      if (updatedConsultation.length === 0) {
        throw new Error("Consultation not found or already accepted");
      }

      return updatedConsultation[0];
    }),

  rejectConsultation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify user is a doctor
      const currentUser = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      
      if (!currentUser[0] || currentUser[0].role !== 'doctor') {
        throw new Error("Only doctors can reject consultations");
      }

      const updatedConsultation = await db
        .update(consultation)
        .set({
          status: "inactive",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(consultation.id, input.id),
            eq(consultation.status, "pending")
          )
        )
        .returning();

      if (updatedConsultation.length === 0) {
        throw new Error("Consultation not found or already processed");
      }

      return updatedConsultation[0];
    }),

  endConsultation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      // Verify user is a doctor
      const currentUser = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      
      if (!currentUser[0] || currentUser[0].role !== 'doctor') {
        throw new Error("Only doctors can end consultations");
      }

      const updatedConsultation = await db
        .update(consultation)
        .set({
          status: "inactive",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(consultation.id, input.id),
            eq(consultation.doctorId, userId),
            eq(consultation.status, "active")
          )
        )
        .returning();

      if (updatedConsultation.length === 0) {
        throw new Error("Consultation not found or you don't have permission to end it");
      }

      return updatedConsultation[0];
    }),

  // Shared operations
  getConsultationById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      const consultationData = await db
        .select({
          id: consultation.id,
          title: consultation.title,
          description: consultation.description,
          status: consultation.status,
          createdAt: consultation.createdAt,
          updatedAt: consultation.updatedAt,
          patientId: consultation.patientId,
          doctorId: consultation.doctorId,
        })
        .from(consultation)
        .where(eq(consultation.id, input.id))
        .limit(1);

      if (consultationData.length === 0) {
        throw new Error("Consultation not found");
      }

      const consultationItem = consultationData[0];
      
      // Check if user has access to this consultation
      if (
        consultationItem.patientId !== userId && 
        consultationItem.doctorId !== userId
      ) {
        throw new Error("You don't have access to this consultation");
      }

      return consultationItem;
    }),
});
