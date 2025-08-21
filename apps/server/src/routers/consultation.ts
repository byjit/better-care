import { eq, and, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { consultation, user } from "../db/schema";
import { 
  createConsultationSchema,
  updateConsultationStatusSchema,
  consultationSelectSchema,
  validateConsultationAccess,
  validateConsultationStatusTransition,
  validateConsultationCreation,
  type Consultation,
  type ConsultationStatus
} from "../db/schema/consultation";
import { ConsultationValidator, ValidationErrorType } from "../lib/validation";

// Generate unique consultation ID
const generateConsultationId = () => {
  return `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const consultationRouter = router({
  // Patient operations
  create: protectedProcedure
    .input(createConsultationSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role as "patient" | "doctor";

      // Only patients can create consultations
      if (userRole !== "patient") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only patients can create consultations",
        });
      }

      // Validate consultation creation
      const validation = validateConsultationCreation(input, userId);
      if (!validation.isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validation.error || "Invalid consultation data",
        });
      }

      // Verify the selected doctor exists and has doctor role
      const selectedDoctor = await db
        .select()
        .from(user)
        .where(and(eq(user.id, input.doctorId), eq(user.role, "doctor")))
        .limit(1);

      if (selectedDoctor.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Selected doctor not found",
        });
      }

      const consultationId = generateConsultationId();
      const now = new Date();

      try {
        const newConsultation = await db
          .insert(consultation)
          .values({
            id: consultationId,
            patientId: userId,
            doctorId: input.doctorId,
            title: input.title,
            description: input.description,
            status: "pending",
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        return newConsultation[0];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create consultation",
        });
      }
    }),

  getMyConsultations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const userRole = ctx.session.user.role as "patient" | "doctor";

    try {
      let consultations: Consultation[];

      if (userRole === "patient") {
        // Patients can see all their consultations regardless of status
        consultations = await db
          .select()
          .from(consultation)
          .where(eq(consultation.patientId, userId))
          .orderBy(consultation.updatedAt);
      } else if (userRole === "doctor") {
        // Doctors can only see consultations they are assigned to and that are not inactive
        consultations = await db
          .select()
          .from(consultation)
          .where(
            and(
              eq(consultation.doctorId, userId),
              or(
                eq(consultation.status, "pending"),
                eq(consultation.status, "active")
              )
            )
          )
          .orderBy(consultation.updatedAt);
      } else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid user role",
        });
      }

      // Include patient and doctor information
      const consultationsWithUsers = await Promise.all(
        consultations.map(async (consult) => {
          const [patient, doctor] = await Promise.all([
            db.select({ id: user.id, name: user.name, image: user.image })
              .from(user)
              .where(eq(user.id, consult.patientId))
              .limit(1),
            consult.doctorId
              ? db.select({ id: user.id, name: user.name, image: user.image })
                  .from(user)
                  .where(eq(user.id, consult.doctorId))
                  .limit(1)
              : Promise.resolve([])
          ]);

          return {
            ...consult,
            patient: patient[0],
            doctor: doctor[0] || null,
          };
        })
      );

      return consultationsWithUsers;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch consultations",
      });
    }
  }),

  // Doctor operations
  getPendingConsultations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const userRole = ctx.session.user.role as "patient" | "doctor";

    // Only doctors can view pending consultations
    if (userRole !== "doctor") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only doctors can view pending consultations",
      });
    }

    try {
      const pendingConsultations = await db
        .select()
        .from(consultation)
        .where(
          and(
            eq(consultation.doctorId, userId),
            eq(consultation.status, "pending")
          )
        )
        .orderBy(consultation.createdAt);

      // Include patient information
      const consultationsWithPatients = await Promise.all(
        pendingConsultations.map(async (consult) => {
          const patient = await db
            .select({ id: user.id, name: user.name, image: user.image })
            .from(user)
            .where(eq(user.id, consult.patientId))
            .limit(1);

          return {
            ...consult,
            patient: patient[0],
          };
        })
      );

      return consultationsWithPatients;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch pending consultations",
      });
    }
  }),

  getActiveConsultations: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const userRole = ctx.session.user.role as "patient" | "doctor";

    // Only doctors can view active consultations
    if (userRole !== "doctor") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only doctors can view active consultations",
      });
    }

    try {
      const activeConsultations = await db
        .select()
        .from(consultation)
        .where(
          and(
            eq(consultation.doctorId, userId),
            eq(consultation.status, "active")
          )
        )
        .orderBy(consultation.updatedAt);

      // Include patient information
      const consultationsWithPatients = await Promise.all(
        activeConsultations.map(async (consult) => {
          const patient = await db
            .select({ id: user.id, name: user.name, image: user.image })
            .from(user)
            .where(eq(user.id, consult.patientId))
            .limit(1);

          return {
            ...consult,
            patient: patient[0],
          };
        })
      );

      return consultationsWithPatients;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch active consultations",
      });
    }
  }),

  acceptConsultation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role as "patient" | "doctor";

      // Only doctors can accept consultations
      if (userRole !== "doctor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only doctors can accept consultations",
        });
      }

      try {
        // Get the consultation
        const existingConsultation = await db
          .select()
          .from(consultation)
          .where(eq(consultation.id, input.id))
          .limit(1);

        if (existingConsultation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Consultation not found",
          });
        }

        const consult = existingConsultation[0];

        // Validate doctor access
        const doctorValidation = ConsultationValidator.validateDoctorOperation(
          consult,
          userId,
          userRole
        );
        if (!doctorValidation.isValid) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: doctorValidation.error || "Access denied",
          });
        }

        // Validate specific operation permission
        const operationValidation = ConsultationValidator.validateConsultationOperation(
          consult,
          userId,
          "accept"
        );
        if (!operationValidation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: operationValidation.error || "Cannot accept consultation",
          });
        }

        // Validate status transition
        const statusValidation = validateConsultationStatusTransition(
          consult.status as ConsultationStatus,
          "active"
        );
        if (!statusValidation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: statusValidation.error || "Invalid status transition",
          });
        }

        // Update consultation status to active
        const updatedConsultation = await db
          .update(consultation)
          .set({
            status: "active",
            updatedAt: new Date(),
          })
          .where(eq(consultation.id, input.id))
          .returning();

        return updatedConsultation[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to accept consultation",
        });
      }
    }),

  rejectConsultation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role as "patient" | "doctor";

      // Only doctors can reject consultations
      if (userRole !== "doctor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only doctors can reject consultations",
        });
      }

      try {
        // Get the consultation
        const existingConsultation = await db
          .select()
          .from(consultation)
          .where(eq(consultation.id, input.id))
          .limit(1);

        if (existingConsultation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Consultation not found",
          });
        }

        const consult = existingConsultation[0];

        // Validate doctor access
        const doctorValidation = ConsultationValidator.validateDoctorOperation(
          consult,
          userId,
          userRole
        );
        if (!doctorValidation.isValid) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: doctorValidation.error || "Access denied",
          });
        }

        // Validate specific operation permission
        const operationValidation = ConsultationValidator.validateConsultationOperation(
          consult,
          userId,
          "reject"
        );
        if (!operationValidation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: operationValidation.error || "Cannot reject consultation",
          });
        }

        // Validate status transition
        const statusValidation = validateConsultationStatusTransition(
          consult.status as ConsultationStatus,
          "inactive"
        );
        if (!statusValidation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: statusValidation.error || "Invalid status transition",
          });
        }

        // Update consultation status to inactive (rejected)
        const updatedConsultation = await db
          .update(consultation)
          .set({
            status: "inactive",
            updatedAt: new Date(),
          })
          .where(eq(consultation.id, input.id))
          .returning();

        return updatedConsultation[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reject consultation",
        });
      }
    }),

  endConsultation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role as "patient" | "doctor";

      // Only doctors can end consultations
      if (userRole !== "doctor") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only doctors can end consultations",
        });
      }

      try {
        // Get the consultation
        const existingConsultation = await db
          .select()
          .from(consultation)
          .where(eq(consultation.id, input.id))
          .limit(1);

        if (existingConsultation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Consultation not found",
          });
        }

        const consult = existingConsultation[0];

        // Validate doctor access
        const doctorValidation = ConsultationValidator.validateDoctorOperation(
          consult,
          userId,
          userRole
        );
        if (!doctorValidation.isValid) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: doctorValidation.error || "Access denied",
          });
        }

        // Validate specific operation permission
        const operationValidation = ConsultationValidator.validateConsultationOperation(
          consult,
          userId,
          "end"
        );
        if (!operationValidation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: operationValidation.error || "Cannot end consultation",
          });
        }

        // Validate status transition
        const statusValidation = validateConsultationStatusTransition(
          consult.status as ConsultationStatus,
          "inactive"
        );
        if (!statusValidation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: statusValidation.error || "Invalid status transition",
          });
        }

        // Update consultation status to inactive (ended)
        const updatedConsultation = await db
          .update(consultation)
          .set({
            status: "inactive",
            updatedAt: new Date(),
          })
          .where(eq(consultation.id, input.id))
          .returning();

        return updatedConsultation[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to end consultation",
        });
      }
    }),

  // Patient doctor reassignment (for rejected consultations)
  reassignDoctor: protectedProcedure
    .input(z.object({ 
      consultationId: z.string().min(1, "Consultation ID is required"),
      newDoctorId: z.string().min(1, "New doctor ID is required")
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role as "patient" | "doctor";

      // Only patients can reassign doctors
      if (userRole !== "patient") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only patients can reassign doctors",
        });
      }

      try {
        // Get the consultation
        const existingConsultation = await db
          .select()
          .from(consultation)
          .where(eq(consultation.id, input.consultationId))
          .limit(1);

        if (existingConsultation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Consultation not found",
          });
        }

        const consult = existingConsultation[0];

        // Validate reassignment
        const { validateDoctorReassignment } = require("../db/schema/consultation");
        const reassignmentValidation = validateDoctorReassignment(
          consult,
          input.newDoctorId,
          userId,
          userRole
        );
        if (!reassignmentValidation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: reassignmentValidation.error || "Cannot reassign doctor",
          });
        }

        // Verify the new doctor exists and has doctor role
        const newDoctor = await db
          .select()
          .from(user)
          .where(and(eq(user.id, input.newDoctorId), eq(user.role, "doctor")))
          .limit(1);

        if (newDoctor.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Selected doctor not found",
          });
        }

        // Update consultation with new doctor and reset to pending status
        const updatedConsultation = await db
          .update(consultation)
          .set({
            doctorId: input.newDoctorId,
            status: "pending",
            updatedAt: new Date(),
          })
          .where(eq(consultation.id, input.consultationId))
          .returning();

        return updatedConsultation[0];
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reassign doctor",
        });
      }
    }),

  // Shared operations
  getConsultationById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const userRole = ctx.session.user.role as "patient" | "doctor";

      try {
        // Get the consultation
        const existingConsultation = await db
          .select()
          .from(consultation)
          .where(eq(consultation.id, input.id))
          .limit(1);

        if (existingConsultation.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Consultation not found",
          });
        }

        const consult = existingConsultation[0];

        // Validate access
        const accessValidation = validateConsultationAccess(
          consult,
          userId,
          userRole
        );
        if (!accessValidation.hasAccess) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: accessValidation.error || "Access denied",
          });
        }

        // Include patient and doctor information
        const [patient, doctor] = await Promise.all([
          db.select({ id: user.id, name: user.name, image: user.image })
            .from(user)
            .where(eq(user.id, consult.patientId))
            .limit(1),
          consult.doctorId
            ? db.select({ id: user.id, name: user.name, image: user.image })
                .from(user)
                .where(eq(user.id, consult.doctorId))
                .limit(1)
            : Promise.resolve([])
        ]);

        return {
          ...consult,
          patient: patient[0],
          doctor: doctor[0] || null,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch consultation",
        });
      }
    }),
});