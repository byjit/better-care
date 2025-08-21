import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
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

// Base schemas
export const consultationSelectSchema = createSelectSchema(consultation);
export const consultationInsertSchema = createInsertSchema(consultation, {
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
    status: z.enum(consultationStatusEnum).optional(),
});
export const consultationUpdateSchema = createUpdateSchema(consultation);

// Specialized schemas for different operations
export const createConsultationSchema = consultationInsertSchema.omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true,
}).extend({
    doctorId: z.string().min(1, "Doctor selection is required"),
});

export const updateConsultationStatusSchema = z.object({
    id: z.string().min(1, "Consultation ID is required"),
    status: z.enum(consultationStatusEnum),
});

export const consultationAccessSchema = z.object({
    consultationId: z.string().min(1, "Consultation ID is required"),
    userId: z.string().min(1, "User ID is required"),
    userRole: z.enum(["patient", "doctor"]),
});

export const doctorReassignmentSchema = z.object({
    consultationId: z.string().min(1, "Consultation ID is required"),
    newDoctorId: z.string().min(1, "New doctor ID is required"),
    requestingUserId: z.string().min(1, "Requesting user ID is required"),
    userRole: z.enum(["patient", "doctor"]),
});

export const doctorOperationSchema = z.object({
    consultationId: z.string().min(1, "Consultation ID is required"),
    doctorId: z.string().min(1, "Doctor ID is required"),
    operation: z.enum(["accept", "reject", "end", "view"]),
});

// Types
export type Consultation = z.infer<typeof consultationSelectSchema>;
export type NewConsultation = z.infer<typeof consultationInsertSchema>;
export type ConsultationUpdate = z.infer<typeof consultationUpdateSchema>;
export type CreateConsultation = z.infer<typeof createConsultationSchema>;
export type UpdateConsultationStatus = z.infer<typeof updateConsultationStatusSchema>;
export type ConsultationAccess = z.infer<typeof consultationAccessSchema>;
export type DoctorReassignment = z.infer<typeof doctorReassignmentSchema>;
export type DoctorOperation = z.infer<typeof doctorOperationSchema>;

// Validation functions
export const validateConsultationStatusTransition = (
    currentStatus: ConsultationStatus,
    newStatus: ConsultationStatus
): { isValid: boolean; error?: string } => {
    const validTransitions: Record<ConsultationStatus, ConsultationStatus[]> = {
        pending: ["active", "inactive"],
        active: ["inactive"],
        inactive: [], // No transitions allowed from inactive
    };

    const allowedTransitions = validTransitions[currentStatus];
    
    if (!allowedTransitions.includes(newStatus)) {
        return {
            isValid: false,
            error: `Invalid status transition from ${currentStatus} to ${newStatus}`,
        };
    }

    return { isValid: true };
};

export const validateConsultationAccess = (
    consultation: Consultation,
    userId: string,
    userRole: "patient" | "doctor"
): { hasAccess: boolean; error?: string } => {
    // Patients have access to all their consultations regardless of status
    if (userRole === "patient" && consultation.patientId === userId) {
        return { hasAccess: true };
    }

    // Doctors only have access to consultations they are assigned to
    if (userRole === "doctor" && consultation.doctorId === userId) {
        // Doctors lose access to inactive consultations
        if (consultation.status === "inactive") {
            return {
                hasAccess: false,
                error: "Access denied: consultation is inactive",
            };
        }
        return { hasAccess: true };
    }

    return {
        hasAccess: false,
        error: "Access denied: user not associated with this consultation",
    };
};

export const validateConsultationCreation = (
    data: CreateConsultation,
    patientId: string
): { isValid: boolean; error?: string } => {
    // Validate that patient is not trying to assign themselves as doctor
    if (data.doctorId === patientId) {
        return {
            isValid: false,
            error: "Patient cannot assign themselves as the doctor",
        };
    }

    // Additional validation can be added here
    return { isValid: true };
};

// Doctor assignment validation functions
export const validateDoctorAssignment = (
    consultation: Consultation,
    doctorId: string
): { isValid: boolean; error?: string } => {
    // Check if consultation is in a state that allows doctor assignment
    if (consultation.status !== "pending") {
        return {
            isValid: false,
            error: "Doctor can only be assigned to pending consultations",
        };
    }

    // Check if doctor is already assigned
    if (consultation.doctorId && consultation.doctorId !== doctorId) {
        return {
            isValid: false,
            error: "Consultation already has a different doctor assigned",
        };
    }

    return { isValid: true };
};

export const validateDoctorOperationPermission = (
    consultation: Consultation,
    doctorId: string,
    operation: "accept" | "reject" | "end"
): { isValid: boolean; error?: string } => {
    // Check if doctor is assigned to this consultation
    if (consultation.doctorId !== doctorId) {
        return {
            isValid: false,
            error: "Doctor is not assigned to this consultation",
        };
    }

    // Validate operation based on current status
    switch (operation) {
        case "accept":
            if (consultation.status !== "pending") {
                return {
                    isValid: false,
                    error: "Can only accept pending consultations",
                };
            }
            break;
        case "reject":
            if (consultation.status !== "pending") {
                return {
                    isValid: false,
                    error: "Can only reject pending consultations",
                };
            }
            break;
        case "end":
            if (consultation.status !== "active") {
                return {
                    isValid: false,
                    error: "Can only end active consultations",
                };
            }
            break;
        default:
            return {
                isValid: false,
                error: "Invalid operation",
            };
    }

    return { isValid: true };
};

// Consultation status management functions
export const getConsultationStatusTransitions = (
    currentStatus: ConsultationStatus
): ConsultationStatus[] => {
    const validTransitions: Record<ConsultationStatus, ConsultationStatus[]> = {
        pending: ["active", "inactive"],
        active: ["inactive"],
        inactive: [], // No transitions allowed from inactive
    };

    return validTransitions[currentStatus] || [];
};

// Doctor assignment management functions
export const canReassignDoctor = (
    consultation: Consultation
): { canReassign: boolean; reason?: string } => {
    // Can only reassign if consultation is pending
    if (consultation.status !== "pending") {
        return {
            canReassign: false,
            reason: "Can only reassign doctor for pending consultations",
        };
    }

    return { canReassign: true };
};

export const validateDoctorReassignment = (
    consultation: Consultation,
    newDoctorId: string,
    requestingUserId: string,
    userRole: "patient" | "doctor"
): { isValid: boolean; error?: string } => {
    // Only patients can reassign doctors to their own consultations
    if (userRole !== "patient") {
        return {
            isValid: false,
            error: "Only patients can reassign doctors",
        };
    }

    // Patient must own the consultation
    if (consultation.patientId !== requestingUserId) {
        return {
            isValid: false,
            error: "Patient can only reassign doctors for their own consultations",
        };
    }

    // Check if consultation can be reassigned
    const reassignCheck = canReassignDoctor(consultation);
    if (!reassignCheck.canReassign) {
        return {
            isValid: false,
            error: reassignCheck.reason,
        };
    }

    // Cannot assign the same doctor
    if (consultation.doctorId === newDoctorId) {
        return {
            isValid: false,
            error: "Cannot reassign to the same doctor",
        };
    }

    return { isValid: true };
};

// Enhanced doctor operation validation
export const validateDoctorConsultationOperation = (
    consultation: Consultation,
    doctorId: string,
    operation: "accept" | "reject" | "end" | "view"
): { isValid: boolean; error?: string } => {
    // Check if doctor is assigned to this consultation
    if (consultation.doctorId !== doctorId) {
        return {
            isValid: false,
            error: "Doctor is not assigned to this consultation",
        };
    }

    // Validate operation based on current status and operation type
    switch (operation) {
        case "accept":
            if (consultation.status !== "pending") {
                return {
                    isValid: false,
                    error: "Can only accept pending consultations",
                };
            }
            break;
        case "reject":
            if (consultation.status !== "pending") {
                return {
                    isValid: false,
                    error: "Can only reject pending consultations",
                };
            }
            break;
        case "end":
            if (consultation.status !== "active") {
                return {
                    isValid: false,
                    error: "Can only end active consultations",
                };
            }
            break;
        case "view":
            if (consultation.status === "inactive") {
                return {
                    isValid: false,
                    error: "Cannot view inactive consultations",
                };
            }
            break;
        default:
            return {
                isValid: false,
                error: "Invalid operation",
            };
    }

    return { isValid: true };
};

export const canDoctorAccessConsultation = (
    consultation: Consultation,
    doctorId: string
): { canAccess: boolean; reason?: string } => {
    // Doctor must be assigned to the consultation
    if (consultation.doctorId !== doctorId) {
        return {
            canAccess: false,
            reason: "Doctor is not assigned to this consultation",
        };
    }

    // Doctor cannot access inactive consultations
    if (consultation.status === "inactive") {
        return {
            canAccess: false,
            reason: "Cannot access inactive consultations",
        };
    }

    return { canAccess: true };
};

export const shouldConsultationAppearInDoctorSidebar = (
    consultation: Consultation,
    doctorId: string
): boolean => {
    // Only show consultations assigned to this doctor
    if (consultation.doctorId !== doctorId) {
        return false;
    }

    // Only show pending and active consultations
    return consultation.status === "pending" || consultation.status === "active";
};

// Import message here to avoid circular dependency issues
import { message } from "./message";