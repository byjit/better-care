import { TRPCError } from "@trpc/server";
import type { Consultation, ConsultationStatus } from "../db/schema/consultation";
import type { UserRole } from "../db/schema";

export class ConsultationValidator {
    static validateAccess(consultation: Consultation, userId: string, userRole: UserRole) {
        if (userRole === "patient" && consultation.patientId === userId) {
            return;
        }

        if (userRole === "doctor" && consultation.doctorId === userId) {
            if (consultation.status === "inactive") {
                throw new TRPCError({ code: "FORBIDDEN", message: "Access denied: consultation is inactive" });
            }
            return;
        }

        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied: user not associated with this consultation" });
    }

    static validateStatusTransition(currentStatus: ConsultationStatus | null, newStatus: ConsultationStatus, userRole?: UserRole | null) {
        if (userRole !== "doctor") {
            throw new TRPCError({ code: "FORBIDDEN", message: "Only doctors can change consultation status" });
        }

        const validTransitions: Record<ConsultationStatus, ConsultationStatus[]> = {
            pending: ["active", "inactive"],
            active: ["inactive"],
            inactive: [],
        };

        if (!currentStatus || !validTransitions[currentStatus]?.includes(newStatus)) {
            throw new TRPCError({ code: "BAD_REQUEST", message: `Invalid status transition from ${currentStatus} to ${newStatus}` });
        }
    }

    static validateDoctorOperation(consultation: Consultation, doctorId: string, operation: "accept" | "reject" | "end") {
        if (consultation.doctorId !== doctorId) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Doctor is not assigned to this consultation" });
        }

        if (operation === "accept" && consultation.status !== "pending") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Can only accept pending consultations" });
        }
        if (operation === "reject" && consultation.status !== "pending") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Can only reject pending consultations" });
        }
        if (operation === "end" && consultation.status !== "active") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Can only end active consultations" });
        }
    }

    static validateReassignment(consultation: Consultation, requestingUserId: string, userRole?: string | null) {
        if (!userRole || userRole !== "patient" || consultation.patientId !== requestingUserId) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Only the patient can reassign a doctor" });
        }
        // Business rule: allow reassignment only for pending or inactive consultations
        if (consultation.status === "active") {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot reassign doctor for an active consultation" });
        }
    }
}

// Note: MessageValidator is not modified as it's out of scope of the request.
// I'm keeping it here as it was in the original file.
import { detectAIMention, sanitizeMessageContent, validateMessageAccess, validateMessageContent } from "@/db/schema";
export class MessageValidator {
  static validateContent(content: string) {
    return validateMessageContent(content);
  }

  static validateAccess(
    consultationId: string,
    userId: string,
    userRole: "patient" | "doctor"
  ) {
    return validateMessageAccess(consultationId, userId, userRole);
  }

  static processContent(content: string) {
    const sanitized = sanitizeMessageContent(content);
    const { hasAIMention, cleanContent } = detectAIMention(sanitized);
    
    return {
      sanitizedContent: sanitized,
      cleanContent,
      hasAIMention,
      isValid: this.validateContent(sanitized).isValid,
    };
  }
}

// Error types for consistent error handling
export enum ValidationErrorType {
  INVALID_INPUT = "INVALID_INPUT",
  ACCESS_DENIED = "ACCESS_DENIED",
  INVALID_TRANSITION = "INVALID_TRANSITION",
  CONSULTATION_NOT_FOUND = "CONSULTATION_NOT_FOUND",
  UNAUTHORIZED_OPERATION = "UNAUTHORIZED_OPERATION",
}
