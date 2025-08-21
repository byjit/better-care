import { eq, desc, and } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { message, consultation, user } from "../db/schema";
import { createId } from '@paralleldrive/cuid2';

const sendMessageSchema = z.object({
  consultationId: z.string(),
  content: z.string().min(1, "Message content is required"),
  messageType: z.enum(["user", "ai"]).default("user"),
});

export const messageRouter = router({
  getMessages: protectedProcedure
    .input(z.object({ consultationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user has access to this consultation
      const consultationData = await db
        .select()
        .from(consultation)
        .where(eq(consultation.id, input.consultationId))
        .limit(1);

      if (consultationData.length === 0) {
        throw new Error("Consultation not found");
      }

      const consultationItem = consultationData[0];
      
      if (
        consultationItem.patientId !== userId && 
        consultationItem.doctorId !== userId
      ) {
        throw new Error("You don't have access to this consultation");
      }

      // Get messages with sender information
      const messages = await db
        .select({
          id: message.id,
          consultationId: message.consultationId,
          senderId: message.senderId,
          content: message.content,
          messageType: message.messageType,
          createdAt: message.createdAt,
          senderName: user.name,
          senderRole: user.role,
        })
        .from(message)
        .leftJoin(user, eq(message.senderId, user.id))
        .where(eq(message.consultationId, input.consultationId))
        .orderBy(message.createdAt);

      return messages;
    }),

  sendMessage: protectedProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Verify user has access to this consultation
      const consultationData = await db
        .select()
        .from(consultation)
        .where(eq(consultation.id, input.consultationId))
        .limit(1);

      if (consultationData.length === 0) {
        throw new Error("Consultation not found");
      }

      const consultationItem = consultationData[0];
      
      if (
        consultationItem.patientId !== userId && 
        consultationItem.doctorId !== userId
      ) {
        throw new Error("You don't have access to this consultation");
      }

      // Only allow messaging in active consultations
      if (consultationItem.status !== "active") {
        throw new Error("Can only send messages in active consultations");
      }

      const messageId = createId();
      
      const newMessage = await db
        .insert(message)
        .values({
          id: messageId,
          consultationId: input.consultationId,
          senderId: userId,
          content: input.content,
          messageType: input.messageType,
          createdAt: new Date(),
        })
        .returning();

      // Get the message with sender information
      const messageWithSender = await db
        .select({
          id: message.id,
          consultationId: message.consultationId,
          senderId: message.senderId,
          content: message.content,
          messageType: message.messageType,
          createdAt: message.createdAt,
          senderName: user.name,
          senderRole: user.role,
        })
        .from(message)
        .leftJoin(user, eq(message.senderId, user.id))
        .where(eq(message.id, messageId))
        .limit(1);

      return messageWithSender[0];
    }),
});
