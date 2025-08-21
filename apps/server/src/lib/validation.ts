import { z } from "zod";
import type { 
  Consultation, 
  ConsultationStatus, 
  CreateConsultation
} from "../db/schema/consultation";
import { 
  validateConsultationStatusTransition,
  validateConsultationAccess,
  validateConsultationCreation,
  validateDoctorAssignment,
  validateDoctorOperationPermission,
  canDoctorAccessConsultation,
  shouldConsultationAppearInDoctorSidebar,
  getConsultationStatusTransitions
} from "../db/schema/consultation";
import { 
  validateMessageContent,
  validateMessageAccess,
  sanitizeMessageContent,
  detectAIMention
} from "../db/schema/message";

// Combined validation schemas for API endpoints
export const consultationOperationSchema = z.object({
  consultationId: z.string().min(1, "Consultation ID is required"),
  userId: z.string().min(1, "User ID is required"),
  userRole: z.enum(["patient", "doctor"]),
});

export const statusTransitionSchema = z.object({
  consultationId: z.string().min(1, "Consultation ID is required"),
  currentStatus: z.enum(["pending", "active", "inactive"]),
  newStatus: z.enum(["pending", "active", "inactive"]),
  userId: z.string().min(1, "User ID is required"),
  userRole: z.enum(["patient", "doctor"]),
});

export const messageOperationSchema = z.object({
  consultationId: z.string().min(1, "Consultation ID is required"),
  content: z.string().min(1, "Message content is required"),
  userId: z.string().min(1, "User ID is required"),
  userRole: z.enum(["patient", "doctor"]),
});

export const doctorReassignmentOperationSchema = z.object({
  consultationId: z.string().min(1, "Consultation ID is required"),
  newDoctorId: z.string().min(1, "New doctor ID is required"),
  requestingUserId: z.string().min(1, "Requesting user ID is required"),
  userRole: z.enum(["patient", "doctor"]),
});

export const doctorConsultationOperationSchema = z.object({
  consultationId: z.string().min(1, "Consultation ID is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  operation: z.enum(["accept", "reject", "end", "view"]),
});

// Types
export type ConsultationOperation = z.infer<typeof consultationOperationSchema>;
export type StatusTransition = z.infer<typeof statusTransitionSchema>;
export type MessageOperation = z.infer<typeof messageOperationSchema>;
export type DoctorReassignmentOperation = z.infer<typeof doctorReassignmentOperationSchema>;
export type DoctorConsultationOperation = z.infer<typeof doctorConsultationOperationSchema>;

// Comprehensive validation functions
export class ConsultationValidator {
  static validateAccess(
    consultation: Consultation,
    userId: string,
    userRole: "patient" | "doctor"
  ) {
    return validateConsultationAccess(consultation, userId, userRole);
  }

  static validateStatusTransition(
    currentStatus: ConsultationStatus,
    newStatus: ConsultationStatus,
    userRole: "patient" | "doctor"
  ) {
    // Only doctors can change consultation status
    if (userRole !== "doctor") {
      return {
        isValid: false,
        error: "Only doctors can change consultation status",
      };
    }

    return validateConsultationStatusTransition(currentStatus, newStatus);
  }

  static validateCreation(data: CreateConsultation, patientId: string) {
    return validateConsultationCreation(data, patientId);
  }

  static validateDoctorOperation(
    consultation: Consultation,
    userId: string,
    userRole: "patient" | "doctor"
  ) {
    if (userRole !== "doctor") {
      return {
        isValid: false,
        error: "Operation restricted to doctors only",
      };
    }

    if (consultation.doctorId !== userId) {
      return {
        isValid: false,
        error: "Doctor not assigned to this consultation",
      };
    }

    if (consultation.status === "inactive") {
      return {
        isValid: false,
        error: "Cannot perform operations on inactive consultations",
      };
    }

    return { isValid: true };
  }

  static validateDoctorAssignment(
    consultation: Consultation,
    doctorId: string,
    operation: "accept" | "reject" | "end"
  ) {
    const { validateDoctorOperationPermission } = require("../db/schema/consultation");
    return validateDoctorOperationPermission(consultation, doctorId, operation);
  }

  static validateDoctorReassignment(
    consultation: Consultation,
    newDoctorId: string,
    requestingUserId: string,
    userRole: "patient" | "doctor"
  ) {
    const { validateDoctorReassignment } = require("../db/schema/consultation");
    return validateDoctorReassignment(consultation, newDoctorId, requestingUserId, userRole);
  }

  static canReassignDoctor(consultation: Consultation) {
    const { canReassignDoctor } = require("../db/schema/consultation");
    return canReassignDoctor(consultation);
  }

  static validateConsultationOperation(
    consultation: Consultation,
    doctorId: string,
    operation: "accept" | "reject" | "end" | "view"
  ) {
    const { validateDoctorConsultationOperation } = require("../db/schema/consultation");
    return validateDoctorConsultationOperation(consultation, doctorId, operation);
  }

  static canDoctorAccessConsultation(
    consultation: Consultation,
    doctorId: string
  ) {
    const { canDoctorAccessConsultation } = require("../db/schema/consultation");
    return canDoctorAccessConsultation(consultation, doctorId);
  }

  static shouldShowInDoctorSidebar(
    consultation: Consultation,
    doctorId: string
  ) {
    const { shouldConsultationAppearInDoctorSidebar } = require("../db/schema/consultation");
    return shouldConsultationAppearInDoctorSidebar(consultation, doctorId);
  }
}

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

  static validateMessageOperation(operation: MessageOperation) {
    const contentValidation = this.validateContent(operation.content);
    if (!contentValidation.isValid) {
      return contentValidation;
    }

    const accessValidation = this.validateAccess(
      operation.consultationId,
      operation.userId,
      operation.userRole
    );
    if (!accessValidation.hasAccess) {
      return {
        isValid: false,
        error: accessValidation.error,
      };
    }

    return { isValid: true };
  }
}

// Utility functions for common validation patterns
export const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRole = (role: string): role is "patient" | "doctor" => {
  return role === "patient" || role === "doctor";
};

// Error types for consistent error handling
export enum ValidationErrorType {
  INVALID_INPUT = "INVALID_INPUT",
  ACCESS_DENIED = "ACCESS_DENIED",
  INVALID_TRANSITION = "INVALID_TRANSITION",
  CONSULTATION_NOT_FOUND = "CONSULTATION_NOT_FOUND",
  UNAUTHORIZED_OPERATION = "UNAUTHORIZED_OPERATION",
}

export interface ValidationError {
  type: ValidationErrorType;
  message: string;
  field?: string;
}

export const createValidationError = (
  type: ValidationErrorType,
  message: string,
  field?: string
): ValidationError => ({
  type,
  message,
  field,
});