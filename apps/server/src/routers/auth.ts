import { eq } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";
import { db } from "../db";
import { user, userUpdateSchema } from "../db/schema";
import type { Session } from "../lib/auth";


export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session as Session;
  }),
  
  updateRole: protectedProcedure
    .input(userUpdateSchema.pick({
      role: true,
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      
      await db
        .update(user)
        .set({ role: input.role })
        .where(eq(user.id, userId));
      
      // Return updated user data
      const updatedUser = await db
        .select()
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);
      
      return updatedUser[0];
    }),

  completeOnboarding: protectedProcedure
    .input(userUpdateSchema.pick({
      role: true,
      metadata: true,
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const updatedUser = await db
        .update(user)
        .set({
          role: input.role,
          metadata: input.metadata,
          onboard: false,
          name: input.metadata.name,
        })
        .where(eq(user.id, userId))
        .returning();

      return updatedUser[0];
    }),
});